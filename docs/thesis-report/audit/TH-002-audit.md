# Audit kỹ thuật tập trung — Fast-track V1.2 (phạm vi TH-002)

- **Audit Baseline:** `origin/develop` @ `e8cefedd62ffa1c38c049049fecada857d82793f` (fetch 24/11/2026 16:4x, commit 24/11/2026 16:26 +0700). Mã nguồn ứng dụng tại baseline trùng `c34410b` (PR #56 chỉ đổi tài liệu).
- **Trạng thái:** dùng làm baseline kỹ thuật **tạm thời** cho bản nháp V0.1; **chưa được nghiệm thu**. Report Baseline chính thức do Project Owner xác nhận ở FT-004.
- **Phạm vi:** chỉ thu thập điều cần cho báo cáo; không audit toàn bộ codebase, không sửa code.
- **Người thực hiện:** Thesis Agent, 24/11/2026.

## 1. Nguồn đã đọc trực tiếp

| Nguồn | Kết quả |
|---|---|
| PDF quy định trình bày (SRC-001) | Đọc toàn văn 5 trang; khớp [format-standard](../format-standard.md) mục 1–2; không quy định kiểu trích dẫn, đánh số trang phần đầu |
| Đề cương baseline (SRC-002) | Đọc toàn văn: tên đề tài, 4 module, giới hạn (PDF text/DOCX/TXT, không OCR, prototype), công nghệ dự kiến, kết quả dự kiến, kế hoạch; 4 ô ký trống |
| Báo cáo tiến độ 16/11 (SRC-003) | Đọc văn bản: bảng % và chú thích 14 hình; ảnh Module 3–4 trong đó là bản demo preview (dữ liệu giả) — **không dùng** |
| Bản ghi bàn giao TL-004, `docs/thesis/` | Dùng làm chỉ dẫn; mọi nhận định dưới đây kiểm lại trên code |
| Mã nguồn `apps/api`, `apps/web`, `packages/shared`, `docker-compose.yml` | Đọc các file nêu ở cột "Bằng chứng" |
| `docs/evaluation/rag-dataset/` (TL-009, SE-017) | Đọc README, `SUMMARY-…`, `TL-REVIEW-…`, `TL-RERUN-2026-11-21.md` |
| Unit test | Chạy `npx vitest run` trong `apps/api` tại baseline: **8 file, 83/83 ca đạt** (24/11/2026 16:50, 21,8 s) |

## 2. Công nghệ thực tế

| Thành phần | Thực tế tại baseline | So với đề cương |
|---|---|---|
| Ngôn ngữ, monorepo | TypeScript; pnpm workspaces + Turborepo; `apps/api`, `apps/web`, `packages/shared` | Khớp |
| Frontend | Next.js 16.4 (App Router), React 19.3, TanStack Query, next-intl (vi/en), react-markdown + remark-gfm + rehype-highlight, Radix UI | Khớp |
| Backend | NestJS 12.5, Mongoose 9, Passport JWT, class-validator, @nestjs/throttler, helmet, Swagger | Khớp |
| CSDL | MongoDB (Atlas, không dựng trong compose) | Khớp |
| Hàng đợi | Redis 7.4 + BullMQ (`@nestjs/bullmq`) | Khớp |
| Lưu trữ tệp | MinIO (bucket riêng tư) cho tài liệu; ảnh đại diện lưu cục bộ (`local-storage.provider.ts`) | Khớp một phần |
| Vector DB | Qdrant 1.20 (`@qdrant/js-client-rest`), collection `document_chunks` | Khớp |
| LLM | `LlmProvider` trừu tượng: `MockLlmProvider` (mặc định), `OpenAiLlmProvider` (Responses API, mặc định `gpt-5.4-mini`) | **Ollama: NOT_IMPLEMENTED** |
| Embedding | OpenAI `text-embedding-3-small` (`EMBEDDING_MODEL`) | Một mô hình; bge-m3 / multilingual-e5 chưa dùng |
| Thư viện RAG | Chỉ `@langchain/textsplitters` (RecursiveCharacterTextSplitter); truy hồi, prompt, trích dẫn tự viết | LangChain dùng một phần, không dùng LlamaIndex |
| Trích xuất | `unpdf` (PDF dạng chữ), `mammoth` (DOCX), TXT | Khớp |
| Triển khai | `docker-compose.yml` chỉ dựng Redis, MinIO, Qdrant cho dev; API/Web chạy `pnpm dev`; **không có Dockerfile ứng dụng, không có Nginx** | Đóng gói ứng dụng: NOT_IMPLEMENTED |

## 3. Ma trận chức năng × trạng thái

| Module | Chức năng | Nhãn | Bằng chứng |
|---|---|---|---|
| 1 | Đăng nhập/đăng xuất (JWT access 15 phút trong cookie httpOnly, refresh 7 ngày xoay vòng, phát hiện dùng lại refresh → thu hồi phiên) | VERIFIED_IMPLEMENTED | `auth/*`, `sessions/sessions.service.ts`, `config/env.validation.ts`; TC-M1-01…03 |
| 1 | Hồ sơ, ảnh đại diện (chỉ chính chủ xem), đổi mật khẩu | VERIFIED_IMPLEMENTED | `me/*`, `storage/files.controller.ts`; TC-M1-08…12 |
| 1 | Quản lý phiên (danh sách thiết bị, đăng xuất từ xa/tất cả) | VERIFIED_IMPLEMENTED | `me.controller.ts` `/me/sessions`; TC-M1-05 |
| 1 | Quản trị: tạo, sửa, đổi vai trò, khóa/mở, đặt lại mật khẩu; khóa có hiệu lực ở request kế tiếp | VERIFIED_IMPLEMENTED | `admin-users/*`, `auth/jwt.strategy.ts`; TC-M1-04, 06, 07 |
| 1 | Unit test riêng cho Module 1 | NOT_IMPLEMENTED | Không có `*.spec.ts` trong `auth`, `users`, `sessions`, `me`, `admin-users` |
| 2 | Tạo/đổi tên/xóa/tìm hội thoại; lịch sử | VERIFIED_IMPLEMENTED | `chat/conversations.*`; TC-M2-04, 05 |
| 2 | Streaming SSE (`POST /chat/stream`, ReadableStream, heartbeat 15 s), Dừng, Tạo lại, trạng thái COMPLETED/STOPPED/ERROR/TRUNCATED | VERIFIED_IMPLEMENTED | `chat/sse-response.ts`, `chat.service.ts`; 17 unit test; TC-M2-01…11 |
| 2 | Trả lời bằng OpenAI thật | VERIFIED_IMPLEMENTED (khi `LLM_PROVIDER=openai`) | `llm/openai-llm.provider.ts`, 12 unit test; TC-M2-09 |
| 2 | Chế độ mặc định | MOCK_ONLY (`LLM_PROVIDER=mock`) | `env.validation.ts` |
| 3 | Tải lên TXT / PDF dạng chữ / DOCX (≤ 20 MB), tải xuống, xóa (mềm + job dọn MinIO/Qdrant), danh sách có tìm theo tên và lọc trạng thái | VERIFIED_IMPLEMENTED | `documents/*`; SE-011…013; unit test `text-extract` (18), `sanitize-filename` (7) |
| 3 | Pipeline BullMQ: PENDING → PROCESSING → READY/FAILED, 3 lần thử, lỗi vĩnh viễn có mã (`DOCUMENT_NO_TEXT`, `…UNREADABLE`, `…TOO_MANY_CHUNKS`…) | VERIFIED_IMPLEMENTED | `document-processor.ts`, `permanent-error.ts` (4 test) |
| 3 | Chunking 1000/150 theo trang, embedding lô 100, ghi Qdrant kèm `userId`, `documentId`, `chunkIndex`, `page` | VERIFIED_IMPLEMENTED | `chunk-text.ts` (3 test), `embedding.service.ts`, `vector-store.service.ts`; TL-009 kiểm 209 point khớp |
| 3 | OCR tài liệu scan | OUT_OF_SCOPE | PDF scan → `DOCUMENT_NO_TEXT` (fixture `se013-pdf-scan.pdf`) |
| 4 | Hỏi đáp RAG: chọn ≤ 5 tài liệu, truy hồi top-5 lọc theo chủ sở hữu, prompt có khối phân cách chống chèn lệnh, trích dẫn `[n]` được xác minh, cờ `insufficientEvidence`/`ungrounded` | VERIFIED_IMPLEMENTED | `rag/rag.service.ts`, `rag-prompt.ts` (18 test); SE-014, SE-015 |
| 4 | Ngưỡng điểm `RAG_MIN_SCORE` | Có cấu hình, **mặc định tắt** (đánh giá cho thấy chồng lấn phân bố) | `env.validation.ts`; SUMMARY CP2 |
| 4 | Tóm tắt tài liệu map-reduce (job nền, lưu kết quả) | VERIFIED_IMPLEMENTED | `document-summary.ts` (4 test), `document-processor.ts`; SE-016 |
| 4 | Đánh giá RAG tiếng Việt với `text-embedding-3-small` | VERIFIED_IMPLEMENTED | `apps/api/scripts/rag-eval.mjs`; `docs/evaluation/rag-dataset/results/` |
| 4 | So sánh mô hình embedding thứ hai (`text-embedding-3-large`) | NOT_IMPLEMENTED — bị chặn chờ quyền API | SUMMARY CP4 |
| 4 | Tối ưu riêng cho tiếng Việt (viết lại câu hỏi, rerank, tách từ) | NOT_IMPLEMENTED | Không có code tương ứng |
| — | Chế độ phát hành `demo`/`staff`/`production` | VERIFIED_IMPLEMENTED | SE-003 |
| — | Đóng gói ứng dụng bằng Docker, Nginx | NOT_IMPLEMENTED | Chỉ compose hạ tầng |
| 5 | Dịch tài liệu | OUT_OF_SCOPE | — |

## 4. Kết quả đánh giá RAG đang có (dùng cho mục 4.4)

Lượt chính dùng cho báo cáo: 21/11/2026, tài liệu LF (209 đoạn), nhãn v2 — `TL-RERUN-2026-11-21.md`.

| Chỉ số | Giá trị |
|---|---|
| hit@1 / hit@3 / hit@5 | 80,0% / 97,5% / 100% |
| MRR | 0,881 |
| Từ chối đúng câu ngoài tài liệu | 10/10 |
| Từ chối nhầm (3 lượt) | 1–2/40 |
| Precision trích dẫn (3 lượt) | 92,0–95,7% |
| Coverage trích dẫn | 95–97,5% |
| Rubric 0–2 (chấm tay, lượt 1) | 1,78 |
| Độ trễ p50/p95 (lượt 1) | 1,30 s / 1,72 s |

Giới hạn: 50 câu; một mô hình embedding; rubric chấm tay một người; tài liệu Wikipedia + 2 tài liệu mô phỏng.

## 5. Đối chiếu bộ nguồn TL-004 (H-01 … H-10)

| ID | Kết luận |
|---|---|
| H-01 | **Xác nhận**: bộ nguồn mô tả code tới `783a8a3`; Module 3–4 đã có code |
| H-02 | **Xác nhận**: `documents`, `rag`, `storage` (MinIO) có trên baseline, đã tích hợp |
| H-03 | **Xác nhận**: kết quả TL-009/SE-017 có thật, chưa có trong bộ nguồn |
| H-04 | **Xác nhận**: 83 unit test tại baseline (Chat 17, OpenAI 12, RAG 18, tài liệu 36) — chưa có test Module 1 |
| H-05 | Mô tả streaming hiện tại: `toSseResponse` trả `Response` với `ReadableStream` (SE-029) — dùng code làm căn cứ |
| H-06 | Sơ đồ: vẽ mới toàn bộ cho V0.1 bằng PlantUML (nguồn tại `docs/thesis-report/diagrams/`) |
| H-07 | Ảnh Module 1–2 có sẵn (chụp tại `2f003a0`, `783a8a3`); **ảnh Module 3–4 chưa có** — chụp cần gọi OpenAI (phát sinh chi phí) → CẦN BỔ SUNG |
| H-08 | Tài liệu tham khảo: lập lại danh mục mới cho báo cáo; chưa truy cập lại từng URL trong phiên |
| H-09 | Giữ OPEN-001 |
| H-10 | Thiết kế Module 4 đã hiện thực (SE-014…016 Done); số liệu tải: không có, không viết số |
