# SE-010 — Hạ tầng dev (Docker: Redis, MinIO, Qdrant), kiểm tra `.env` và CI tối thiểu

Trạng thái: Sẵn sàng
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: Không chặn bởi SE-003 (chỉ thêm khối mới vào `.env.example`; xem "Rủi ro xung đột"). Docker Desktop do khách hàng mở
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 16/11/2026 — CTO duyệt Wave 0–2: SE-010 triển khai hạ tầng Docker và CI; quy định `.env`/`.env.example`; Docker local một bộ dùng chung
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Một lệnh dựng được Redis, MinIO, Qdrant trên máy dev; mọi PR vào `develop` tự chạy typecheck/lint/test/build; phát hiện tự động khi `.env` lệch `.env.example`.

## Output
- `docker-compose.yml` ở gốc repo: `redis`, `minio`, `qdrant` — image có tag phiên bản cố định, healthcheck, volume có tên, cổng chỉ bind `127.0.0.1` (không mở ra mạng). Tên project compose `cat-gpt` (không đụng container/volume của dự án khác).
- MinIO: credential đọc từ biến môi trường; **không** bật bucket public. (Bucket do API tạo ở SE-011.)
- **Image (TL kiểm 16/11/2026):** `minio/minio` đã bị gỡ khỏi Docker Hub (404) và repo upstream `minio/minio` đã archive — không còn image cộng đồng. Dùng `bitnamilegacy/minio:2025.7.23-debian-12-r5` (bản MinIO đóng băng 08/2025, chỉ cho dev, bind `127.0.0.1`) — **CTO cho phép tạm thời cho local development (17/11/2026)**, không phải giải pháp production; phương án thay thế còn bảo trì (RustFS) ở [thiết kế mục 13](../design/module-3-documents.md#13-object-storage-s3-compatible-thay-minio). Redis `redis:7.4-alpine` (7.4.10), Qdrant `qdrant/qdrant:v1.20.2` — TL đã chạy thử đạt cả ba (báo cáo ngày 16/11 vòng 5).
- Máy dev có container/volume của dự án khác (ví dụ container `redis` đã dừng): **không** đụng tới; dùng tên project compose `cat-gpt` để không trùng tên.
- `apps/api/.env.example`: thêm khối biến hạ tầng theo [thiết kế Module 3 mục 8](../design/module-3-documents.md#8-cấu-hình) (`REDIS_*`, `BULLMQ_PREFIX`, `MINIO_*`, `QDRANT_*`) — giá trị minh họa, không credential thật. SE cập nhật `apps/api/.env` của mình cùng danh sách.
- `scripts/check-env.mjs` (Node chuẩn, không thêm thư viện) + script `pnpm env:check` ở gốc:
  1. Với mỗi `apps/*/.env.example`: nếu có `.env` cùng thư mục → so **tên** biến (tính cả dòng mẫu dạng `# KEY=`), in biến thiếu/thừa, thoát mã khác 0 khi lệch. **Không in giá trị.**
  2. So tên biến khai báo trong `apps/api/src/config/env.validation.ts` với `apps/api/.env.example`; thiếu → lỗi.
- `.github/workflows/ci.yml`: trên `pull_request` vào `develop` và `push` vào `develop` — pnpm (theo `packageManager`), Node 22, `pnpm install --frozen-lockfile` → `pnpm env:check` (bước 2; bước 1 bỏ qua khi không có `.env`) → `pnpm typecheck` → `pnpm lint` → `pnpm --filter @cat-gpt/api test` → `pnpm build`. Không thêm công cụ/dịch vụ CI khác.
- README mục chạy local: bật Docker Desktop → `docker compose up -d` → kiểm `docker compose ps` → cấu hình `.env` → `pnpm env:check` → `pnpm dev`. Ghi rõ lệnh dừng an toàn `docker compose stop` / `down` (**không** `-v`).

## Phạm vi
- Làm: như Output.
- Không làm: code nghiệp vụ Module 3; đóng gói Docker cho API/web; Nginx; MongoDB trong Docker (vẫn Atlas); sửa các biến hiện có thuộc SE-003.

## Nguồn yêu cầu
- CTO duyệt Wave 0–2 (16/11/2026) mục 1 (quy định `.env`), mục 2–3 (Docker local), mục 5.
- CTO vòng 2 (16/11/2026) mục 9: CI tối thiểu, không thêm công cụ ngoài nhu cầu.
- Thiết kế: [module-3-documents.md mục 4, 8](../design/module-3-documents.md#8-cấu-hình).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | `docker compose up -d` → 3 dịch vụ `healthy` | CTO 16/11 mục 2 | `docker compose ps` (dán kết quả) |
| AC2 | Kết nối thật: Redis `PING` → `PONG`; MinIO tạo bucket thử, upload rồi download một tệp, SHA-256 khớp, rồi xóa; Qdrant tạo collection thử, upsert/search 1 point, rồi xóa | CTO 16/11 mục 6 | Lệnh + đầu ra |
| AC3 | Cổng chỉ nghe trên `127.0.0.1`; MinIO không có bucket public | CTO 16/11 mục 2 | `docker compose ps` / `netstat`; `mc anonymous get` hoặc tương đương |
| AC4 | `pnpm env:check`: báo đúng khi xóa thử một biến ở `.env` (chỉ in tên); báo khi `env.validation.ts` có biến không có trong `.env.example`; đạt khi đồng bộ | CTO 16/11 mục 1.8 | Đầu ra 3 lần chạy |
| AC5 | CI chạy xanh trên chính PR này | CTO vòng 2 mục 9 | Link run |
| AC6 | CI đỏ khi cố tình làm lỗi typecheck (commit thử rồi revert trong PR) | Kiểm CI có tác dụng | Link run đỏ + run xanh sau revert |
| AC7 | Không thao tác xóa dữ liệu (`down -v`, `prune`); không đụng container/volume ngoài project `cat-gpt` | CTO 16/11 mục 2 | Ghi lệnh đã chạy |
| AC8 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt | Quy ước repo | Lệnh |

Checklist hai vai: Không áp dụng (không có API/giao diện mới) — ghi rõ trong bàn giao.

## Rủi ro xung đột
- `apps/api/.env.example` cũng bị PR #6 (SE-003) sửa → chỉ **thêm khối mới ở cuối file**; ai merge sau giải xung đột.
- `README.md` bị PR #6 sửa → chỉ thêm mục mới.

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q-INF-1 | Object storage lâu dài khi MinIO không còn image cộng đồng | Giữ `bitnamilegacy/minio` cho dev; chuyển RustFS trước task đóng gói Docker | **Chốt tạm 17/11/2026 (CTO):** `bitnamilegacy/minio` cho local dev, không production; TL đề xuất phương án còn bảo trì ([thiết kế mục 13](../design/module-3-documents.md#13-object-storage-s3-compatible-thay-minio)) |

## Kết quả review
Chưa có bàn giao.

## Lịch sử review

## Phản hồi UI
Không áp dụng.
