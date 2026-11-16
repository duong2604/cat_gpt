# Module 2 — Trợ lý hội thoại (AI Chat)

> Trạng thái: ✅ Đã tích hợp vào `develop` qua [SE-001](../tasks/SE-001-chat-integration.md) (bàn giao 15/11/2026). Mặc định phản hồi là nội dung giả lập (`MockLlmProvider`, model `mock-1`); đặt `LLM_PROVIDER=openai` để dùng OpenAI (`gpt-5.4-mini`) — [SE-007](../tasks/SE-007-openai-provider.md).
> Phạm vi theo đề cương: tạo và quản lý cuộc hội thoại (đổi tên, xóa), gửi/nhận tin nhắn, phản hồi theo thời gian thực (streaming), lưu trữ lịch sử trò chuyện.
> Kế hoạch đề cương: 19/10 – 01/11/2026 · Nhánh: `feature/module-2-chat` (tách từ `develop` sau khi merge Module 1)

## 1. Bối cảnh

- Hiện chưa đăng ký hay thiết lập LLM nào. Theo nguyên tắc chung, module này vẫn dựng đầy đủ giao diện và backend, kèm **đầu chờ AI** (`MockLlmProvider`). Khi tích hợp LLM thật chỉ cần thêm một provider.
- **Tiến độ:** hôm nay là 27/10, chỉ còn **5 ngày làm việc** tới mốc 01/11, trong khi PR Module 1 vẫn chưa merge. Kế hoạch ở mục 6 đã được nén lại cho vừa thời gian. Nếu trễ thì phần tùy chọn (mục 2.3) được dời sang 02/11, không ảnh hưởng tới Module 3.
- Module 4 (RAG) sẽ dùng lại toàn bộ khung chat này: cùng `LlmProvider` và cùng giao thức SSE, chỉ thêm ngữ cảnh tài liệu và trích dẫn. Vì vậy thiết kế dưới đây chừa sẵn chỗ cho phần đó nhưng chưa code trước.

## 2. Phạm vi

### 2.1. Bắt buộc (theo đề cương)
- Tạo hội thoại mới, liệt kê, đổi tên, xóa.
- Gửi tin nhắn, nhận phản hồi **streaming qua SSE**.
- Lưu lịch sử. Mở lại hội thoại cũ thì thấy toàn bộ tin nhắn.

### 2.2. Nên có (giúp demo tốt, chi phí thấp)
- Nút **Dừng** khi đang stream; phần nội dung đã sinh vẫn được lưu lại.
- **Tạo lại** câu trả lời cuối, **Sao chép** câu trả lời.
- **Tìm kiếm** hội thoại theo tiêu đề.
- Danh sách nhóm theo thời gian: Hôm nay / Hôm qua / 7 ngày trước / Cũ hơn.

### 2.3. Để sau (ngoài phạm vi Module 2)
- Sửa tin nhắn đã gửi, rẽ nhánh hội thoại.
- AI tự đặt tiêu đề (chừa sẵn hook, làm khi có LLM thật).
- Dropdown chọn model (làm khi có LLM thật).
- Đính kèm tài liệu vào chat (thuộc Module 4).

## 3. Câu hỏi cần sinh viên xác nhận

**Đã chốt 15/11/2026** theo Q3 của [TL-001](../tasks/TL-001-chat-integration-scope.md#quyết-định-còn-mở): toàn bộ đề xuất mặc định dưới đây (gồm 3 thư viện markdown ở câu 7) là yêu cầu đã duyệt, dùng làm nguồn nghiệm thu cho [SE-001](../tasks/SE-001-chat-integration.md).

Mỗi câu đều có sẵn đề xuất mặc định. Nếu sinh viên đồng ý tất cả thì chỉ cần trả lời "OK".

| # | Câu hỏi | Đề xuất |
|---|---|---|
| 1 | Mock trả lời kiểu gì? | Chọn ngẫu nhiên một trong khoảng 5 câu trả lời mẫu tiếng Việt có markdown (tiêu đề, danh sách, bảng, khối code) và trích lại câu hỏi. Trả từng đoạn nhỏ với độ trễ 20–40ms |
| 2 | Sau này dùng LLM nào? | Chưa cần chốt. Interface theo định dạng chat chuẩn OpenAI (`{role, content}[]`), vì Ollama, OpenAI, Gemini và Claude đều map được |
| 3 | Tính năng thêm | Làm hết mục 2.2. Mục 2.3 để sau |
| 4 | Tiêu đề hội thoại | 50 ký tự đầu của tin nhắn đầu tiên, cắt theo ranh giới từ |
| 5 | Xóa hội thoại | Xóa hẳn cả hội thoại lẫn tin nhắn (có dialog xác nhận) |
| 6 | Cách stream | `POST` trả về `text/event-stream`; FE đọc bằng `fetch` + `ReadableStream`. `EventSource` chỉ hỗ trợ GET, còn axios không đọc được stream trên trình duyệt |
| 7 | Hiển thị markdown | **Thư viện mới, cần xác nhận:** `react-markdown` + `remark-gfm` + `rehype-highlight`. Nếu không đồng ý thì hiển thị văn bản thuần (`white-space: pre-wrap`) |
| 8 | Ngữ cảnh gửi cho AI | System prompt + 20 tin nhắn gần nhất |
| 9 | Giới hạn | Tối đa 4.000 ký tự/tin nhắn; 20 tin nhắn/phút/người (đếm theo user, không theo IP) |
| 10 | System prompt và model | Cố định trong `.env` (`LLM_SYSTEM_PROMPT`, `LLM_MODEL`) |
| 11 | PR Module 1 | Tạo PR `feature/module-1-auth-user` → `develop` và merge **trước khi** tách nhánh Module 2 |

## 4. Thiết kế backend

### 4.1. Cấu trúc thư mục (`apps/api/src/modules/`)

```
chat/
  chat.module.ts
  conversations.controller.ts   # CRUD hội thoại + lịch sử tin nhắn
  chat.controller.ts            # endpoint SSE: gửi tin nhắn / tạo lại
  conversations.service.ts
  chat.service.ts               # dựng ngữ cảnh, gọi LLM, lưu kết quả, xử lý dừng
  sse.ts                        # helper ghi event SSE lên express Response
  schemas/conversation.schema.ts
  schemas/message.schema.ts
  dto/*.dto.ts
llm/
  llm.module.ts                 # chọn provider theo LLM_PROVIDER
  llm.provider.ts               # abstract class (giống mẫu StorageService ở M1-07)
  mock-llm.provider.ts
```

### 4.2. Dữ liệu (MongoDB)

**`conversations`**: `userId` (ref users), `title`, `lastMessageAt`, `createdAt`, `updatedAt`.
Index `{ userId: 1, lastMessageAt: -1 }` dùng cho danh sách.

**`messages`**: `conversationId`, `userId`, `role` (`user|assistant`), `content`, `status` (`COMPLETED|STOPPED|ERROR`), `model`, `usage?` (`promptTokens`, `completionTokens`), `createdAt`.
Index `{ conversationId: 1, createdAt: 1 }`.
*(Module 4 sẽ thêm trường `citations[]`, nên chưa tạo trước.)*

Mọi truy vấn đều lọc theo `userId`. Nếu user truy cập hội thoại của người khác thì API trả `CONVERSATION_NOT_FOUND`, không trả 403, để không lộ việc hội thoại đó có tồn tại.

### 4.3. API (prefix `/api/v1`)

| Endpoint | Mô tả |
|---|---|
| `GET /conversations?q=&cursor=&limit=` | Danh sách của user hiện tại, sắp theo `lastMessageAt` giảm dần, phân trang bằng cursor (cho infinite scroll), tìm theo tiêu đề |
| `PATCH /conversations/:id` | Đổi tên (`title` 1–100 ký tự) |
| `DELETE /conversations/:id` | Xóa hội thoại và toàn bộ tin nhắn |
| `GET /conversations/:id/messages` | Toàn bộ lịch sử tin nhắn (đủ cho prototype; phân trang để sau) |
| `POST /chat/stream` **(SSE)** | Body `{ conversationId?, content }`. Không có `conversationId` thì tạo hội thoại mới |
| `POST /conversations/:id/regenerate` **(SSE)** | Xóa câu trả lời cuối của assistant rồi sinh lại |

Hội thoại được tạo **khi gửi tin nhắn đầu tiên**, không có endpoint tạo hội thoại rỗng. Nhờ vậy không bị rác hội thoại trống khi user bấm "Cuộc trò chuyện mới" rồi bỏ đi.

### 4.4. Giao thức SSE

```
event: meta   data: {"conversationId":"…","userMessageId":"…","title":"…"}
event: delta  data: {"text":"…"}               (lặp lại nhiều lần)
event: done   data: {"messageId":"…","status":"COMPLETED"}
event: error  data: {"code":"LLM_UNAVAILABLE"}
: ping                                          (comment heartbeat mỗi 15 giây)
```

Luồng xử lý `POST /chat/stream`:
1. Validate và kiểm tra quyền **trước khi** mở stream. Lỗi ở bước này trả JSON lỗi bình thường, đúng định dạng thống nhất của Module 1.
2. Lưu tin nhắn của user (tạo hội thoại nếu cần), rồi gửi `meta`.
3. Dựng ngữ cảnh gồm system prompt + 20 tin nhắn gần nhất, gọi `llm.stream(messages, { signal })`.
4. Ghi từng `delta`, đồng thời gộp nội dung trong bộ nhớ.
5. Kết thúc: lưu tin nhắn assistant **một lần** (`COMPLETED`), cập nhật `lastMessageAt`, gửi `done`.
6. **Dừng:** FE gọi `AbortController.abort()` → server nhận `req.on('close')` → hủy `signal` → lưu phần đã sinh với trạng thái `STOPPED`.
7. LLM lỗi giữa chừng: lưu phần đã có với trạng thái `ERROR`, gửi `event: error`.

Ghi chú triển khai:
- Dùng `@Res()` của Express và tự set header (`Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `X-Accel-Buffering: no` cho Nginx sau này) rồi `flushHeaders()`. Không dùng `@Sse()` của NestJS vì decorator này hướng tới GET + Observable và khó xử lý lỗi trước khi mở stream.
- Access token chỉ được kiểm tra lúc mở stream. Stream đang chạy không bị cắt khi token hết hạn giữa chừng, và như vậy là chấp nhận được.

### 4.5. Đầu chờ LLM

```ts
export type LlmMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export abstract class LlmProvider {
  abstract readonly model: string;
  /** Trả về từng đoạn văn bản; phải dừng khi signal bị hủy. */
  abstract stream(messages: LlmMessage[], opts: { signal: AbortSignal }): AsyncIterable<string>;
}
```

- `MockLlmProvider`: chọn ngẫu nhiên câu trả lời mẫu tiếng Việt có markdown, trả từng đoạn 1–3 từ với độ trễ 20–40ms, tôn trọng `signal`. Có thể giả lập lỗi khi tin nhắn chứa `/error` để demo nhánh xử lý lỗi.
- `OpenAiLlmProvider` (`openai-llm.provider.ts`, [SE-007](../tasks/SE-007-openai-provider.md)): SDK `openai` chính thức, **Responses API** `stream: true`, **`store: false`** (lịch sử chỉ lưu trong CAT GPT). System prompt → `instructions`; lịch sử user/assistant → `input`, cắt theo ngân sách token (`fitHistory`, ước lượng ~3 ký tự/token, luôn giữ câu hỏi hiện tại). `max_output_tokens` = `LLM_MAX_OUTPUT_TOKENS` (mặc định 1.000). Sự kiện `response.output_text.delta` → `delta`; `response.completed` / `response.incomplete` → ghi log **chỉ** `input_tokens`, `output_tokens`, số tin nhắn, lý do kết thúc. `signal` truyền vào request của SDK: bấm Dừng hủy cả request HTTP tới OpenAI. Lỗi API (401, 429 `insufficient_quota`, 5xx, `response.failed`) → `LlmError` chỉ chứa mã trạng thái + mã lỗi → ChatService lưu tin `ERROR`, UI hiện "Lỗi khi tạo câu trả lời" và cho Tạo lại.
- Chọn provider ở `LlmModule` theo `LLM_PROVIDER` (`mock` mặc định | `openai`). Biến môi trường: `LLM_PROVIDER`, `LLM_MODEL` (mặc định theo provider), `OPENAI_API_KEY` (bắt buộc khi `openai` — thiếu thì API không khởi động, báo lỗi rõ), `LLM_MAX_OUTPUT_TOKENS` (1.000), `LLM_HISTORY_TOKEN_BUDGET` (4000), `LLM_SYSTEM_PROMPT`.
- Ba cách kết thúc: hoàn tất → `COMPLETED`; provider dừng vì chạm `max_output_tokens` (`response.incomplete`) → `onFinish('max_output_tokens')` → lưu phần đã sinh với `TRUNCATED`, UI hiện "Câu trả lời bị cắt do đạt giới hạn độ dài" (cả sau khi mở lại); người dùng bấm Dừng → `STOPPED`. Mock: câu hỏi chứa `/limit` giả lập chạm giới hạn.

### 4.6. Giới hạn tần suất
- 20 lần/phút **theo người dùng** cho 2 endpoint SSE (`POST /chat/stream`, `POST /conversations/:id/regenerate`). Triển khai: `ChatThrottlerGuard` (`modules/chat/chat-throttler.guard.ts`) áp bằng `@UseGuards()` ở method — chạy sau `JwtAuthGuard` (guard toàn cục chạy trước khi xác thực nên không dùng được `req.user`) — dùng lại `ThrottlerStorage`/`ThrottlerException` sẵn có của `@nestjs/throttler` với khóa riêng `chat-user:<userId>`, độc lập với bucket IP 120 req/phút chung (`AllExceptionsFilter` map `ThrottlerException` → 429 `TOO_MANY_REQUESTS`, FE dịch qua `errors.TOO_MANY_REQUESTS`).
- Độ dài tin nhắn được validate bằng `class-validator`, dùng chung hằng số `CHAT_MAX_MESSAGE_LENGTH` trong `packages/shared`.

## 5. Thiết kế frontend

### 5.1. Route
| Route | Nội dung |
|---|---|
| `/chat` | Màn hình chào và ô nhập. Gửi tin nhắn đầu tiên → nhận `meta.conversationId` → `router.replace('/chat/<id>')` |
| `/chat/[id]` | Khung chat của hội thoại |

Danh sách hội thoại nằm trong `app/(app)/chat/layout.tsx` (cột trái thứ hai), nên chuyển giữa các hội thoại không bị tải lại danh sách. Trên mobile, danh sách hiển thị dạng `Sheet`.

### 5.2. Cấu trúc (`apps/web/src/features/chat/`) — theo tên file thực tế trên `develop`
```
api.ts          # axios: list / rename / delete / messages
stream.ts       # fetch + parser SSE, tự refresh khi gặp 401 (dùng lại refreshSession của lib/api/client.ts)
hooks.ts        # useConversations (useInfiniteQuery), useMessages, useRenameConversation,
                # useDeleteConversation, useChatStream (trạng thái stream, stop, regenerate)
chat-stream-provider.tsx   # context giữ trạng thái stream dùng chung giữa các component
components/
  conversation-list.tsx   conversation-view.tsx   chat-layout.tsx   chat-input.tsx
  conversation-dialogs.tsx (đổi tên + xóa)        message-list.tsx   message-item.tsx
  markdown.tsx            new-chat.tsx
```

### 5.3. Hành vi chính
- **Streaming:** `useChatStream` giữ nội dung đang sinh trong state cục bộ và hiển thị chữ chạy dần. Khi nhận `done`, hook ghi tin nhắn vào cache TanStack Query (`setQueryData`) rồi invalidate danh sách hội thoại.
- **Ô nhập:** textarea tự giãn; Enter để gửi, Shift+Enter để xuống dòng; hiện bộ đếm ký tự khi gần chạm giới hạn; khóa ô nhập khi đang stream và đổi nút Gửi thành nút Dừng.
- **Tự cuộn** xuống cuối khi có chữ mới, trừ khi user đang cuộn lên đọc phía trên.
- Tin nhắn `STOPPED` / `ERROR` có nhãn nhỏ và nút "Tạo lại".
- Tìm kiếm dùng `useDebouncedValue` sẵn có. Lỗi được dịch qua `useErrorMessage` sẵn có.
- Thêm chuỗi dịch vi/en vào `messages/*.json`; hỗ trợ dark mode và responsive.

## 6. Kế hoạch thực hiện (27/10 – 01/11/2026)

| Ngày | Việc | Kết quả kiểm chứng |
|---|---|---|
| **27/10** | Chốt mục 3. Tạo PR Module 1 → `develop`, merge, tách nhánh `feature/module-2-chat`. **Spike:** endpoint SSE tối giản đi qua Next.js rewrites | Mở `/api/v1/...` từ trình duyệt thấy chữ chạy dần, không bị dồn tới cuối mới hiện (rủi ro R1) |
| **28/10** | `packages/shared`: enum, type DTO, kiểu event SSE, mã lỗi. BE: schema, `LlmModule` + mock, CRUD hội thoại, `POST /chat/stream` | Chạy `curl -N` thấy stream đủ `meta`→`delta`→`done`; dữ liệu được lưu trên Atlas |
| **29/10** | BE: dừng (abort), tạo lại, xử lý lỗi LLM, throttle theo user, Swagger | Kịch bản curl: dừng giữa chừng → tin nhắn ở trạng thái `STOPPED`; user A không đọc được hội thoại của user B; vượt 20 lần/phút bị 429 |
| **30/10** | FE: layout chat, danh sách hội thoại, khung chat, `stream.ts` + `useChatStream`, ô nhập | Gửi → thấy chữ chạy dần → F5 vẫn còn lịch sử |
| **31/10** | FE: markdown, dừng / tạo lại / sao chép, đổi tên / xóa, tìm kiếm, nhóm theo thời gian, i18n, mobile, dark mode | Duyệt UI toàn bộ luồng |
| **01/11** | `pnpm build` / `typecheck` / `lint`; kiểm thử tổng thể; cập nhật tài liệu này; tạo PR → `develop` | Checklist ở mục 8 đạt hết |

Commit dự kiến: `feat(shared): add chat types` · `feat(api): add conversations and streaming chat (module 2)` · `feat(web): add chat UI with streaming (module 2)` · `docs: update module 2 notes`.

## 7. Rủi ro & phương án

| # | Rủi ro | Phương án |
|---|---|---|
| R1 | Next.js rewrites hoặc nén gzip **gom buffer** làm SSE không chạy dần | Kiểm tra ngay ngày đầu bằng spike. Header `Cache-Control: no-transform` + gửi heartbeat. Nếu vẫn bị buffer: tạo route handler `app/api/v1/chat/[...]/route.ts` tự proxy stream (vẫn cùng origin, cookie vẫn hoạt động) |
| R2 | Access token hết hạn ngay trước khi gửi → `fetch` nhận 401 | `stream.ts` refresh một lần rồi gửi lại. Dùng chung `refreshSession` với axios để không refresh hai lần song song |
| R3 | User đóng tab giữa chừng | `req.on('close')` → abort → lưu `STOPPED`; không để lại tin nhắn treo |
| R4 | Trễ tiến độ | Mục 2.2 làm sau cùng. Phần nào chưa xong thì dời sang 02/11 và ghi vào nợ kỹ thuật |

## 8. Checklist nghiệm thu

- [x] Tạo hội thoại bằng tin nhắn đầu tiên; tiêu đề tự đặt từ tin nhắn.
- [x] Phản hồi chạy dần qua giao diện web (không chỉ qua curl).
- [x] Dừng giữa chừng: phần đã sinh vẫn được lưu và có nhãn "Đã dừng".
- [x] Tạo lại câu trả lời cuối; sao chép câu trả lời.
- [x] Đổi tên, xóa (có xác nhận), tìm kiếm hội thoại.
- [x] F5 hoặc đăng nhập lại vẫn thấy lịch sử.
- [x] Không truy cập được hội thoại của user khác.
- [x] Giới hạn 4.000 ký tự và 20 tin/phút hoạt động, lỗi được dịch vi/en.
- [x] Dark mode, tiếng Anh. Mobile (danh sách dạng `Sheet`, breakpoint `md`): xác nhận qua code, chưa chụp được màn hình hẹp trong môi trường kiểm tra lần này.
- [x] `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt.

Chi tiết bằng chứng từng mục: checklist bàn giao của [SE-001](../tasks/SE-001-chat-integration.md#lịch-sử-review).

## 9. Công việc đã thực hiện

- 24/10/2026: Lập phương án sơ bộ và gửi bộ câu hỏi chốt yêu cầu.
- 27/10/2026: Lập kế hoạch chi tiết (thiết kế BE/FE, giao thức SSE, lịch theo ngày, rủi ro, checklist).
- 15/11/2026: [TL-001](../tasks/TL-001-chat-integration-scope.md) khoanh phạm vi tích hợp từ `origin/preview/module-2-4-demo`; khách hàng chốt Q3 (mục 3 ở trên). [SE-001](../tasks/SE-001-chat-integration.md) tích hợp vào `develop`: cherry-pick 3 commit Chat từ preview, chép tay chuỗi dịch + bố cục toàn màn hình + bỏ nhãn "Đang phát triển" (phần Chat nằm trong commit demo Module 3–4, không cherry-pick được riêng), thêm giới hạn 20 tin/phút/người (mục 4.6), loại trừ toàn bộ phần Module 3–4.
