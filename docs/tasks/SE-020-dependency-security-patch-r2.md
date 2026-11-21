# SE-020 — Vá phụ thuộc bảo mật vòng 2 (`undici`, `mongoose`, `axios`/`follow-redirects`, phân loại `shadcn`)

Trạng thái: Sẵn sàng
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 0,5 ngày làm việc
Phụ thuộc: [SE-018](SE-018-dependency-security-patch.md) Done (`6f2271d`) — đạt. Không chặn bởi nghiệm thu M1–M4 (không đổi code, không đổi hành vi). Làm **trước** SE-005
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 21/11/2026 — chỉ thị CTO "TL Onboarding 21/11 mục 3": TL được giao SE phần vá patch/minor an toàn, không đổi kiến trúc; phần cần major / chấp nhận rủi ro trình CTO (mục "Ngoài phạm vi" dưới)
SHA cơ sở: `origin/develop` @ `b7af2fb`
PR: <Senior Dev ghi khi bàn giao>

## Mục tiêu
`pnpm audit --prod` trên `develop` @ `b7af2fb` còn **26 advisory (8 high, 17 moderate, 1 low)** sau SE-018. Đóng **21/26** (7/8 high) bằng nâng patch/minor và một override cấp patch, không đổi code, không nâng major. 5 advisory còn lại đi qua `minio` (chưa có bản sửa upstream) → chờ CTO quyết định, **không** làm trong task này.

## Phân tích (TL, 21/11/2026 10:35, audit tại `b7af2fb`)

| Gói (bản hiện tại) | Loại | Đường dẫn | Advisory | Phơi nhiễm thực tế | Bản vá | Rủi ro nâng |
|---|---|---|---|---|---|---|
| `undici` 7.29.1 | Transitive | `api > @qdrant/js-client-rest@1.20.0 > undici` (ghim **chính xác** `7.29.1`; 1.20.0 là bản Qdrant client mới nhất) | high: GHSA-xjj6-f33q-929c, GHSA-4w7w-5xrc-9h26, GHSA-2m5v-pch6-74hx, GHSA-qrxm-fqhp-jwvm · moderate: GHSA-4qv8-2p9j-2685, GHSA-f72v-6w45-q472, GHSA-9fm3-97px-rjf6, GHSA-55wc-3pg8-jfw6 | Thấp — client chỉ gọi Qdrant nội bộ `http://localhost:6333` (không TLS, không redirect, server tin cậy). Không nhận URL từ người dùng | 7.30.2 qua `overrides` (cùng dòng 7.x) | Thấp — patch; Qdrant client không có bản mới nên override là cách duy nhất |
| `mongoose` 9.11.3 | **Direct** (`apps/api`) | `api > mongoose` | high: GHSA-gg4r-jv3p-qx3c, GHSA-8332-j7wj-wjw4 · moderate: GHSA-wr5m-5jph-8m96, GHSA-6972-9mcm-vhwj | Trung bình — thư viện truy cập DB chính, dữ liệu người dùng đi qua `set`/hydrate. (GHSA-gg4r: code không dùng `sanitizeFilter`; không dùng discriminator) | 9.11.4 (patch; cùng `mongodb ~7.7`) | Thấp |
| `follow-redirects` 1.16.1 | Transitive | `web > axios@1.20.0 > follow-redirects` | high: GHSA-mrwp-f3q8-3g9p | Không đáng kể — `axios` chỉ chạy trên trình duyệt (`baseURL: "/api/v1"` tương đối, `apps/web/src/lib/api/client.ts`), không dùng adapter Node | `axios` ^1.21.1 (minor) → `follow-redirects` 1.16.3 | Thấp |
| `hono` 4.13.13, `@hono/node-server` 2.1.5, `minimatch` 10.2.6 | Transitive của **công cụ CLI** | `web > shadcn > @modelcontextprotocol/sdk > …`, `web > shadcn > ts-morph > …` | moderate ×7, low ×1: GHSA-4m76-xfj5-7975, GHSA-h7mg-cq63-vhpq, GHSA-3gg2-335m-rxc6, GHSA-46wx-v44x-9hh2, GHSA-4h7h-rv7c-7m2v, GHSA-qv5m-9pm6-hqp3, GHSA-jpvv-r467-5p4w, GHSA-g3hv-75wg-m249 | Không — `shadcn` là CLI sinh component; runtime chỉ dùng `@import "shadcn/tailwind.css"` lúc **build** (`apps/web/src/app/globals.css:3`). Không có server hono nào chạy | Chuyển `shadcn` từ `dependencies` sang `devDependencies` (không đổi phiên bản) | Thấp — build vẫn có devDependencies; không có quy trình cài `--prod` rồi build |

**Ngoài phạm vi — chờ CTO** (5 advisory, cùng gốc `api > minio@8.0.7`, bản mới nhất):
- `decode-uri-component` 0.2.2 (qua `query-string@7`): high GHSA-qr28-fpjm-wq7f, moderate GHSA-vcc3-ghjq-m6fr. Bản sửa 0.5.1 là **ESM-only** → override vào `query-string@7` (CommonJS) có thể làm `minio` lỗi khi `require`.
- `stream-json` 1.9.1: moderate GHSA-528h-pc64-c93x, GHSA-hqr4-qq8f-hg3x, GHSA-mjw6-4jj6-33hc. Bản sửa ≥ 3.6.0 là **major**.
- Phơi nhiễm: thấp — `minio` xử lý phản hồi từ MinIO nội bộ (tin cậy), không nhận chuỗi URL/JSON từ người dùng.

**Kiểm khả thi của TL** (worktree `cat_gpt-review`, chỉ `--lockfile-only`, đã hoàn nguyên, không commit): áp 4 thay đổi trên → `pnpm audit --prod` còn **5** (1 high, 4 moderate), đúng nhóm `minio`. Lockfile: `undici@7.30.2`, `mongoose@9.11.4`, `axios@1.21.1`, `follow-redirects@1.16.3`. Chưa build/test — phần của SE.

## Output
- `pnpm-workspace.yaml`: khóa `overrides` với `undici@7: 7.30.2` (pnpm 10.28 cảnh báo bỏ qua trường `pnpm` trong `package.json`; đặt override ở `pnpm-workspace.yaml`).
- `apps/api/package.json`: `mongoose` `^9.11.4`.
- `apps/web/package.json`: `axios` `^1.21.1`; `shadcn` chuyển sang `devDependencies` (giữ `^4.22.1`).
- `pnpm-lock.yaml` cập nhật tương ứng.

## Phạm vi
- **Làm:** đúng 4 thay đổi ở mục Output.
- **Không làm:** nâng major; nâng `@qdrant/js-client-rest`, `minio`, `@nestjs/*`, `next`; override `decode-uri-component` / `stream-json`; sửa code/cấu hình; đụng bản đóng băng `34b465d`; chạy `text-embedding-3-large`.

## Nguồn yêu cầu
- Yêu cầu/quyết định đã duyệt: chỉ thị CTO 21/11/2026 mục 3 (Security Audit vòng 2); đề xuất "task vá phụ thuộc vòng 2" ở [SE-018 Review vòng 1](SE-018-dependency-security-patch.md#review-vòng-1).
- Function Spec / Basic Design: không đổi hành vi — áp dụng hồi quy theo [Module 3](../design/module-3-documents.md) và [Module 4](../design/module-4-rag.md) như SE-018.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | `pnpm audit --prod` từ 26 còn **5**, chỉ gồm 2 `decode-uri-component` + 3 `stream-json` (qua `minio`); **0 advisory mới** | Chỉ thị CTO mục 3 | JSON audit trước/sau, liệt kê GHSA đã hết |
| AC2 | Diff chỉ gồm `pnpm-workspace.yaml`, `apps/api/package.json`, `apps/web/package.json`, `pnpm-lock.yaml` (+ hồ sơ task, tracker). Lockfile chỉ đổi các gói ở mục Output và phụ thuộc trực tiếp của chúng; `pnpm install --frozen-lockfile` sạch, không cảnh báo peer **mới** | Phạm vi | `git diff --stat`, `pnpm why undici mongoose follow-redirects shadcn -r` |
| AC3 | DB không hồi quy (`mongoose`): đăng nhập/làm mới token/đăng xuất; CRUD hội thoại; tài liệu (tạo → READY → xóa); quản trị người dùng; cô lập 2 user (`404` tài liệu người khác) | Module 1–4 | Kịch bản hồi quy M1–M4 (38 bước như SE-018) |
| AC4 | Qdrant không hồi quy (`undici`): upload TXT → READY (ghi vector); hỏi tài liệu có `citation`; `insufficientEvidence`; xóa tài liệu → điểm Qdrant theo `documentId` = 0 | Module 3–4 | API thật + đếm Qdrant |
| AC5 | Web không hồi quy (`axios`, `shadcn`): `pnpm build` web thành công, CSS sidebar/theme hiển thị đúng; trình duyệt: đăng nhập → Chat stream/Dừng/Tạo lại → Tài liệu → hỏi tài liệu; tự làm mới token khi access token hết hạn; 0 lỗi console | Module 1–2, 4 | Ảnh + console |
| AC6 | `pnpm typecheck`, `pnpm lint`, `pnpm build` (`--force`), `pnpm -C apps/api test`; CI `build` xanh tại SHA đầu PR | Quy ước repo | Lệnh + link run |
| AC7 | Dữ liệu thử dọn theo `_id`/`userId` ghi lúc tạo ([workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành)); không dùng tài khoản thật | Workflow 9.1 | Danh sách id trước/sau xóa |

## Triển khai và rollback
- **Triển khai:** nhánh `fix/dependency-security-patch-r2` từ `origin/develop` mới nhất tại thời điểm tạo; **worktree riêng của SE** (không dùng `D:\workspace\buggysoft\cat_gpt` — thư mục dành cho CTO nghiệm thu). Sau merge, máy chạy demo cần `pnpm install`.
- **Rollback:** `git revert -m 1 <merge SHA>` trên nhánh mới qua PR, rồi `pnpm install --frozen-lockfile`. Không có migration dữ liệu nên không cần khôi phục DB. Có thể rollback riêng từng gói (bỏ override `undici`, hạ `mongoose` về 9.11.3) nếu chỉ một nhánh hồi quy.
- **Dừng và báo TL** nếu: cần nâng major; `pnpm install` đòi đổi gói ngoài danh sách; bất kỳ AC3–AC5 nào hồi quy.

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q1 | 5 advisory qua `minio` (1 high) | Chấp nhận rủi ro tạm thời (MinIO nội bộ, tin cậy), theo dõi bản `minio` mới; xem lại trước thử nội bộ 500 nhân sự | Chờ CTO |

## Kết quả review
Chưa có.

## Lịch sử review
Chưa có.

## Phản hồi UI
Không áp dụng (không đổi giao diện).
