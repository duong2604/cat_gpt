# SE-007 — Tích hợp OpenAI cho Chat (Responses API, streaming)

Trạng thái: Chờ Review
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: Không. **Không đổi bản demo 20/11** (máy trình chiếu chạy `34b465d`; `LLM_PROVIDER` mặc định `mock`). Merge theo quyết định của TL ([workflow 9.2](../project/workflow.md#92-điều-kiện-chặn-merge) điều 5)
Hạn bàn giao review: Chờ chốt · Hạn hoàn tất: Chờ chốt
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 · hoàn tất —
Chốt: 15/11/2026 — khách hàng giao trực tiếp (yêu cầu "Triển khai task tích hợp OpenAI cho CAT GPT"); task lập theo yêu cầu đó, TL rà phạm vi khi nghiệm thu
SHA cơ sở: `origin/develop` @ `796367c`
PR: nhánh `feature/openai-provider` → `develop` (link và SHA đầu PR ghi trong bàn giao gửi TL)

## Mục tiêu
Chat trả lời bằng OpenAI thật khi bật cấu hình, giữ nguyên trải nghiệm Gửi → phản hồi hiện dần → Dừng → Tạo lại → mở lại lịch sử; demo và test local vẫn dùng phản hồi mẫu.

## Phạm vi
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

## Quyết định còn mở
| # | Câu hỏi | Đề xuất | Chốt |
|---|---|---|---|
| O1 | Câu trả lời chạm 500 token bị cắt giữa câu nhưng lưu `COMPLETED`, UI không báo. Có tăng `LLM_MAX_OUTPUT_TOKENS` hoặc thêm nhãn "Câu trả lời bị cắt"? | Tăng mặc định lên 1.000–1.500 cho Chat văn bản; nhãn riêng làm ở task sau | Chờ khách hàng + CTO |
| O2 | Hạn bàn giao / hoàn tất, thời điểm merge so với demo 20/11 | Merge sau demo cùng đợt SE-002 | Chờ TL |

## Kết quả review
Senior Dev bàn giao vòng 1 ngày 15/11/2026. Chờ TL review.

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
