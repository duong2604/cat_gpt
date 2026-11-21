# SE-023 — Tạo lại: nhất quán dữ liệu khi thay câu trả lời (B10-M1)

Trạng thái: Done — PR #52 → `83704bc` (21/11/2026 22:27)
Người phụ trách: Senior Dev · Ưu tiên: P1 (MAJOR — CTO nâng mức 21/11/2026) · Ước lượng: thiết kế 0,25 ngày; triển khai theo phương án được duyệt
Phụ thuộc: không chặn. Không trì hoãn SE-005 quá hạn 27/11
Hạn bàn giao review: thiết kế 22/11/2026 · Hạn hoàn tất: Không đặt — theo phương án được duyệt
Chốt: 21/11/2026 — CTO Review Verdict SE-022, mục "Follow-up bắt buộc / B10-M1"
SHA cơ sở: `origin/develop` @ `86b9f3f`
Liên quan: [báo cáo Chat](../reports/chat-module-structural-review.md) mục 8.7, 9 · F03 (PARTIAL)

## Vấn đề [CODE]
`ChatService.saveAnswer` (`apps/api/src/modules/chat/chat.service.ts` @ `86b9f3f`) khi Tạo lại thành công thực hiện **hai thao tác ghi độc lập**: `createMessage(câu mới)` → `deleteMessage(câu cũ)` → `touch`. MongoDB lỗi (mất kết nối, timeout, failover) hoặc tiến trình dừng **giữa** hai lệnh → hội thoại có 2 câu trả lời liên tiếp. Hệ quả: `regenerate` đọc 2 tin cuối (`recentMessages(…, 2)`), thấy `ASSISTANT, ASSISTANT` → `400 CHAT_NOTHING_TO_REGENERATE` mãi mãi cho hội thoại đó; lịch sử gửi LLM chứa 2 câu trả lời. Không có cơ chế tự phục hồi. Codebase hiện **không** dùng transaction MongoDB.

## Giai đoạn 1 — Phân tích (SE bàn giao thiết kế, KHÔNG code)
Đề xuất **ít nhất một** phương án an toàn (khuyến khích so sánh 2–3), mỗi phương án đánh giá:
1. **Atomicity:** trạng thái nào người dùng/DB có thể thấy nếu lỗi ở từng bước; có tạo trạng thái trung gian nhìn thấy được không.
2. **Concurrency:** tương tác với khóa `inFlight`, Dừng, xóa hội thoại giữa chừng, 2 tab.
3. **Retry:** thao tác có idempotent không; retry ở đâu, bao nhiêu lần, có thể gây ghi đôi không.
4. **Failure recovery:** dữ liệu đã lỡ hỏng (2 câu trả lời) được xử lý thế nào khi đọc/Tạo lại lần sau.
5. **Ràng buộc:** không đổi schema, không đổi API contract (route, mã lỗi, hình dạng SSE `meta/delta/done/error`, `MessageDto`); nếu phương án cần đổi `id` câu trả lời hoặc `createdAt` — nêu rõ tác động tới web (`chat-stream-provider.tsx`: `regenerate` ẩn câu cũ, `done` → `appendMessage`).
6. **Yêu cầu hạ tầng:** ví dụ transaction cần replica set — kiểm môi trường dev/demo/loadtest có đáp ứng không (bằng chứng, không suy đoán).
7. **Cách TL failure-injection được** (vd biến môi trường/điểm lỗi tạm trong bản build kiểm thử, hoặc ngắt Mongo) — chỉ trên DB `cat_gpt_loadtest`.

Hướng gợi ý để SE đánh giá (không bắt buộc chọn): (a) transaction MongoDB bao `create + delete + touch`; (b) ghi một tài liệu — cập nhật tại chỗ tin cũ thành nội dung mới (một lệnh, nguyên tử theo document); (c) phục hồi phía đọc — `regenerate` coi mọi tin `ASSISTANT` sau tin `USER` cuối là câu cần thay; (d) kết hợp.

Bàn giao giai đoạn 1: mục "Thiết kế" trong file này (hoặc tài liệu riêng dẫn link) + đề xuất phương án chọn; trạng thái giữ `Đang làm`, báo TL.

## Giai đoạn 2 — Triển khai (chỉ sau khi TL duyệt thiết kế)
PR riêng `fix/api-regenerate-consistency` từ `develop` mới nhất; **không** gộp B10-M2 (SE-024) hay refactor cấu trúc.

## Không được thay đổi
Schema `messages`/`conversations`; API contract; chính sách bảo mật; `inFlight` trong bộ nhớ; hành vi SE-F9 (Dừng/lỗi khi Tạo lại → câu cũ còn, `done` mang câu cũ).

## Checklist nghiệm thu (giai đoạn 2)
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Lỗi Mongo ở bất kỳ bước nào của việc thay câu trả lời không để lại trạng thái làm hỏng Tạo lại/lịch sử (theo phương án duyệt) | TL failure injection trên `cat_gpt_loadtest` |
| AC2 | Dữ liệu đã lỡ có 2 câu trả lời liên tiếp được xử lý (nếu phương án có phục hồi) | TL dựng dữ liệu hỏng trên `cat_gpt_loadtest` |
| AC3 | Không đổi API contract/schema | Đọc diff + `f03-verify` |
| AC4 | Hồi quy Chat: `f03-verify` 15/15, `rag-runtime` 12/12, race 200+409 | Kịch bản TL |
| AC5 | typecheck/lint/build, test hiện có, CI | Lệnh + CI |

## Thiết kế

### Bằng chứng môi trường (kiểm 21/11/2026, chỉ đọc + một giao dịch hủy)
- Cụm Atlas `cat_gpt_loadtest`: `hello` có `setName` và 3 host (replica set), MongoDB 8.0.39.
- Giao dịch hoạt động: `withTransaction` chèn 1 tài liệu rồi ném lỗi → tài liệu không còn (rollback đúng). Collection thử đã xóa.
- Local dev: không có dịch vụ Mongo trong `docker-compose.yml`; mọi môi trường dùng Atlas (quyết định D-03). Không có môi trường nào chạy Mongo đơn lẻ.
- Dữ liệu hiện có: 0 hội thoại có hai câu trả lời liên tiếp — `cat_gpt` (28 hội thoại, 58 tin) và `cat_gpt_loadtest` (433 hội thoại, 866 tin). Đếm chỉ đọc.
- Web (`chat-stream-provider.tsx`): `regenerate` xóa câu trả lời cuối khỏi cache **trước** khi gửi yêu cầu; `done` → `appendMessage` bỏ qua tin có `id` đã tồn tại. Tức là khi `id` giữ nguyên, câu mới vẫn hiện vì cache đã bỏ câu cũ.
- Chỉ mục `messages`: `{_id: 1}`, `{conversationId: 1, createdAt: 1}` (thứ tự hiển thị theo `createdAt`).

### Vấn đề gốc
`saveAnswer` (thành công khi Tạo lại) gồm ba lệnh ghi độc lập: `createMessage(câu mới)` → `deleteMessage(câu cũ)` → `touch`. Lỗi giữa `createMessage` và `deleteMessage` để lại hai câu trả lời liên tiếp. Hệ quả: `regenerate` lần sau tìm tin cuối là ASSISTANT, xóa một câu, rồi tin cuối vẫn là ASSISTANT → `400 CHAT_NOTHING_TO_REGENERATE` (vĩnh viễn, theo B10-M1); lịch sử gửi LLM có hai câu trả lời.

### Phương án
**A — Giao dịch MongoDB** bao `createMessage` + `deleteMessage` + `touch` trong một `session`.
1. Nguyên tử: commit toàn bộ hoặc không gì. Người đọc không thấy trạng thái trung gian (đọc commit). Lỗi trước commit → câu cũ còn nguyên.
2. Đồng thời: `inFlight` không đổi (trong tiến trình). Xóa hội thoại song song: `touch` không khớp → cần xử lý như `exists=false` (bỏ qua, không `done`). Hai tab: như hiện tại, `inFlight` chỉ chặn trong một tiến trình.
3. Thử lại: `withTransaction` tự thử lại lỗi tạm thời và chạy lại callback; callback chỉ thao tác DB, không có tác dụng phụ bên ngoài. Id câu mới phải sinh **trước** callback để chạy lại không tạo trùng.
4. Phục hồi: không cần khi lỗi trong giao dịch (rollback). Dữ liệu đã hỏng từ trước: hiện 0 bản ghi; nếu có thì cần bước phục hồi phía đọc (xem C).
5. Hạ tầng: đáp ứng (replica set Atlas, giao dịch đã kiểm). Nhược: `ConversationsService` phải nhận `session` tùy chọn ở `createMessage`/`deleteMessage`/`touch` (thay đổi nội bộ, không đổi HTTP).
6. Web: câu mới có `id` mới; web vẫn chạy như hiện tại. Không đổi.

**B — Cập nhật tại chỗ câu trả lời cũ** (đề xuất): một lệnh `updateOne({_id: câuCũ, conversationId}, {$set: {content, status, model, citations, insufficientEvidence, ungrounded}, $unset: các trường không dùng})`, sau đó `touch` riêng.
1. Nguyên tử theo tài liệu: một tài liệu hoặc là câu cũ hoặc là câu mới. **Không thể** có hai câu trả lời, nên không cần giao dịch; không có trạng thái trung gian.
2. Đồng thời: như A. Xóa hội thoại song song → `matchedCount = 0` → coi như `exists=false`: không gửi `done`.
3. Thử lại: `updateOne` với cùng nội dung là idempotent → có thể thử lại an toàn; `touch` lỗi chỉ làm sai `lastMessageAt`, không ảnh hưởng dữ liệu câu trả lời.
4. Phục hồi: lỗi trước `updateOne` → câu cũ còn nguyên (SE-F9 giữ). Lỗi sau `updateOne` nhưng trước `touch` → câu mới đã lưu, chỉ thời gian hội thoại cũ; không cần phục hồi.
5. Hạ tầng: không cần replica set; không cần giao dịch. Chỉ thêm một phương thức `replaceAnswer` trong `ConversationsService`.
6. Web: **giữ nguyên `id`**. Cần kiểm: `regenerate` đã xóa câu cũ khỏi cache trước (đã đúng hiện tại), nên `done` mang cùng `id` vẫn được `appendMessage` thêm. Trường hợp Dừng/lỗi: `done` mang câu cũ (cùng `id`), vẫn được thêm lại như hiện tại. Hạn chế: tab khác đang giữ bản cũ trong cache thấy nội dung cũ đến khi tải lại (A có hạn chế tương tự — tab khác thấy cả hai câu đến khi tải lại).
7. `createdAt`: giữ nguyên (thứ tự hiển thị không đổi vì câu cũ luôn là tin cuối khi Tạo lại).

**C — Phục hồi phía đọc** (không ngăn lỗi mới; chỉ dùng cho dữ liệu hỏng cũ): trong `regenerate` và khi dựng lịch sử LLM, coi các tin ASSISTANT liên tiếp sau tin USER cuối là một, giữ tin mới nhất (`createdAt`, `_id`), xóa phần còn lại.
- Ưu: không đụng ghi; tự phục hồi. Nhược: không ngăn lỗi tái diễn; lịch sử LLM cần khử trùng lặp ở `send()` nữa.

**Kết hợp đề xuất:** B (ngăn lỗi tận gốc, không phụ thuộc hạ tầng). C không cần làm ngay vì dữ liệu hỏng hiện là 0; ghi là phương án dự phòng nếu bằng chứng sau này cho thấy có dữ liệu hỏng.

So sánh nhanh:

| Tiêu chí | A (giao dịch) | B (cập nhật tại chỗ) | C (đọc) |
|---|---|---|---|
| Hai câu trả lời có thể xảy ra | Không (rollback) | Không (một tài liệu) | Có, được dọn lúc đọc |
| Phụ thuộc hạ tầng | Replica set (đã có) | Không | Không |
| Đổi `id` câu trả lời | Có | Không | Không |
| Thay đổi mã | `ConversationsService` (session) + `saveAnswer` | Một phương thức + `saveAnswer` | `regenerate`, lịch sử LLM |
| Thử lại an toàn | Có (callback chạy lại) | Có (idempotent) | — |

### Kiểm lỗi (TL failure-injection) — trên `cat_gpt_loadtest`
- Điểm tiêm lỗi: một bản build thử (nhánh riêng, không merge) có biến `SE023_FAULT` (chỉ đọc khi `RELEASE_MODE` không phải `production`) ném lỗi tại: (1) trước ghi; (2) sau ghi câu mới, trước `touch`; (3) giữa `touch` và `done`.
- Kỳ vọng với B: (1) câu cũ còn, Tạo lại lần sau hoạt động; (2) câu mới hiện, `lastMessageAt` cũ; (3) `done` không gửi, tải lại thấy câu mới.
- Kỳ vọng với A: (1)(2) rollback về câu cũ; (3) như trên.
- Ngắt Mongo thật: không làm được trên Atlas dùng chung; dùng điểm tiêm lỗi thay thế.
- Dữ liệu hỏng để kiểm AC2: TL tạo bằng cách chèn trực tiếp một tin ASSISTANT thứ hai vào hội thoại thử (chỉ `cat_gpt_loadtest`); chỉ cần kiểm nếu chọn C.

### Ràng buộc đã kiểm
Không đổi schema (`messages` giữ nguyên trường và chỉ mục); không đổi route, mã lỗi, hình dạng SSE; `inFlight` giữ nguyên; SE-F9 giữ nguyên (Dừng/lỗi khi Tạo lại → câu cũ còn, `done` mang câu cũ).

### Đề xuất cần TL duyệt
Chọn **B**. Nếu TL muốn tránh thay đổi nội dung câu trả lời tại chỗ, chọn **A**. Sau khi duyệt, triển khai trong `fix/api-regenerate-consistency` từ develop mới nhất; SE-024 (B10-M2) không gộp.

## Kết quả review
21/11/2026 22:27 — TL review PR #52 (`4a78d11`) đạt, merge `83704bc`. B10-M1 đóng.

## Lịch sử review
### Thiết kế giai đoạn 1 — TL review (commit `64db43c`) — **DUYỆT phương án B, có điều kiện** (21/11/2026)
| Tiêu chí | Kết quả | Bằng chứng TL tự kiểm |
|---|---|---|
| ≥1 phương án an toàn, đủ 4 khía cạnh (atomicity, concurrency, retry, recovery) | Đạt | A/B/C, bảng so sánh; B loại bỏ trạng thái 2 câu trả lời vì chỉ ghi một tài liệu |
| Hạ tầng có bằng chứng | Đạt | SE: replica set 3 host, MongoDB 8.0.39, giao dịch rollback đúng; B không phụ thuộc |
| Tác động web khi giữ `id` | Đạt | `apps/web/src/features/chat/hooks.ts:56-63` `appendMessage` bỏ qua `id` đã có; `chat-stream-provider.tsx` `regenerate` xóa câu cũ khỏi cache **trước** → `done` cùng `id` vẫn được thêm |
| `createdAt` | Đạt (chấp nhận giữ) | `message.schema.ts:32` `timestamps: { createdAt: true }` (Mongoose quản lý); UI chat không hiển thị `createdAt` (grep `components/*.tsx`); thứ tự không đổi vì câu bị thay luôn là tin cuối |
| Dữ liệu hỏng hiện có | Đạt | SE đếm chỉ đọc: 0/28 (`cat_gpt`), 0/433 (`cat_gpt_loadtest`) → C không làm |
| Không đổi schema/contract/SE-F9 | Đạt | Thiết kế không thêm trường/chỉ mục; route, mã lỗi, SSE giữ |

**Quyết định:** chọn **B**. Không làm A (đổi `id`, phải truyền `session` qua `ConversationsService` mà không thêm bảo đảm so với B). Không làm C (0 bản ghi hỏng; B không còn tạo ra trạng thái này) — mở lại nếu có bằng chứng dữ liệu hỏng.

**Điều kiện triển khai (PR `fix/api-regenerate-consistency` từ `develop` mới nhất):**
1. `ConversationsService.replaceAnswer(id, conversationId, fields)` — **một** `updateOne({ _id, conversationId, role: ASSISTANT }, { $set, $unset })`; trả `matchedCount > 0`.
2. `$set` `content`, `status`; các trường tùy chọn (`model`, `citations`, `insufficientEvidence`, `ungrounded`) — có trong câu mới thì `$set`, **không có thì `$unset`** (vd câu từ chối không có `model`; câu thường thay câu từ chối phải bỏ `insufficientEvidence`). Viết tường minh, không dựng động từ object bất kỳ.
3. Không đụng `createdAt`, `userId`, `role`.
4. `saveAnswer`: có `replacing` + COMPLETED/TRUNCATED → `replaceAnswer`; `matchedCount = 0` (hội thoại/câu bị xóa song song) → không gửi `done`, giống `exists=false`. `done` mang tin đã cập nhật (đọc lại hoặc dựng từ `replacing` + `fields` — chọn một, ghi lý do trong PR). Không có `replacing` → `createMessage` như cũ. Bỏ `deleteMessage` nếu không còn ai dùng.
5. **Không** thêm vòng thử lại (YAGNI); lỗi ghi → event `error` như hiện tại, câu cũ còn.
6. Không gộp SE-024; không refactor ngoài phạm vi.

**Failure injection:** nhánh thử riêng (vd `test/se023-fault`, **không mở PR, không merge**), biến `SE023_FAULT` chỉ ở bản thử đó; điểm (1) trước `replaceAnswer`, (2) sau `replaceAnswer` trước `touch`, (3) sau `touch` trước `done`. TL tự chạy trên `cat_gpt_loadtest`. Kỳ vọng như thiết kế mục "Kỳ vọng với B".

**AC bổ sung:** `rag-runtime` 12/12 (kiểm `$unset model` ở câu từ chối thay câu thường) và thêm ca câu thường thay câu từ chối (`insufficientEvidence` phải mất).

Trạng thái: giữ **Đang làm** — giai đoạn 2 (code) được phép.


### PR #52 — TL review vòng 1 (SHA `4a78d11`, base `86b9f3f`) — **Đạt, đã merge `83704bc`**
| Tiêu chí | Kết quả | Bằng chứng TL tự kiểm |
|---|---|---|
| Đúng thiết kế B + 6 điều kiện | Đạt | `replaceAnswer`: một `updateOne({_id, conversationId, role: ASSISTANT}, {$set, $unset})`, trả `matchedCount > 0`; `citations`/`insufficientEvidence`/`ungrounded` có → `$set`, không → `$unset`; không đụng `createdAt`/`userId`/`role`; `matchedCount = 0` → không `done`; `deleteMessage` đã gỡ (grep `apps/api/src`: 0); không retry |
| Lệch: `model` thiếu → `$set null` (không `$unset`) | **Chấp nhận** | Schema `model` mặc định `null`; `createMessage` cũng lưu `null` cho câu từ chối → dữ liệu thay tại chỗ giống dữ liệu tạo mới |
| `done` dựng từ tin cũ + trường vừa ghi | Chấp nhận | Không có ghi đồng thời vào tin này (khóa `inFlight`); f03/rag-runtime: `done.id` = tin cuối đã lưu |
| Spec | Đạt | Chỉ thay `deleteMessage` → `replaceAnswer` trong bản giả `FakeConversationsService` (theo API service mới); 0 `it`/`describe` thêm; 83/83 |
| AC1 failure injection (nhánh `test/se023-fault` `9293bad`, không merge) | **Đạt 12/12** | `se023-fault.mjs`, DB `cat_gpt_loadtest`, câu cũ `STOPPED`: (1) lỗi trước ghi → câu cũ nguyên vẹn, `lastMessageAt` không đổi; (2) sau ghi trước `touch` → câu mới `COMPLETED`, `lastMessageAt` chưa đổi; (3) sau `touch` trước `done` → câu mới, `lastMessageAt` đổi. Cả 3: client nhận `error`, **số tin không đổi, USER/ASSISTANT xen kẽ, cùng `id`** — không bao giờ 2 câu trả lời |
| AC2 phục hồi | Đạt 3/3 | Bản thường (`4a78d11`): Tạo lại 3 hội thoại vừa bị tiêm lỗi → `done COMPLETED`, vẫn 1 câu trả lời. (Phương án C không làm — 0 dữ liệu hỏng) |
| AC3 contract/schema | Đạt | Diff 3 tệp, không đổi schema/route/mã lỗi/SSE |
| AC4 hồi quy | Đạt | `f03-verify` 15/15; `rag-runtime` 14/14 (setup 2, insufficient 5, **câu thường thay câu từ chối 2** — có `model`, mất `insufficientEvidence`, truy hồi lỗi 5) |
| AC5 build/test/CI | Đạt | 4/4, 0 cảnh báo, 83/83; CI pass tại `4a78d11` |
| Merge | Đạt | `gh pr merge 52 --merge --match-head-commit 4a78d11…` → **`83704bc`** (22:27); CI `develop` @ `83704bc`: success |

## Phản hồi UI
Không áp dụng.
