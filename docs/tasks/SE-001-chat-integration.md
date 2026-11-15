# SE-001 — Tích hợp luồng Chat từ preview

Trạng thái: Chờ Review
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 2 ngày làm việc (1,5 tích hợp + kiểm tra; 0,5 giới hạn theo người dùng)
Phụ thuộc: không còn phụ thuộc chặn — [TL-001](TL-001-chat-integration-scope.md) đã duyệt, Q3 đã chốt (15/11/2026)
Hạn bàn giao review: **18/11/2026** (dự kiến 17/11) · Hạn hoàn tất: **19/11/2026** (mốc demo dự kiến 20/11 — [plan mục 2](../project/plan.md#2-mốc))
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 · hoàn tất —
Chốt: 15/11/2026 (khách hàng duyệt TL-001 và Q3; demo dùng phản hồi mẫu; giữ Module 3–4 ở preview)
SHA cơ sở: `origin/develop` @ `9c426f2` (cập nhật từ `a860437` — `develop` chỉ có thêm commit tài liệu giữa lúc đó và lúc nhận task, không đổi `apps/`; xem `git diff --stat a860437 origin/develop`) · nguồn: `origin/preview/module-2-4-demo` @ `b2a4b22d40804f246c8505e66bad9e7a2b483ca4`
PR: https://github.com/duong2604/cat_gpt/pull/2 (nhắm `develop`) · SHA đầu PR `8238926`

> **Phản hồi của trợ lý trong task này là nội dung giả lập** (`MockLlmProvider`, model `mock-1`): chọn ngẫu nhiên từ các câu trả lời mẫu, không liên quan câu hỏi. Việc chạy dần từng phần là streaming thật từ máy chủ. Khách hàng đã chốt (15/11/2026): demo đầu tiên dùng phản hồi mẫu; AI thật không thuộc task này.

## Mục tiêu
Người dùng đăng nhập trên bản `develop` dùng được màn Trò chuyện: gửi tin nhắn, thấy phản hồi hiện dần, dừng, tạo lại và mở lại lịch sử — mà không kéo theo giao diện demo Tài liệu / Hỏi đáp tài liệu (Module 3–4).

## Output
- PR từ `feature/module-2-chat` (nhánh local đã có, đang ở SHA cơ sở) vào `develop`.
- Code: 3 commit cherry-pick từ preview + phần chép tay P1–P3 + giới hạn 20 tin/phút/người.
- Tài liệu: [module-2-chat.md](../design/module-2-chat.md) cập nhật trạng thái, mục 5.2 theo tên file thực tế, mục 8 đánh dấu, mục 9 ghi việc đã làm; `README.md` sửa trạng thái Module 2.

## Phạm vi
- **Làm:**
  1. `git cherry-pick -x 6a301c3 653a4b0 8db5547`; bỏ `ask: "/ask"` trong `apps/web/src/lib/routes.ts`.
  2. Chép tay từ `d2d1ac1` đúng P1, P2, P3 ở [TL-001 mục 3](TL-001-chat-integration-scope.md#3-phát-hiện-mới-chat-phụ-thuộc-vào-commit-demo-d2d1ac1) (chuỗi dịch Chat, bố cục toàn màn hình chỉ cho `/chat`, bỏ nhãn "Đang phát triển" của mục Chat).
  3. Giới hạn 20 tin/phút **theo người dùng** cho `POST /chat/stream` và `POST /conversations/:id/regenerate` theo [Basic Design 4.6](../design/module-2-chat.md#46-giới-hạn-tần-suất) (khoảng trống G1 của TL-001).
  4. Cập nhật tài liệu như mục Output.
- **Không làm (loại trừ):**
  - Mọi phần Module 3–4 của `d2d1ac1`: `features/ask`, `features/documents`, route `/ask`, trang `/documents` mới, mục thanh bên "Hỏi đáp tài liệu", namespace `ask`, xóa `coming-soon.tsx` / `common.comingSoon`.
  - `docs/ket-qua-tam-thoi.md` (`b2a4b22`).
  - LLM thật, biến `LLM_PROVIDER` (G2), sửa tin nhắn, AI đặt tiêu đề, chọn model ([module-2-chat 2.3](../design/module-2-chat.md#23-để-sau-ngoài-phạm-vi-module-2)).
  - Sửa code Module 1; merge nhánh preview.

## Nguồn yêu cầu
- Yêu cầu/quyết định đã duyệt: yêu cầu khách hàng 15/11/2026 (chuẩn bị demo Chat, checklist UI: gửi, phản hồi từng phần, dừng, tạo lại, mở lại lịch sử; phản hồi giả lập); phạm vi [TL-001](TL-001-chat-integration-scope.md) (sau khi duyệt); [Q3 của TL-001](TL-001-chat-integration-scope.md#quyết-định-còn-mở) (đã chốt 15/11/2026).
- Function Spec: [module-2-chat.md mục 2](../design/module-2-chat.md#2-phạm-vi) (phạm vi bắt buộc 2.1, nên có 2.2), [mục 3](../design/module-2-chat.md#3-câu-hỏi-cần-sinh-viên-xác-nhận) (đề xuất mặc định — **đã duyệt** qua Q3 ngày 15/11/2026).
- Basic Design: [4.2 dữ liệu](../design/module-2-chat.md#42-dữ-liệu-mongodb), [4.3 API](../design/module-2-chat.md#43-api-prefix-apiv1), [4.4 SSE](../design/module-2-chat.md#44-giao-thức-sse), [4.5 đầu chờ LLM](../design/module-2-chat.md#45-đầu-chờ-llm), [4.6 giới hạn](../design/module-2-chat.md#46-giới-hạn-tần-suất), [5.1 route](../design/module-2-chat.md#51-route), [5.3 hành vi](../design/module-2-chat.md#53-hành-vi-chính), [mục 8 checklist](../design/module-2-chat.md#8-checklist-nghiệm-thu).

## Checklist nghiệm thu
Kiểm tra trên `pnpm dev` của nhánh PR, đăng nhập tài khoản admin trong `apps/api/.env`, http://localhost:3000.

| # | Tiêu chí | Nguồn (yêu cầu / FS / BD) | Cách kiểm tra |
|---|---|---|---|
| AC1 | **Gửi tin nhắn:** ở `/chat`, gửi câu hỏi → tạo hội thoại mới, URL đổi sang `/chat/<id>`, hội thoại xuất hiện đầu danh sách với tiêu đề lấy từ tin nhắn đầu | FS 2.1; BD 4.3, 5.1; mục 8 dòng 1 | UI: mở `/chat` → gõ câu hỏi → Enter |
| AC2 | **Phản hồi xuất hiện từng phần** qua giao diện (không dồn tới cuối mới hiện); nút Gửi thành Dừng khi đang trả lời | Yêu cầu 15/11; FS 2.1; BD 4.4, 5.3; mục 8 dòng 2 | UI + DevTools Network: `POST /api/v1/chat/stream` kiểu `text/event-stream`, nhiều sự kiện `delta`; ghi số `delta` và thời gian |
| AC3 | **Dừng:** bấm Dừng giữa chừng → chữ ngừng, phần đã sinh giữ lại với nhãn "Đã dừng"; tải lại trang vẫn còn | FS 2.2; BD 4.4 bước 6; mục 8 dòng 3 | UI; đối chiếu `GET /api/v1/conversations/:id/messages` có `status: "STOPPED"` |
| AC4 | **Tạo lại và sao chép:** Tạo lại thay câu trả lời cuối bằng câu mới (chạy dần); Sao chép dán ra đúng nội dung | FS 2.2; BD 4.3; mục 8 dòng 4 | UI |
| AC5 | **Mở lại lịch sử:** tải lại trang, hoặc đăng xuất rồi đăng nhập lại, chọn hội thoại cũ → thấy đủ tin nhắn; đổi tên, xóa (có xác nhận), tìm kiếm, nhóm theo thời gian hoạt động | FS 2.1, 2.2; BD 4.3, 5.1; mục 8 dòng 5–6 | UI |
| AC6 | Không truy cập được hội thoại của người dùng khác → `CONVERSATION_NOT_FOUND` (404), giao diện báo "Không tìm thấy cuộc trò chuyện" | BD 4.2; mục 8 dòng 7 | Tạo user thử ở `/admin/users`; mở `/chat/<id của admin>` bằng user thử; curl kèm cookie user thử. Xóa user/dữ liệu thử sau khi kiểm tra |
| AC7 | Tin nhắn > 4.000 ký tự bị chặn; gửi quá 20 tin/phút **theo người dùng** bị 429 với thông báo đã dịch vi/en; user khác cùng IP không bị ảnh hưởng | FS mục 3 câu 9; BD 4.6; mục 8 dòng 8 | UI bộ đếm ký tự; script gửi 21 request `POST /chat/stream` bằng 2 user cùng máy |
| AC8 | Lỗi từ LLM: gửi tin có `/error` → câu trả lời có nhãn lỗi, bấm Tạo lại được | BD 4.4 bước 7, 4.5 | UI |
| AC9 | **Không kéo theo Module 3–4:** đủ các kiểm tra ở [TL-001 mục 7](TL-001-chat-integration-scope.md#7-kiểm-tra-chống-kéo-theo-module-34-đưa-vào-se-001-ac9); thanh bên không có "Hỏi đáp tài liệu"; `/documents` vẫn "Đang phát triển"; `/ask` → 404 | TL-001; audit Q2 | Lệnh `git diff --name-only`, `git grep` + UI |
| AC10 | Giao diện tối, màn hình hẹp (~375px, danh sách hội thoại dạng Sheet), tiếng Anh | BD 5.1, 5.3; mục 8 dòng 9 | UI |
| AC11 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt; PR không chứa thay đổi ngoài phạm vi | Quy ước repo; mục 8 dòng 10 | Chạy lệnh; `git diff --stat origin/develop...HEAD` |
| AC12 | Tài liệu: `module-2-chat.md` (trạng thái; mục 3 ghi "đã chốt 15/11/2026 theo Q3 của TL-001"; 5.2, mục 8, mục 9) và `README.md` (trạng thái Module 2) khớp code; ghi rõ phản hồi là giả lập | Quy tắc `CLAUDE.md` | Đọc diff tài liệu |

**Checklist UI dự kiến cho khách hàng** (TL gửi ở [TL-002](TL-002-chat-demo-acceptance.md) sau khi tích hợp; nội dung trả lời là văn bản mẫu):
- [ ] Mở `/chat` → bấm một câu gợi ý hoặc gõ câu hỏi rồi Enter → câu trả lời hiện dần từng cụm chữ, nút Gửi đổi thành Dừng.
- [ ] Mở `/chat` → gửi câu hỏi, bấm Dừng khi chữ đang chạy → chữ ngừng, có nhãn "Đã dừng"; tải lại trang vẫn còn.
- [ ] Trong hội thoại vừa có → bấm Tạo lại ở câu trả lời cuối → câu trả lời mới chạy dần thay câu cũ.
- [ ] Tải lại trang hoặc đăng xuất rồi đăng nhập lại → chọn hội thoại ở cột trái → thấy đủ câu hỏi và câu trả lời cũ.

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q3 | (từ TL-001) Xác nhận đề xuất mặc định mục 3 Module 2 làm yêu cầu đã duyệt, và đưa giới hạn 20 tin/phút/người vào task này | Đồng ý cả hai | Đồng ý — khách hàng, 15/11/2026 |

## Kết quả review
Senior Dev bàn giao vòng 1 ngày 15/11/2026, PR #2 nhắm `develop`, SHA đầu PR `8238926`. Chờ TL review.

## Lịch sử review

### Checklist vòng 1
**Task** — SE-001 · PR https://github.com/duong2604/cat_gpt/pull/2 · SHA đầu PR `8238926` · vòng 1
**Kết quả** — Tích hợp Chat (Module 2) vào `develop`: 3 commit cherry-pick từ preview (shared types, API SSE + mock LLM, UI chat) không đổi; chép tay chuỗi dịch + bố cục toàn màn hình + bỏ nhãn "Đang phát triển" của mục Chat (3 phần này nằm trong commit demo Module 3–4 nên không cherry-pick riêng được); thêm giới hạn 20 tin/phút/người (độc lập với bucket IP 120 req/phút chung); cập nhật `module-2-chat.md` và `README.md`.
**Checklist**
- [x] AC1 Gửi tin nhắn tạo hội thoại mới, URL đổi `/chat/<id>`, tiêu đề lấy từ tin nhắn đầu — Đạt — UI: gửi "Xin chao, ban co the gioi thieu ve CAT GPT khong?" → URL chuyển `/chat/6af96c7947e11402c14b325e`, hội thoại lên đầu danh sách với tiêu đề đúng câu hỏi
- [x] AC2 Phản hồi xuất hiện từng phần, nút Gửi thành Dừng khi đang trả lời — Đạt — UI: 2 ảnh chụp cách nhau 1s cho thấy nội dung markdown tăng dần (tiêu đề → danh sách), nút chuyển thành ô vuông Dừng trong lúc stream
- [x] AC3 Dừng giữa chừng giữ nhãn "Đã dừng", tải lại trang vẫn còn — Đạt — UI: bấm Dừng khi đang stream → nhãn "Đã dừng" xuất hiện kèm nội dung dở dang; tải lại trang (`navigate` lại cùng URL) vẫn thấy đúng nhãn và nội dung đó
- [x] AC4 Tạo lại thay câu trả lời cuối; Sao chép — Đạt — UI: bấm "Tạo lại câu trả lời" → câu trả lời cũ bị xóa, hiện "..." rồi stream câu trả lời mới (mẫu khác); bấm nút Sao chép không báo lỗi console
- [x] AC5 Mở lại lịch sử; đổi tên; xóa (xác nhận); tìm kiếm; nhóm theo thời gian — Đạt — UI: đổi tên → toast "Đã đổi tên cuộc trò chuyện."; tìm "email" → danh sách chỉ còn hội thoại khớp; xóa → dialog xác nhận "Xóa cuộc trò chuyện? ... bị xóa vĩnh viễn" → toast "Đã xóa cuộc trò chuyện."; nhóm "Hôm nay" / "30 ngày trước" hiển thị đúng
- [x] AC6 Không truy cập được hội thoại của user khác → `CONVERSATION_NOT_FOUND` (404) — Đạt — Tạo user thử `se001.test@catgpt.local` ở `/admin/users`, đăng nhập user này, mở `/chat/<id của admin>`: UI hiện "Conversation not found / It may have been deleted.", network `GET /api/v1/conversations/<id>` → 404 và `GET .../messages` → 404 (không phải 403); đã xóa dữ liệu thử sau khi kiểm tra (xóa hội thoại test, khóa tài khoản thử vì hệ thống chưa có xóa cứng user)
- [x] AC7 Giới hạn 4.000 ký tự và 20 tin/phút/người; user khác cùng IP không ảnh hưởng — Đạt — `curl` với cookie jar riêng cho từng user trên cùng máy: 21 request `POST /chat/stream` liên tiếp của user thử → 20 request đầu `200`, request 21 `429` (`{"code":"TOO_MANY_REQUESTS","message":"Too many requests"}`, FE dịch qua `errors.TOO_MANY_REQUESTS`); ngay sau đó admin (user khác, cùng máy/IP) gửi vẫn `200`; tin nhắn 4001 ký tự → `400 VALIDATION_FAILED` (`details.content:["maxLength"]`)
- [x] AC8 Lỗi LLM (`/error`) có nhãn lỗi, Tạo lại được — Đạt — UI: gửi `/error` → nhãn đỏ "Lỗi khi tạo câu trả lời" (en: "Failed to generate answer"), nút Tạo lại vẫn hoạt động
- [x] AC9 Không kéo theo Module 3–4 — Đạt — `git diff --name-only origin/develop...HEAD` không có `features/ask`, `features/documents`, `app/(app)/ask`, `app/(app)/documents`, `coming-soon.tsx`, `docs/ket-qua-tam-thoi.md`; `git grep '"/ask"\|ask:' -- apps/web/src/lib/routes.ts` và tìm key `ask` trong `messages/*.json` đều rỗng; UI: thanh bên chỉ có Trò chuyện/Tài liệu (nhãn "Đang phát triển")/Người dùng, `/documents` vẫn trang giữ chỗ
- [x] AC10 Giao diện tối, tiếng Anh — Đạt — UI: dark mode là mặc định trong suốt phiên kiểm tra; chuyển ngôn ngữ EN → toàn bộ nhãn dịch đúng (nav, nhóm hội thoại, lỗi, placeholder, hint phím tắt). Màn hình hẹp (~375px, danh sách dạng `Sheet`) — **chưa xác minh bằng ảnh chụp**: công cụ `resize_window` không đổi được kích thước cửa sổ trình duyệt trong môi trường kiểm tra này; xác nhận qua code `chat-layout.tsx` (Sheet + breakpoint `md`, không chỉnh sửa trong PR này, giữ nguyên từ preview) — TL hoặc khách hàng có thể tự thử bằng cách thu nhỏ cửa sổ trình duyệt
- [x] AC11 `pnpm build`/`typecheck`/`lint` đạt; PR không chứa thay đổi ngoài phạm vi — Đạt — `pnpm build` 3/3, `pnpm typecheck` 4/4, `pnpm lint` 3/3 (API 0 cảnh báo/0 lỗi trên 67 file); `git diff --stat origin/develop...HEAD` chỉ gồm 3 commit cherry-pick + 3 commit của PR này (packages/shared, apps/api/chat+llm, apps/web/chat UI, docs)
- [x] AC12 Tài liệu khớp code — Đạt — `module-2-chat.md`: trạng thái "Đã tích hợp", mục 3 ghi "Đã chốt 15/11/2026 theo Q3 của TL-001", 4.6 mô tả đúng `ChatThrottlerGuard`, 5.2 đổi theo tên file thực tế, mục 8 đánh dấu đạt, mục 9 ghi việc đã làm, có ghi rõ phản hồi là giả lập; `README.md` Module 2 → "Hoàn thành"

**Kiểm tra đã chạy** — `pnpm build`; `pnpm typecheck`; `pnpm lint`; `pnpm dev` (UI thủ công qua trình duyệt, tài khoản `admin@catgpt.local`); tạo + xóa tài khoản thử `se001.test@catgpt.local`; `curl` kiểm tra AC6/AC7 với cookie jar riêng từng user; `git diff --stat`, `git grep` cho AC9/AC11. `pnpm --filter @cat-gpt/api test`: repo chưa có file `*.spec.ts` nào (kể cả Module 1) — không phải do PR này, không chạy được.
**Trạng thái** — Chờ Review

#### Review vòng 1
Chưa có — chờ TL.

## Phản hồi UI
Chưa có.
