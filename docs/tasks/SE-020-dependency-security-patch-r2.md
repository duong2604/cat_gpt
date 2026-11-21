# SE-020 — Vá phụ thuộc bảo mật vòng 2 (`undici`, `mongoose`, `axios`/`follow-redirects`, phân loại `shadcn`)

Trạng thái: Đang làm
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 0,5 ngày làm việc
Phụ thuộc: [SE-018](SE-018-dependency-security-patch.md) Done (`6f2271d`) — đạt. Không chặn bởi nghiệm thu M1–M4 (không đổi code, không đổi hành vi). Làm **trước** SE-005
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu 21/11/2026 · bàn giao review — · hoàn tất —
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
- `apps/api/package.json`: `mongoose` `~9.11.4` (dấu `~` để không phân giải lên 9.12.3).
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
| Q2 | Lockfile churn khi dùng `pnpm add/update` | Sửa `package.json` trực tiếp, `mongoose` `~9.11.4`, chỉ đổi các gói trong danh sách | TL chốt 21/11/2026 10:40 |

## Kết quả review
Chưa có.

## Lịch sử review
### Checklist vòng 1
**Task** — SE-020 · PR <sẽ ghi sau khi mở> · SHA đầu PR `<sẽ ghi>` · vòng 1
**Kết quả** — 4 thay đổi theo Output (`pnpm-workspace.yaml` override `undici@7: 7.30.2`; `apps/api` `mongoose ~9.11.4`; `apps/web` `axios ^1.21.1`, `shadcn` → devDependencies). Lockfile đổi theo Q2. Không đổi code, không major.
**Checklist**
- [x] AC1 audit — trước 26 (8 high, 17 moderate, 1 low) → sau **5** (1 high, 4 moderate): `decode-uri-component` GHSA-qr28-fpjm-wq7f (high), GHSA-vcc3-ghjq-m6fr; `stream-json` GHSA-528h-pc64-c93x, GHSA-hqr4-qq8f-hg3x, GHSA-mjw6-4jj6-33hc. Đã hết toàn bộ advisory `undici`, `mongoose`, `follow-redirects`, nhóm `shadcn`/hono/minimatch. **0 advisory mới**. Bằng chứng: JSON trước/sau (`$TMPDIR/se020-audit-before.json`, `se020-audit-final.json`, ngoài repo).
- [x] AC2 diff/lockfile — `git diff --stat`: 4 file mục Output + `pnpm-lock.yaml` + hồ sơ/tracker. Khóa đổi đúng nhóm trong Q2: bỏ `axios@1.20.0`, `follow-redirects@1.16.1`, `mongoose@9.11.3`, `mquery@6.0.0`, `undici@7.29.1`, `undici@7.30.1`; thêm `axios@1.21.1`, `follow-redirects@1.16.3`, `mongoose@9.11.4`, `mquery@6.0.1` (phụ thuộc trực tiếp của mongoose), `undici@7.30.2`. Ngoài ra pnpm đổi hậu tố peer của một số khóa (`openai`, `langsmith`, `@langchain/*`, `@nestjs/mongoose`, `eslint-plugin-import` và nhóm eslint) vì chúng phụ thuộc `undici`/`typescript` — không đổi phiên bản gói. `pnpm why undici mongoose follow-redirects -r`: `undici 7.30.2`, `mongoose 9.11.4`, `follow-redirects 1.16.3`, `axios 1.21.1`.
- [x] AC2 cảnh báo peer — `unmet peer typescript@^5.0.0 (found 6.0.3)` của `vite-tsconfig-paths` 5.1.4 → `tsconfck` 3.1.6 (devDependency `apps/api`) **có sẵn trong đồ thị develop, không do SE-020**. Bằng chứng: cài sạch `b7af2fb` (thư mục tạm, `git archive`) → `--lockfile-only` 0 cảnh báo; đổi trung tính spec `minio` `^8.0.7` → `>=8.0.7 <9` trên cùng bản đó → 1 cảnh báo. `tsconfck@3.1.6` có trong lockfile `b7af2fb`. Phiên bản `vite-tsconfig-paths` 5.1.4 không đổi.
- [ ] AC3 hồi quy DB (API thật `127.0.0.1:4000`, DB dùng chung, nhánh này) — **đạt một phần**: 28/28 kịch bản: `/health` 200; `/me` không đăng nhập 401; admin đăng nhập 200; tạo user thử 201; user đăng nhập và `/me` 200; avatar hợp lệ 201, sai loại 400, > 5 MB 413; upload TXT/PDF/DOCX 201 → READY; DOCX hỏng 201; > 25 MB 400 `FILE_TOO_LARGE`; admin đọc tài liệu user 404; `/admin/users` admin 200, user 403; `/documents` không đăng nhập 401; chat thường stream 200 có dữ liệu; RAG 200 có `citation`, trả lời "12 ngày"; summary 202 → READY; `/me/features` 200. Phase 2: làm mới token `/auth/refresh` 204 (đúng thiết kế `HttpCode(NO_CONTENT)`, kịch bản kỳ vọng sai ở lần đầu, đã sửa), `/me` sau refresh 200; `POST /conversations/:id/stop` 204; `regenerate` stream 200 có dữ liệu; admin xóa tài liệu user 404. **Chưa kiểm**: đăng xuất (`/auth/logout`), CRUD hội thoại đầy đủ (chỉ đọc/xóa), quản trị đổi trạng thái user ngoài bước khóa dọn dữ liệu, `/admin/users` tạo/sửa đầy đủ.
- [ ] AC4 Qdrant — **đạt một phần**: trước khi xóa, mỗi tài liệu TXT/PDF/DOCX có 1 vector theo `documentId` (collection `document_chunks`). Sau `DELETE` cả 4 tài liệu thử, đếm lại = **0** (poll 8 giây). Citation có trong RAG. **Chưa kiểm**: nhánh `insufficientEvidence` (chưa có kịch bản câu hỏi ngoài tài liệu được ghi nhận riêng).
- [ ] AC5 web — **chưa đạt đủ**: `pnpm build` web 16.4.6 thành công (trong turbo build). `next start` cổng 3000: `/login` 200, rewrite `/api/v1/health` 200. Trình duyệt (Chrome, user thử): đăng nhập → Chat (tạo hội thoại, stream) → Tạo lại → trang Tài liệu tải bình thường; console **0 lỗi**. **Chưa kiểm**: nút Dừng trên giao diện (chỉ kiểm qua API), tự làm mới access token khi hết hạn (cần chờ TTL), kiểm tra ảnh sidebar/theme bằng ảnh chụp đối chiếu.
- [x] AC6 gate — `pnpm turbo run typecheck lint build --force`: 8/8 task thành công (exit 0). `pnpm -C apps/api test`: 8 file, **83/83** pass. CI `build` tại SHA đầu PR: **chưa có** (chờ push).
- [x] AC7 dữ liệu thử — đã dọn theo ID đã ghi: 4 tài liệu (đã xóa, Qdrant 0); 3 hội thoại (`6b0116bb…e6c6`, `6b0116b8…e3c3`, `6b011731…e3cf`, mỗi hội thoại xác minh chủ sở hữu trước khi xóa, đều `204`); avatar (`200`); user thử `6b0116b2d17505482276e3b9` bị **khóa `BLOCKED`** (`200`) vì chưa có API xóa user — giống SE-018. Không dùng tài khoản thật; không đụng dữ liệu khác.
- Không chạy `text-embedding-3-large`; không đụng SE-017, SE-019, `34b465d`, dữ liệu Atlas ngoài user thử; không đổi `D:\workspace\buggysoft\cat_gpt`.
- Simplicity First: 4 thay đổi cấu hình, không code, không dependency mới; `mquery` là phụ thuộc của mongoose; giới hạn: 5 advisory `minio` còn lại (Q1).

**Kiểm tra đã chạy:** `pnpm install --frozen-lockfile` (cài theo lockfile); `pnpm audit --prod` (trước/sau); `pnpm turbo run typecheck lint build --force`; `pnpm -C apps/api test`; API `dist/main.js` + kịch bản hồi quy 28/28 và phase 2; `next start` + trình duyệt (login, chat, regenerate, documents); dọn dữ liệu theo ID.

**Dọn nhánh trước khi nhận task này** — không có nhánh SE nào để dọn ngoài `fix/dependency-security-patch` đã xóa trước đó; `develop` local @ `b7af2fb`; còn giữ: `docs/se-014-done` (nhánh tài liệu TL, không phải của SE).

**Trạng thái** — Chờ Review (sau khi PR mở; còn AC3–AC5 chưa đủ, ghi rõ ở trên để TL quyết định).

## Phản hồi UI
Không áp dụng (không đổi giao diện).
