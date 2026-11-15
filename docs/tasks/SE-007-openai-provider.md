# SE-007 — Tích hợp OpenAI cho Chat (Responses API, streaming)

Trạng thái: Done
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: Không. **Không đổi bản demo 20/11** (máy trình chiếu chạy `34b465d`; `LLM_PROVIDER` mặc định `mock`). Merge theo quyết định của TL ([workflow 9.2](../project/workflow.md#92-điều-kiện-chặn-merge) điều 5)
Hạn bàn giao review: Chờ chốt · Hạn hoàn tất: Chờ chốt
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 (vòng 1, vòng 2) · hoàn tất 16/11/2026
Chốt: 15/11/2026 — khách hàng giao trực tiếp (yêu cầu "Triển khai task tích hợp OpenAI cho CAT GPT"); task lập theo yêu cầu đó, TL rà phạm vi khi nghiệm thu
SHA cơ sở: `origin/develop` @ `796367c`
PR: https://github.com/duong2604/cat_gpt/pull/4 (nhắm `develop`) · SHA đầu PR `e1fda76` (vòng 2) · merge `d6832e0`

## Mục tiêu
Chat trả lời bằng OpenAI thật khi bật cấu hình, giữ nguyên trải nghiệm Gửi → phản hồi hiện dần → Dừng → Tạo lại → mở lại lịch sử; demo và test local vẫn dùng phản hồi mẫu.

## Phạm vi
- **Bổ sung vòng 2 (khách hàng chốt O1, 15/11/2026):** đầu ra mặc định **1.000 token** (cấu hình được); chạm giới hạn → giữ phần đã sinh, trạng thái `TRUNCATED`, nhãn "Câu trả lời bị cắt do đạt giới hạn độ dài" — cả khi đang xem và sau khi mở lại; kiểm tra riêng 3 trường hợp hoàn tất / chạm giới hạn / Dừng; kiểm tra hủy ở mức kết nối tới provider.
- **Làm:** OpenAI provider bằng SDK `openai` chính thức, Responses API streaming, `store: false`; cấu hình `LLM_PROVIDER`, `LLM_MODEL`, `OPENAI_API_KEY`, `LLM_MAX_OUTPUT_TOKENS` (+ `LLM_HISTORY_TOKEN_BUDGET`); validate thiếu key; Dừng hủy request tới provider; giới hạn lịch sử theo ngân sách token; log số token, không log nội dung/key; test với provider giả lập; smoke test thật.
- **Không làm:** đa phương thức, công cụ (tools), lưu hội thoại phía OpenAI, đổi giao diện, hạn mức theo người dùng (R-6).

## Nguồn yêu cầu
- Yêu cầu khách hàng 15/11/2026 (5 mục). Thiết kế: [module-2-chat 4.4, 4.5](../design/module-2-chat.md#45-đầu-chờ-llm).

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | `LLM_PROVIDER=openai` dùng SDK chính thức, Responses API `stream: true`, `store: false`, `max_output_tokens` | Unit test + đọc code |
| AC2 | `mock` mặc định; `openai` thiếu key → API không khởi động, lỗi nêu `OPENAI_API_KEY` | Unit test `validateEnv` |
| AC3 | Hợp đồng SSE và lưu hội thoại không đổi: Gửi → hiện dần → Dừng → Tạo lại → lịch sử, với cả `mock` và `openai` | Script curl + UI |
| AC4 | Dừng hủy cả request tới provider; phần đã sinh lưu `STOPPED` | Script + log |
| AC5 | Lỗi API (hết hạn mức) → tin `ERROR`, UI hiện nhãn lỗi, Tạo lại được | Server giả `429 insufficient_quota` + UI |
| AC6 | Lịch sử gửi lại theo ngân sách token; đầu ra mặc định 500 token; log `input_tokens`/`output_tokens`; không log nội dung, key | Unit test + log |
| AC7 | Quyền hội thoại theo tài khoản giữ nguyên | Script user B |
| AC8 | `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm --filter @cat-gpt/api test` đạt | Lệnh |
| AC9 | (O1) Đầu ra mặc định 1.000 token, đổi được qua `LLM_MAX_OUTPUT_TOKENS`; `.env.example` chỉ có giá trị mẫu, `mock` mặc định | Unit test + đọc file |
| AC10 | Ba trường hợp kết thúc tách biệt: hoàn tất → `COMPLETED`; chạm giới hạn → `TRUNCATED` + giữ phần đã sinh + nhãn, còn sau khi mở lại; bấm Dừng → `STOPPED` | Script (mock + OpenAI) + UI |
| AC11 | Kiểm tra ở kết nối provider: hủy `signal` → kết nối HTTP tới provider bị đóng ngay | Unit test SDK thật + server SSE cục bộ |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất | Chốt |
|---|---|---|---|
| O1 | Câu trả lời chạm 500 token bị cắt giữa câu nhưng lưu `COMPLETED`, UI không báo | Tăng mặc định; thêm nhãn | **Chốt 15/11/2026:** mặc định 1.000, cấu hình được; giữ phần đã sinh + thông báo rõ, cả sau khi mở lại — làm trong cùng PR (vòng 2) |
| O2 | Hạn bàn giao / hoàn tất, thời điểm merge so với demo 20/11 | Merge sau demo cùng đợt SE-002 | **Chốt 15/11/2026:** chỉ merge sau demo, khi mọi tiêu chí đạt và đã kiểm với `develop` mới nhất |

## Kết quả review
- Vòng 1 (`b9adc74`): TL **Cần sửa** — xem [Review vòng 1 (TL)](#review-vòng-1-tl).
- Vòng 2 (`e1fda76`): TL **Đạt** — [Review vòng 2 (TL)](#review-vòng-2-tl); khách hàng xác nhận đạt kỹ thuật 15/11/2026.
- **Done 16/11/2026** — khách hàng cho merge sớm (không chờ hết demo; máy trình chiếu vẫn chạy `34b465d`). Merge sau PR #3: `gh pr merge 4 --merge --match-head-commit e1fda76…` → `d6832e0`. Xác minh trên `develop` @ `d6832e0` (16/11/2026, TL; API build chạy riêng cổng 4200, `LLM_PROVIDER=mock`, 2 tài khoản thử `tlverify1611.a@`/`.b@catgpt.local` — đã khóa, ảnh và hội thoại thử đã xóa): `pnpm install --frozen-lockfile`; `pnpm typecheck` 4/4; `pnpm lint` 3/3 (0 cảnh báo); `pnpm build` 3/3; `pnpm --filter @cat-gpt/api test` 12/12. Ba kết thúc với `mock` (SSE + mở lại hội thoại): `COMPLETED(364) → TRUNCATED(284) → STOPPED(53)` ký tự; `.env.example`: `LLM_PROVIDER=mock`, `OPENAI_API_KEY=` trống, `LLM_MAX_OUTPUT_TOKENS=1000`; mặc định 1.000 do unit test xác nhận. Bằng chứng hủy kết nối: unit test SDK thật + server SSE giả lập (trong 12/12). Lượt OpenAI thật bị dừng: **không nhận được usage cho lượt đó** (vòng 2). OpenAI thật không chạy lại trên `develop` (cây code `apps/`, `packages/` sau merge = PR #3 + `e1fda76`, đã thử thật ở vòng 2); nhãn "bị cắt" trên UI sau mở lại: theo vòng 2 (ảnh `docs/thesis/images/m2-05…`).

## Lịch sử review

### Checklist vòng 1
**Task** — SE-007 · PR nhánh `feature/openai-provider` → `develop` · SHA đầu PR: ghi trong bàn giao · vòng 1
**Kết quả** — Thêm `OpenAiLlmProvider` (`apps/api/src/modules/llm/openai-llm.provider.ts`), chọn provider ở `LlmModule` theo `LLM_PROVIDER`, cấu hình + validate trong `env.validation.ts` / `app-config.service.ts`, test `openai-llm.provider.spec.ts`; tài liệu `module-2-chat.md` 4.5, `.env.example`, `README.md`. Không đổi web, `ChatService`, SSE.
**Checklist** (kiểm tra 15/11/2026 trên worktree riêng `cat_gpt-openai`, API cổng 4200, web 3200; tài khoản thử `se007.a@` / `se007.b@`, đã khóa; hội thoại thử đã xóa)
- [x] AC1 SDK chính thức + Responses API streaming + `store: false` — Đạt — `openai` 7.57.0; unit test kiểm tham số gửi đi `{ model: 'gpt-5.4-mini', stream: true, store: false, max_output_tokens: 500, instructions }` và `signal`
- [x] AC2 Cấu hình — Đạt — unit test: không đặt gì → `mock`; `openai` không key → lỗi chứa `OPENAI_API_KEY`; có key → `LLM_MAX_OUTPUT_TOKENS` = 500
- [x] AC3 Luồng Chat với provider giả lập (`LLM_PROVIDER=mock`) — Đạt — câu hỏi tiếng Việt: 50 `delta` (275 ms → 2.168 ms), `meta` + `done`; Dừng sau 1,5 s → `STOPPED` 283 ký tự; Tạo lại → `COMPLETED`; hội thoại có trong danh sách, tiêu đề tiếng Việt đúng
- [x] AC3 Luồng Chat với **OpenAI thật** (`gpt-5.4-mini`, key của chủ dự án trong `.env`) — Đạt — câu hỏi tiếng Việt về mật khẩu mạnh: 178 `delta`, token đầu ~3,9 s, kết thúc 4,8 s, trả lời tiếng Việt có markdown; Tạo lại → 497 `delta`, `COMPLETED`; lịch sử mở lại đủ. **UI** (http://localhost:3200): gửi câu hỏi tiếng Việt → chữ hiện dần, nút Gửi thành Dừng (ảnh 4,5 s); bấm Dừng khi đang chạy → nhãn "Đã dừng", lưu `STOPPED` 216 ký tự; tải lại trang vẫn thấy câu hỏi và nhãn
- [x] AC4 Dừng hủy request tới provider — Đạt — ngắt sau 22 `delta` (1.854 ms) → tin cuối `STOPPED` 92 ký tự; **không** có dòng log usage cho lượt đó (OpenAI chưa gửi `response.completed`) và không có log lỗi; unit test: `signal` truyền vào `responses.create`, hủy → generator kết thúc êm
- [x] AC5 Lỗi hết hạn mức — Đạt — API trỏ SDK tới server giả (`OPENAI_BASE_URL`) trả `429 insufficient_quota`: SSE `meta` + `done` với `status: "ERROR"`; log `LlmError: OpenAI error status=429 code=insufficient_quota` (không nội dung); UI hiện "Lỗi khi tạo câu trả lời" + nút Tạo lại. Unit test `RateLimitError` → `LlmError { status: 429, code: 'insufficient_quota' }`
- [x] AC6 Token và log — Đạt — `fitHistory` (unit test: giữ tin mới nhất vừa ngân sách, luôn giữ câu hỏi hiện tại); log mẫu `usage model=gpt-5.4-mini input_tokens=85 output_tokens=182 messages=1 end=completed`; `grep` log tìm câu hỏi, câu trả lời, tiền tố `sk-` → 0 dòng
- [x] AC7 Quyền theo tài khoản — Đạt — user B với hội thoại của A: GET hội thoại, GET tin nhắn, Tạo lại, gửi tiếp → đều `404` (cả `mock` và `openai`)
- [x] AC8 Kiểm tra mã — Đạt — `pnpm typecheck` 4/4, `pnpm lint` 3/3 (API 0 cảnh báo, 0 lỗi), `pnpm build` 3/3, `pnpm --filter @cat-gpt/api test` 9/9

**Số token các lượt thử thật** (`gpt-5.4-mini`, `max_output_tokens` 500)

| Lượt | input_tokens | output_tokens | Kết thúc |
|---|---|---|---|
| Câu hỏi tiếng Việt (1 tin) | 85 | 182 | completed |
| Tạo lại câu "15 nguyên tắc" (3 tin) | 298 | 500 | max_output_tokens |
| Gửi tiếp cùng hội thoại (5 tin) | 830 | 500 | max_output_tokens |
| UI: "10 cách bảo vệ dữ liệu" + 4 lần Tạo lại (1 tin mỗi lượt) | 86 | 500 | max_output_tokens |
| Lượt bị Dừng (script và UI) | — | — | không có usage (đã hủy) |

**Kiểm tra đã chạy** — vitest; script curl (`mock`, `openai`, server giả 429); Chrome trên http://localhost:3200; `pnpm typecheck/lint/build`.
**Ghi chú** — (1) Khi gửi tiếng Việt bằng tham số dòng lệnh `curl` trên Git Bash, Windows đổi bảng mã làm hỏng chữ (một hội thoại thử bị lưu "H�y gi?i…", đã xóa); kiểm tra đúng phải gửi body từ file UTF-8 — lỗi của cách test, không phải của ứng dụng. (2) Câu trả lời dài bị cắt ở 500 token (O1). (3) `.env` của máy chủ dự án đang đặt `LLM_PROVIDER=openai`: chạy `develop` sau khi merge sẽ gọi OpenAI thật; bản demo 20/11 ở `34b465d` không đọc biến này.
**Trạng thái** — Chờ Review

#### Review vòng 1 (TL)
**Task** — SE-007 · PR https://github.com/duong2604/cat_gpt/pull/4 · SHA đã review `b9adc74` · vòng 1
**Kết luận** — **Cần sửa.** AC1–AC8 đạt theo bằng chứng vòng 1 (TL đọc diff: provider, `LlmModule`, cấu hình, test; `.env.example` chỉ giá trị mẫu — `OPENAI_API_KEY=` trống, `LLM_PROVIDER=mock`). Phải sửa theo quyết định khách hàng 15/11/2026:
1. O1: đầu ra mặc định 1.000 token, cấu hình được.
2. Provider kết thúc vì chạm giới hạn (`response.incomplete`, `max_output_tokens`) đang lưu `COMPLETED` → giữ phần đã sinh, trạng thái riêng, thông báo rõ trên UI, còn sau khi mở lại. Kiểm riêng hoàn tất / chạm giới hạn / Dừng.
3. Thêm kiểm tra ở mức kết nối provider chứng minh Dừng cắt request (vòng 1 chỉ suy ra từ việc không có log usage).
**Trạng thái** — Cần sửa → Senior Dev sửa trong cùng PR.

### Checklist vòng 2
**Task** — SE-007 · PR https://github.com/duong2604/cat_gpt/pull/4 · SHA đầu PR: ghi trong bàn giao · vòng 2
**Kết quả** — Thêm `MessageStatus.TRUNCATED` (`packages/shared`), `LlmStreamOptions.onFinish(reason)`; OpenAI provider báo `max_output_tokens` khi `response.incomplete`; `ChatService` lưu `TRUNCATED` (Dừng vẫn ưu tiên `STOPPED`); web hiện nhãn "Câu trả lời bị cắt do đạt giới hạn độ dài" / "Answer cut off at the length limit"; mock thêm `/limit` để thử không cần mạng; `LLM_MAX_OUTPUT_TOKENS` mặc định 1.000.
**Checklist** (API cổng 4200, web 3200; tài khoản thử `se007.a@`/`se007.b@` đã khóa lại, hội thoại thử đã xóa)
- [x] AC9 Mặc định 1.000, cấu hình được; `.env.example` chỉ giá trị mẫu, `mock` mặc định — Đạt — unit test (`1000`; đặt `1500` → `1500`); `.env.example`: `LLM_PROVIDER=mock`, `OPENAI_API_KEY=` trống, `LLM_MAX_OUTPUT_TOKENS=1000`
- [x] AC10 Ba trường hợp với **mock** — Đạt — hoàn tất `COMPLETED` (423 ký tự); `/limit` → SSE `done` `TRUNCATED`, giữ 187 ký tự; Dừng sau 5 delta → `STOPPED` 46 ký tự; mở lại: `COMPLETED(423) → TRUNCATED(187) → STOPPED(46)`
- [x] AC10 Ba trường hợp với **OpenAI thật** (`gpt-5.4-mini`, 1.000 token) — Đạt — câu ngắn "thủ đô Việt Nam" → `COMPLETED`; bài hướng dẫn 2.000 từ → 997 delta, `TRUNCATED`, giữ 3.551 ký tự; Dừng sau 5 delta (1.306 ms) → `STOPPED` 23 ký tự, không có log usage; mở lại: `COMPLETED(34) → TRUNCATED(3551) → STOPPED(23)`
- [x] AC10 UI — Đạt — gửi yêu cầu dài trên http://localhost:3200 → chữ chạy dần, kết thúc sau ~7,4 s với nhãn "Câu trả lời bị cắt do đạt giới hạn độ dài"; tải lại trang nhãn vẫn còn
- [x] AC11 Hủy ở kết nối provider — Đạt — unit test dùng **SDK `openai` thật** trỏ tới server SSE cục bộ: hủy sau 5 delta → server nhận `close` < 300 ms và ngừng gửi (< 50/200 sự kiện)
- [x] AC1–AC8 không hồi quy — Đạt — `pnpm --filter @cat-gpt/api test` 12/12; `pnpm typecheck` 4/4; `pnpm lint` 3/3 (0 cảnh báo); `pnpm build` 3/3; log không chứa nội dung hay `sk-` (0 dòng)

**Token vòng 2** (`gpt-5.4-mini`)

| Lượt | input_tokens | output_tokens | Kết thúc |
|---|---|---|---|
| Câu ngắn "thủ đô Việt Nam" | 76 | 17 | completed |
| Bài hướng dẫn 2.000 từ (script) | 132 | 1.000 | max_output_tokens → `TRUNCATED` |
| Bài hướng dẫn 2.000 từ (UI) | 91 | 1.000 | max_output_tokens → `TRUNCATED` |
| Dừng sau 5 delta | — | — | không có usage (đã hủy) |

**Ghi chú** — `.env` của máy chủ dự án đang đặt `LLM_MAX_OUTPUT_TOKENS=500` (ghi đè mặc định); lượt thử trên đặt biến này = 1000 cho tiến trình thử. Chủ dự án đổi trong `.env` nếu muốn dùng mặc định mới.
**Trạng thái** — Chờ Review

#### Review vòng 2 (TL)
**Task** — SE-007 · PR https://github.com/duong2604/cat_gpt/pull/4 · SHA đã review `e1fda76` · vòng 2
**Kết luận** — **Đạt** (15/11/2026). Chép từ [báo cáo ngày 15/11, vòng 3](../reports/daily/2026-11-15.md#vòng-3--1830) — mục "SE-007 — TL review vòng 2": diff vòng 2 đúng phạm vi; 12/12 test (gồm hủy ở kết nối < 300 ms); ba kết thúc mock `COMPLETED(423) → TRUNCATED(187) → STOPPED(46)` và OpenAI thật `COMPLETED(34) → TRUNCATED(3551) → STOPPED(23)`; nhãn "Câu trả lời bị cắt do đạt giới hạn độ dài" khi vừa xong và sau tải lại; token 76/17, 132/1.000, 91/1.000, lượt Dừng không có usage; typecheck/lint/build đạt.
**Merge và xác minh** — xem "Kết quả review" (merge `d6832e0`, 16/11/2026).
**Dọn nhánh sau merge** — remote `feature/openai-provider` đã xóa; local nhánh + worktree `cat_gpt-openai` đã gỡ (TL, 16/11/2026).
**Trạng thái** — Done.

## Phản hồi UI
Chưa có.
