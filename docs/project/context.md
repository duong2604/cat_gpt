# CAT GPT — Context dự án

> Đối chiếu với `origin/develop` @ `124ccee` (19/11/2026, sau merge PR #28); hàng Module 3–4 cập nhật 19/11. Khi `develop` thay đổi, cập nhật mục 3 và ghi lại SHA.
> Hướng dẫn cài đặt và chạy local: [README.md](../../README.md#chạy-dự-án).

## 1. Mục tiêu đồ án

Xây dựng **hệ thống trợ lý AI nội bộ** hỗ trợ hội thoại và khai thác thông tin từ tài liệu bằng mô hình ngôn ngữ lớn (LLM). Đây là đồ án tốt nghiệp ngành CNTT, Trường Đại học GTVT. Thông tin đề tài, sinh viên và GVHD nằm trong [overview-and-decisions.md](overview-and-decisions.md).

## 2. Phạm vi

| Module | Nội dung | Kế hoạch (đề cương) | Thuộc phạm vi |
|---|---|---|---|
| 1 | Xác thực & quản lý người dùng | 04/10 – 18/10 | Cam kết |
| 2 | Trợ lý hội thoại (AI Chat) + streaming SSE | 19/10 – 01/11 | Cam kết |
| 3 | Quản lý tài liệu + pipeline bất đồng bộ | 02/11 – 15/11 | Cam kết |
| 4 | RAG: embedding, truy hồi, hỏi–đáp, tóm tắt | 16/11 – 29/11 | Cam kết |
| 5 | Dịch tài liệu | 14/12 – 31/12 | Mở rộng, ngoài phạm vi cam kết |

Nguồn: bảng mục 1 của [overview-and-decisions.md](overview-and-decisions.md). Đề cương gốc được giữ ngoài repo.

## 3. Trạng thái từng module

Cột **Code trên `develop`** là kết quả kiểm tra trực tiếp mã nguồn. Cột **Tài liệu ghi** là nội dung trong `docs/` và `README.md`; khi hai cột lệch nhau, tin cột code.

| Module | Code trên `develop` (đã kiểm tra) | Tài liệu ghi | Tài liệu thiết kế |
|---|---|---|---|
| 1 | ✅ Đã tích hợp qua PR #1 (merge 27/10/2026). API có `auth`, `sessions`, `users`, `me`, `admin-users`, `storage`, `health`; web có `/login`, `/profile`, `/admin/users`. Ảnh đại diện chỉ chính chủ xem được (`GET /files/avatars/:file` cần đăng nhập; màn quản trị không có ảnh) — PR #3 / [SE-002](../tasks/SE-002-avatar-requires-login.md), merge `1674425` 16/11/2026 | `module-1-auth.md`: "đã tích hợp vào `develop` qua PR #1". `README.md`: "Hoàn thành" | [module-1-auth.md](../design/module-1-auth.md) |
| 2 | ✅ Đã tích hợp qua PR #2 ([SE-001](../tasks/SE-001-chat-integration.md), merge 15/11/2026, `fbffd5b`). API có `chat` (SSE `POST /chat/stream`, hội thoại, tạo lại, dừng, giới hạn 20 tin/phút/người) và `llm` (`MockLlmProvider` mặc định; `OpenAiLlmProvider` khi `LLM_PROVIDER=openai` — PR #4 / [SE-007](../tasks/SE-007-openai-provider.md), merge `d6832e0` 16/11/2026; trạng thái `TRUNCATED` khi chạm 1.000 token); web có `/chat`, `/chat/[id]` | `module-2-chat.md`: "Đã tích hợp vào `develop`… nội dung giả lập". `README.md`: "Hoàn thành (phản hồi giả lập)" | [module-2-chat.md](../design/module-2-chat.md) |
| 3 | ✅ Hoàn thành: tải lên TXT / PDF dạng chữ / DOCX → xử lý (BullMQ) → `READY`; danh sách, tải xuống, xóa; chỉ chủ sở hữu thấy tài liệu của mình. [SE-011](../tasks/SE-011-documents-txt-backend.md) `abc5a55`, [SE-012](../tasks/SE-012-documents-txt-frontend.md) `cd386e5`, [SE-013](../tasks/SE-013-documents-pdf-docx.md) `1c45249` | — | [module-3-documents.md](../design/module-3-documents.md) |
| 4 | 🟡 Đã có backend hỏi đáp có trích dẫn: `POST /chat/stream` kèm `documentIds` → `RagService` (truy hồi Qdrant lọc theo chủ sở hữu; `citations`, `insufficientEvidence` / `ungrounded`). [SE-014](../tasks/SE-014-rag-qa-backend.md) `124ccee`. Chưa có giao diện (SE-015), tóm tắt (SE-016), đánh giá (SE-017) | — | [module-4-rag.md](../design/module-4-rag.md) |
| 5 | Chưa có | "Ngoài phạm vi cam kết" | — |

**Chế độ phát hành** (PR #6 / [SE-003](../tasks/SE-003-release-mode-navigation.md), merge `783a8a3` 17/11/2026): API `RELEASE_MODE=demo|staff` + web `NEXT_PUBLIC_RELEASE_MODE`. `staff` ẩn Tài liệu; ẩn Chat khi LLM còn là mẫu (`GET /me/features` → `chatEnabled`, `ChatHiddenGuard` trả `404`); Swagger mặc định tắt ở `staff`. Bản demo 20/11 chạy `34b465d`, không theo `develop`.

**Ngoài `develop`:** nhánh `origin/preview/module-2-4-demo` còn giao diện demo Module 3–4 với dữ liệu giả và tài liệu `docs/ket-qua-tam-thoi.md` — giữ ở preview theo quyết định khách hàng 15/11/2026, không tính vào trạng thái ở trên. Phần Module 2 của nhánh này đã lên `develop` qua SE-001.

## 4. Bản đồ mã nguồn

Monorepo pnpm workspaces + Turborepo. Chi tiết thư mục con xem [README.md](../../README.md#cấu-trúc-thư-mục).

| Package | Vai trò | Điểm vào chính |
|---|---|---|
| `apps/api` | Backend NestJS + Mongoose, prefix `/api/v1`, cổng 4000, Swagger tại `/api/v1/docs` | `src/main.ts`, `src/app.module.ts`, `src/modules/*` (controller / service / schema theo từng module), `src/common/` (guard, filter, decorator), `src/config/` |
| `apps/web` | Frontend Next.js App Router, cổng 3000, gọi API cùng origin qua rewrites | `src/app/(auth)`, `src/app/(app)` (route), `src/features/<tên>/` (`api.ts`, `hooks.ts`, `components/`), `src/components/`, `src/lib/`, `messages/{vi,en}.json`. Đọc `apps/web/AGENTS.md` trước khi sửa code Next.js |
| `packages/shared` | Enum, mã lỗi, kiểu dữ liệu, hằng số validate dùng chung FE/BE | `src/index.ts` → `constants.ts`, `enums.ts`, `error-codes.ts`, `types.ts` |

## 5. Nguồn tham chiếu

- [README.md](../../README.md): công nghệ, cấu trúc, chạy local, thiết kế xác thực, quy ước Git.
- [overview-and-decisions.md](overview-and-decisions.md): quyết định kiến trúc D-01…D-11, nguyên tắc làm việc, sự cố môi trường.
- [workflow.md](workflow.md): quy trình TL ↔ Senior Dev, trạng thái task, mẫu task và mẫu báo cáo.
- [docs/README.md](../README.md): mục lục toàn bộ tài liệu.
