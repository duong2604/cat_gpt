# SE-010 — Hạ tầng dev (Docker: Redis, MinIO, Qdrant), kiểm tra `.env` và CI tối thiểu

Trạng thái: Done
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: Không chặn bởi SE-003 (chỉ thêm khối mới vào `.env.example`; xem "Rủi ro xung đột"). Docker Desktop do khách hàng mở
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu 17/11/2026 · bàn giao review 17/11/2026 (vòng 1) · hoàn tất 17/11/2026
Chốt: 16/11/2026 — CTO duyệt Wave 0–2: SE-010 triển khai hạ tầng Docker và CI; quy định `.env`/`.env.example`; Docker local một bộ dùng chung
SHA cơ sở: `origin/develop` @ `783a8a3`
PR: [#11](https://github.com/duong2604/cat_gpt/pull/11)

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
- **Done 17/11/2026** — PR [#11](https://github.com/duong2604/cat_gpt/pull/11), SHA đầu PR đã review `49e8886`, merge `9f502d1` (`gh pr merge 11 --merge --match-head-commit 49e8886…`); CI xanh trên đầu PR ([run](https://github.com/duong2604/cat_gpt/actions/runs/43946533786) cho code, đầu PR `49e8886` chỉ thêm tài liệu, CI cũng xanh) và trên `develop` (push `9f502d1`).
- Review TL vòng 1 (`7fa3894`): **Cần sửa** — CI đỏ ở typecheck web ([báo cáo 17/11 vòng 3](../reports/daily/2026-11-17.md#vòng-3--0310)); Senior Dev sửa `597599b` (`next typegen && tsc --noEmit`), làm AC6 (`f66d7a7` đỏ → `8587ac6` revert xanh), ghi checklist `49e8886`. Kết luận từng AC: [Review vòng 1–2 (TL)](#review-vòng-12-tl).
- Xác minh trên `develop` @ `9f502d1` (TL, 17/11 03:13): code trùng SHA đã review (`git diff` rỗng); `pnpm env:check` OK (api, web, `env.validation.ts`); xóa `apps/web/.next` rồi typecheck 4/4; lint 3/3; api test 12/12; build 3/3.
- Dọn nhánh: remote `feature/dev-infra-ci` đã xóa; nhánh local ở worktree Senior Dev → Senior Dev dọn (workflow 2.1). Còn 1 volume Docker ẩn danh `528240a6…` do Senior Dev tạo khi tìm hiểu image (không dùng; lệnh xóa bị kiểm soát quyền chặn) — TL không tự xóa (CTO cấm xóa volume ngoài quy trình); chờ khách hàng cho phép `docker volume rm 528240a6a20e…`.

## Lịch sử review
### Checklist vòng 1
**Task** — SE-010 · PR [#11](https://github.com/duong2604/cat_gpt/pull/11) · SHA đầu PR `7fa3894` (vòng 1; SHA đầu nhánh `d09f764` chỉ đổi trạng thái task, không có code) · vòng 1
**Kết quả** — `docker-compose.yml` (project `cat-gpt`: redis/minio/qdrant, healthcheck, volume có tên, cổng chỉ `127.0.0.1`); `scripts/check-env.mjs` + `pnpm env:check`; khối biến hạ tầng trong `apps/api/.env.example` + `env.validation.ts` (`MINIO_ACCESS_KEY`/`SECRET_KEY` bắt buộc, còn lại có mặc định); `.github/workflows/ci.yml`; README mục chạy Docker local. Phát hiện và sửa thêm ngoài Output gốc: `apps/api/src/modules/llm/openai-llm.provider.spec.ts` (fixture thiếu 2 biến MinIO mới, `validateEnv()` giờ yêu cầu) và `apps/web/package.json` (`typecheck` thiếu `next typegen` — Next 16 sinh `LayoutProps`/`PageProps` lúc build/dev, máy tôi đã có `.next/types` cũ nên không thấy lỗi cục bộ; CI chạy từ checkout sạch thì lộ ra — commit `597599b`, bằng chứng ở mục "Kiểm tra đã chạy").

**Theo engineering-guide (5 mục bắt buộc):**
1. **Đổi gì, vì sao** — như trên; mục tiêu: một lệnh dựng được 3 service cho SE-011, CI tự chạy build/typecheck/lint/test, và phát hiện sớm `.env` lệch `.env.example`.
2. **Vì sao là cách đơn giản nhất** — `check-env.mjs` dùng `fs`/`path`/`url` chuẩn (không thêm thư viện); so khớp bằng regex trên quy ước đặt tên biến hiện có (UPPER_SNAKE_CASE, một dòng một biến) thay vì viết/thêm một trình phân tích TypeScript. CI 1 job tuần tự theo đúng thứ tự Output đã duyệt (không tách job song song, không cache `.turbo` — xem mục "từ chối" bên dưới). Qdrant không có `curl`/`wget` nên healthcheck dùng `/dev/tcp` của bash để kiểm cổng chấp nhận kết nối (không dựng khung HTTP thủ công — đã đơn giản hóa ở vòng `/simplify`, xem dưới).
3. **Abstraction/dependency mới** — Không có. Không thêm package nào (image Docker không tính là dependency runtime của code).
4. **Test đã chạy + kết quả** — xem "Kiểm tra đã chạy" và checklist AC1–AC8 bên dưới; mọi kết quả đều từ lệnh chạy thật trong phiên này, không suy đoán.
5. **Giới hạn còn lại, rủi ro** — `bitnamilegacy/minio` là ảnh tạm cho dev (Q-INF-1, CTO chốt 17/11), không dùng production. `check-env.mjs` so khớp `env.validation.ts` bằng regex theo khuôn thụt 2 dấu cách — đủ dùng với quy ước hiện tại, đã ghi `ponytail:` tại chỗ nêu hướng nâng cấp (import trực tiếp class) nếu khuôn đổi. CI là 1 job tuần tự — chấp nhận wall-clock chậm hơn job song song, đổi lấy đúng "CI tối thiểu" đã chốt.

**Đã chạy `/simplify` trên diff (4 agent song song: reuse/simplification/efficiency/altitude) — nhận 2, ghi chú 1, từ chối 3:**
- Nhận: gộp 2 hàm parse gần giống nhau trong `check-env.mjs` thành một `namesMatching(path, regex)`, đồng thời bỏ việc đọc `apps/api/.env.example` hai lần (tái dùng Set đã tính trong vòng lặp).
- Nhận: đơn giản hóa healthcheck Qdrant — bỏ khung HTTP thủ công (`printf`/`head`/`grep "200 OK"`, vừa phức tạp vừa có thể báo "unhealthy" sai nếu `/` không trả đúng 200), chỉ còn kiểm cổng chấp nhận kết nối.
- Ghi chú (không đổi code): `check-env.mjs` so khớp `env.validation.ts` bằng regex là một giới hạn biết trước — đã thêm comment `ponytail:` nêu rõ và hướng nâng cấp, thay vì viết lại thành test import class thật (đổi kiến trúc ngoài phạm vi vòng 1).
- Từ chối: tách CI thành nhiều job song song / cache `.turbo` — vượt phạm vi "CI tối thiểu, không thêm công cụ ngoài nhu cầu" (CTO vòng 2 mục 9).
- Từ chối: chạy `pnpm env:check` trước `pnpm install` trong CI — đúng về tốc độ nhưng lệch thứ tự bước đã ghi trong Output (đã duyệt).
- Từ chối: đổi `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY` thành tùy chọn (theo mẫu `OPENAI_API_KEY`) — trái với Output đã duyệt ("tất cả có mặc định trừ 2 biến này, bắt buộc").

**Checklist**
- [x] AC1 — `docker compose up -d` rồi `docker compose ps`: cả 3 `(healthy)`, cổng `127.0.0.1:6379`/`127.0.0.1:9000-9001`/`127.0.0.1:6333-6334`
- [x] AC2 — Redis: `docker exec ... redis-cli PING` → `PONG`. MinIO: `mc mb`, `mc put` (SHA-256 nguồn `bf53d630…8c38494c8e`), `mc get`, `sha256sum` 2 file khớp, `mc rm`/`mc rb` dọn sạch. Qdrant: tạo collection `se010_test_collection` (size 4, Cosine) → upsert 1 point → search cùng vector → khớp đúng point (`score: 1.0`) → `DELETE` collection, cả 3 bước `status: "ok"`
- [x] AC3 — `docker compose ps` chỉ liệt `127.0.0.1:...`, không có `0.0.0.0`; `mc anonymous get local/se010-test-bucket` → `Access permission ... is private`
- [x] AC4 — 3 lần chạy `pnpm env:check`: (1) xóa thử `QDRANT_COLLECTION` khỏi `.env` → `THẤT BẠI`, in đúng tên biến thiếu, không in giá trị; (2) thêm thử biến `SE010_TEST_ONLY_VAR` vào `env.validation.ts` → `THẤT BẠI`, báo đúng thiếu trong `.env.example`; (3) khôi phục cả hai → `OK` cả 3 dòng kiểm tra — chạy lại đủ 3 kịch bản sau khi `/simplify` gộp hàm, kết quả không đổi
- [x] AC5 — CI xanh trên PR #11: [run `43946533786`](https://github.com/duong2604/cat_gpt/actions/runs/43946533786/job/133577574939) (sau khi sửa `next typegen`)
- [x] AC6 — commit thử lỗi kiểu (`f66d7a7`, ép `number` nhận chuỗi trong `main.ts`) → CI đỏ: [run `43946368329`](https://github.com/duong2604/cat_gpt/actions/runs/43946368329/job/133576993702); `git revert` (`8587ac6`) → CI xanh lại: [run `43946533786`](https://github.com/duong2604/cat_gpt/actions/runs/43946533786/job/133577574939)
- [x] AC7 — không chạy `down -v`/`prune`; `docker ps -a`/`docker volume ls` trước và sau khi làm chỉ khác các container/volume tên `cat-gpt*` của task này, container/volume dự án khác (`redis`, `dot-logs-redis-1`, `rabbitmq`, `be_wise_*`, …) nguyên vẹn. **Có sót 1 việc dọn:** lệnh `docker run --rm` để xem script cài sẵn trong image MinIO (lúc tìm hiểu biến môi trường đúng của image) để lại 1 volume ẩn danh (`528240a6a20e…`, tạo `17:32:42Z` hôm nay) — xóa bị quyền hệ thống chặn (hành động xoá dữ liệu), chưa dọn được; ghi lại để TL hoặc Senior Dev phiên sau xóa thủ công (`docker volume rm 528240a6a20ebc989d5f8f29613bccbaa8449b5277b7020b9cc99e6c16da6388`) — không phải volume đang dùng, không mất dữ liệu nếu xóa
- [x] AC8 — `pnpm build` 4/4, `pnpm typecheck` 4/4, `pnpm lint` 3/3 đạt; `pnpm --filter @cat-gpt/api test` 12/12 đạt (thêm 2 dòng `MINIO_ACCESS_KEY`/`SECRET_KEY` vào fixture có sẵn)

**Kiểm tra đã chạy** — toàn bộ lệnh và kết quả ở checklist AC1–AC8 trên (chạy thật trong phiên, không có bước nào suy đoán); `pnpm install --frozen-lockfile`, `pnpm build`/`typecheck`/`lint` (gốc, cả workspace), `pnpm --filter @cat-gpt/api test`; đã dừng Docker an toàn (`docker compose stop`, không `-v`) sau khi kiểm xong
**Dọn nhánh trước khi nhận task này** (mục 2.1) — `develop` local → `783a8a3` (= `origin/develop` lúc nhận task); đã dọn: `feature/release-mode` (SE-003, đã merge PR #6 @ `783a8a3`, `git branch -d` thành công); không còn nhánh/worktree nào khác của Senior Dev cần dọn
**Trạng thái** — Chờ Review

#### Review vòng 1–2 (TL)
TL (17/11/2026). Vòng 1 @ `7fa3894` ghi ở [báo cáo 17/11 vòng 3](../reports/daily/2026-11-17.md#vòng-3--0310) (Cần sửa: CI đỏ, thiếu AC6, thiếu checklist). Vòng 2 @ `49e8886` — **Đạt**:
- [x] AC1 — PASS — TL kiểm 3 container `healthy`, image `redis:7.4-alpine`, `bitnamilegacy/minio:2025.7.23-debian-12-r5`, `qdrant/qdrant:v1.20.2`
- [x] AC2 — PASS — TL tự chạy: Redis `PONG`; MinIO bucket thử, upload/download SHA-256 trùng, đã xóa; Qdrant tạo/xóa collection thử
- [x] AC3 — PASS — cổng chỉ `127.0.0.1`; bucket `private`
- [x] AC4 — PASS — TL chạy `pnpm env:check` trên `develop`: phát hiện `.env` của TL thiếu 11 biến hạ tầng (đúng mục đích), sau đồng bộ → OK; không in giá trị
- [x] AC5 — PASS — CI xanh [run 43946533786](https://github.com/duong2604/cat_gpt/actions/runs/43946533786); nguyên nhân lỗi vòng 1 (kiểu Next.js sinh tự động) TL tái hiện được: không có `.next` → 6 lỗi, `next typegen` → 0
- [x] AC6 — PASS — `f66d7a7` → [run đỏ 43946368329](https://github.com/duong2604/cat_gpt/actions/runs/43946368329) đúng bước `pnpm typecheck`; `8587ac6` revert → xanh; `git diff 597599b 8587ac6` rỗng
- [x] AC7 — PASS có ghi chú — chỉ project `cat-gpt`; container dự án khác nguyên trạng (TL kiểm `docker ps -a`); 1 volume ẩn danh sót lại, chờ cho phép xóa
- [x] AC8 — PASS — TL chạy trên `develop`
- Ghi nhận, không chặn: `redis:7.4-alpine` trôi bản vá; cảnh báo Node 20 của GitHub Actions; checklist ghi "vòng 1" nhưng gồm cả bản sửa vòng 2 — chấp nhận

## Phản hồi UI
Không áp dụng.
