# SE-018 — Nâng bản vá bảo mật phụ thuộc (`multer`, `next`)

Trạng thái: Done — TL review đạt, merge [PR #36](https://github.com/duong2604/cat_gpt/pull/36) → `develop` @ `6f2271d` (21/11/2026). (Senior Dev bàn giao 21/11/2026; nhận 21/11/2026; TL chuyển Sẵn sàng 20/11/2026: gate thứ tự CTO 18/11 "sau khi SE-014 merge" đã đạt — SE-014 `124ccee`; Module 4 hết task SE. Khi TL chạy thử `34b465d` ngày 20/11, `next dev` dừng ở thông báo khuyến nghị nâng bản vá bảo mật Next.js — cùng bản `next` 16.4.2 với `develop`. Chỉ vá trên `develop`; **không** sửa bản đóng băng `34b465d`. AC1 chạy `pnpm audit --prod` tại thời điểm nhận task: advisory mới phát sinh sau 18/11 cũng phải được ghi lại)
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 0,25 ngày làm việc
Phụ thuộc: không chặn kỹ thuật. **Thứ tự:** làm sau khi SE-014 merge, không xen vào SE-014 (CTO 18/11/2026)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu 21/11/2026 · bàn giao review 21/11/2026 · hoàn tất 21/11/2026
Chốt: 18/11/2026 — CTO yêu cầu ghi đề xuất nâng bản vá thành task riêng
SHA cơ sở: `origin/develop` @ `356e6a6`
PR: https://github.com/duong2604/cat_gpt/pull/36 (head đã review `539fdc9`; code ở `f92b175`, hai commit sau chỉ đổi docs; merge `6f2271d`)

## Mục tiêu
Đóng 2 advisory của `pnpm audit --prod` do TL phát hiện ngày 18/11/2026 bằng nâng bản vá. Không đổi kiến trúc, không tốn chi phí.

| Gói | Hiện tại | Advisory | Bản sửa | Mức độ phơi nhiễm hiện tại |
|---|---|---|---|---|
| `multer` (qua `@nestjs/platform-express` 12.2.0, ghim `multer@2.4.0`) | 2.4.0 | high — từ chối dịch vụ khi `fileFilter` bất đồng bộ còn chờ lúc request bị hủy | `multer` ≥ 2.5.0: `@nestjs/platform-express` 12.5.1 phụ thuộc `multer@2.5.0` | Thấp — code không dùng `fileFilter` (TL `grep` 18/11) |
| `next` (`apps/web`) | 16.4.2 | moderate ×2 — rò dữ liệu cache khi dùng `'use cache'` / `unstable_cache` | ≥ 16.4.5 (mới nhất cùng dòng: 16.4.6) | Thấp — code không dùng `'use cache'` / `unstable_cache` |

## Phạm vi
- **Làm:**
  - `@nestjs/platform-express` → 12.5.1. Nâng kèm các gói `@nestjs/*` nếu peer dependency yêu cầu, chỉ trong dòng 12.x.
  - `next` → 16.4.6 (giữ ghim chính xác như hiện tại).
  - Cập nhật `pnpm-lock.yaml`.
- **Không làm:** nâng major; đổi cấu hình; sửa code nếu không bắt buộc.

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | `pnpm audit --prod` không còn 2 advisory trên; không có advisory mới do việc nâng | Đầu ra audit trước/sau |
| AC2 | Upload không hồi quy: avatar (JPG/PNG/WEBP, quá cỡ, sai loại) và tài liệu (TXT/PDF/DOCX, `400 FILE_TOO_LARGE` cho > 25 MB) | `curl` + đếm 3 nơi |
| AC3 | Web không hồi quy: đăng nhập, Chat stream/Dừng/Tạo lại, trang Tài liệu, `staff`/`demo` | Ảnh + CI |
| AC4 | CI xanh; `pnpm build`, `typecheck`, `lint`, `test` | Link run |

## Kết quả review
**TL 21/11/2026: Đạt, đã merge.** PR #36 · SHA đã review `539fdc9` · merge `--match-head-commit` → `develop` @ `6f2271d`. AC1–AC4 đạt; chi tiết: [Review vòng 1](#review-vòng-1). Ước lượng 0,25n — Đúng ước lượng.

## Lịch sử review
### Checklist vòng 1
Nhánh `fix/dependency-security-patch` từ `origin/develop` @ `356e6a6`. Đổi: `apps/web` `next` 16.4.2 → 16.4.6 (ghim chính xác); `apps/api` `@nestjs/platform-express` ^12.0.1 → ^12.5.1 (→ 12.5.1, kéo `multer` 2.4.0 → 2.5.0); `pnpm-lock.yaml`. Không nâng major, không sửa code, không đổi cấu hình. Bản vá `@nestjs/*` khác vẫn 12.2.0 (peer 12.x thỏa).

- [x] AC1 `pnpm audit --prod` — trước: 34 advisory (9 high, 24 moderate, 1 low); sau: 26 (8 high, 17 moderate, 1 low). Hết: `multer` GHSA-q7qp-rjg7-q26m (high) và 7 advisory `next` (GHSA-mfr8, vc7v, 7qx7, f3mh, pc58, rhh4, vvgp). Không có advisory mới. — Bằng chứng: JSON audit trước/sau (`$TMPDIR/audit-before.json`, `audit-after.json`, ngoài repo).
- [ ] AC1 (ngoài phạm vi) — 26 advisory còn lại thuộc gói khác, không nằm trong SE-018 nên không vá: `undici` 8 (3 high), `mongoose` 4 (2 high), `hono` 5, `stream-json` 3, `decode-uri-component` 2, `@hono/node-server` 2, `minimatch` 1, `follow-redirects` 1 (high). Cần TL quyết định task riêng.
- [x] Dependency tree — `pnpm install --frozen-lockfile` sạch; không cảnh báo peer mới; `@nestjs/platform-express` 12.5.1 cùng `@nestjs/core`/`common` 12.2.0.
- [x] AC4 gate — `pnpm typecheck`, `pnpm lint`, `pnpm build` đều exit 0 với `--force` (không dùng cache); `pnpm -C apps/api test` 83/83 pass (8 file). `apps/web` không có unit test (không có script `test`).
- [x] AC2 upload (API thật, `127.0.0.1:4000`, `RELEASE_MODE=demo`) — avatar PNG hợp lệ `201`; avatar sai loại `400`; avatar > 5 MB `413`. TXT/PDF/DOCX (fixture `se013-*`) `201` → đều `READY`. Tài liệu > 25 MB `400 FILE_TOO_LARGE`. DOCX hỏng: `201` khi tải lên; trạng thái cuối **chưa kiểm** (ghi nhận, không phải hồi quy do vá).
- [x] AC3 Auth/Chat/Documents (qua API) — health 200; `/me` không đăng nhập `401`; admin login 200; USER `/me` 200; `/documents` USER 200, không đăng nhập `401`; admin đọc tài liệu USER `404`; USER `/admin/users` `403`, admin 200; chat thường `200` có luồng dữ liệu; chat RAG trên TXT `200` có `citation`, trả lời nêu "12 ngày".
- [x] Regression RAG/Summary — `POST /documents/:id/summary` `202` → `summaryStatus` `READY` (PDF).
- [x] Chế độ `staff`/`demo` — `demo`: `GET /documents` `200`; `staff` (khởi động lại API với `RELEASE_MODE=staff`): `GET /documents` `404` (guard `documents-hidden`). `/me/features` trả `{"chatEnabled":true}` ở cả hai chế độ.
- [ ] AC3 giao diện — chưa kiểm bằng trình duyệt (đăng nhập, Chat stream/Dừng/Tạo lại, trang Tài liệu, ảnh). Đã kiểm HTTP: `next start` build 16.4.6, `/login` `200`, route bảo vệ `307` tới đăng nhập, rewrite `/api/v1/health` `200`. Lý do: phạm vi kiểm này là API + build; ảnh UI chưa chụp.
- [x] AC4 CI tại PR head — `build` SUCCESS tại `f92b175` (code; `afd88b2` chỉ thêm docs) (run [44790199947](https://github.com/duong2604/cat_gpt/actions/runs/44790199947)); `mergeStateStatus` CLEAN.
- [x] Dữ liệu thử đã dọn — tài khoản thử tạo bằng admin, tên `SE-018 regression tester`, ID `6b008bd67101bbcc7c52cd6e`. Đã xóa theo ID đã ghi: 4 tài liệu (`6b008bd8…cd70/cd72/cd74/cd76`), 2 hội thoại (`6b008bdf…cd7b`, `6b008bdc…cd78`), avatar; xác nhận `404` sau xóa. Tài khoản **bị khóa** (`BLOCKED`) vì chưa có API xóa user. Không đụng dữ liệu khác; không chạy `text-embedding-3-large`; không đụng SE-017, PR #30/#35, worktree review, `34b465d`.
- Checklist hai vai (mục 9.1): Quyền — ca được phép và từ chối đã kiểm (401/403/404 ở trên); trạng thái trống/tải/lỗi, desktop/mobile, sáng/tối, vi/en — Không áp dụng (không đổi giao diện); chế độ `staff`/`demo` — đã kiểm; ma trận quyền/chuẩn giao diện — không đổi.
- Simplicity First: đổi 2 gói + lock; không abstraction, không dependency mới; giới hạn: vá không kéo thêm advisory ngoài phạm vi.

**Kiểm tra đã chạy:** `pnpm install --frozen-lockfile`; `pnpm audit --prod` (trước/sau); `pnpm turbo run typecheck|lint|build --force`; `pnpm -C apps/api test`; `apps/api` `node dist/main.js` + kịch bản regression API (28/28 PASS, `se018-regression.mjs`); `RELEASE_MODE=staff` kiểm `/documents`; `next start` web (`/login` 200).

**Rủi ro:** thấp — Next.js 16.4.2 → 16.4.6 và `@nestjs/platform-express` 12.2.0 → 12.5.1 cùng dòng; không breaking đã thấy qua build/typecheck/regression.

**Trạng thái:** sẽ chuyển `Chờ Review` khi mở PR (sau khi commit và push).

#### Review vòng 1
**Task** — SE-018 · PR https://github.com/duong2604/cat_gpt/pull/36 · SHA đã review `539fdc9` · vòng 1
**Kết luận** — Đạt. Merge bằng `--match-head-commit 539fdc9` → `develop` @ `6f2271d` (CI `build` SUCCESS tại head, MERGEABLE/CLEAN, base `356e6a6`).
**Checklist** (TL kiểm độc lập ở worktree `cat_gpt-review` @ `539fdc9`; API thật `LLM_PROVIDER=openai` `gpt-5.4-mini`, 500 token; tài khoản tạm `tl-smoke-*`)
- [x] Phạm vi — Đạt — 5 tệp (`apps/api/package.json`, `apps/web/package.json`, `pnpm-lock.yaml`, hồ sơ, tracker). Lockfile chỉ đổi phiên bản `next` 16.4.2 → 16.4.6 (+ `@next/*`), `@nestjs/platform-express` 12.2.0 → 12.5.1, `multer` 2.4.0 → 2.5.0; còn lại là khóa peer. Không major, không đổi code/cấu hình. (Hồ sơ ghi "12.0.1" là phạm vi trong `package.json`; bản cài thật là 12.2.0.)
- [x] AC1 — Đạt — TL tự chạy `pnpm audit --prod`: `develop` 34 → PR 26; hết đúng 8 (multer high GHSA-q7qp-rjg7-q26m; next moderate ×7); **0 advisory mới**; không còn advisory của `next`/`multer`/`@nestjs/platform-express`.
- [x] AC2 — Đạt (24/24) — avatar PNG/JPG/WEBP `201`; > 2 MB `400 FILE_TOO_LARGE`; sai loại `400 FILE_INVALID_TYPE`; ảnh: chủ `200`, ẩn danh `401`; xóa avatar. PDF text, PDF nhiều trang, DOCX → `READY`; DOCX hỏng, PDF hỏng → `FAILED DOCUMENT_UNREADABLE`; PDF scan → `FAILED DOCUMENT_NO_TEXT` (mục SE để ngỏ đã đóng); > 25 MB `400 FILE_TOO_LARGE`; `.exe` `400 FILE_INVALID_TYPE`.
- [x] AC3 — Đạt — Hồi quy M1–M4 **38/38** (auth, Chat SSE, Tạo lại, cô lập 2 user, tài liệu, `DOCUMENT_NOT_READY`/`NOT_FOUND`, tối đa 5, trích dẫn, `insufficientEvidence`, tóm tắt, xóa khi đang tóm tắt). Web Next 16.4.6 qua proxy: đăng nhập `200`, `/chat` `/documents` `/profile` `200`, ẩn danh → `307`, đã đăng nhập mở `/login` → `307 /`, Chat SSE `meta → delta → done`. **Trình duyệt (Chrome):** đăng nhập → Chat; gửi tin → stream hiển thị đủ; Tạo lại; Dừng → "Stopped"; trang Tài liệu (3 Ready, 3 Failed kèm thông báo lỗi); hộp thoại Tóm tắt → bản tóm tắt + model; 0 lỗi console. `staff`: API `/documents` `404`, trang `/documents` fallback 404, Swagger `404`, `chatEnabled: true` (LLM thật).
- [x] AC4 — Đạt — `typecheck`/`lint`/`build` `--force` exit 0 (web build "Next.js 16.4.6"); API test 83/83; CI `build` SUCCESS tại `539fdc9`.
- [x] Dữ liệu thử của TL — Đạt — xóa theo `userId` tài khoản tạm sau khi in danh sách; tài liệu xóa qua API (MinIO + Qdrant); Qdrant theo `documentId` = 0; `tl-smoke-*` = 0.

**Ghi nhận (không chặn):**
- 8 advisory **high** còn lại ngoài phạm vi: `undici` ×4 (qua `@qdrant/js-client-rest`), `mongoose` ×2, `decode-uri-component` (qua `minio`), `follow-redirects` (qua `axios` web) → đề xuất task vá phụ thuộc vòng 2, chờ CTO xếp lịch.
- Kiểm thử chạy liền nhau chạm giới hạn đăng nhập 5 lần/phút/IP (`429`) — đúng thiết kế; kịch bản kiểm cần giãn cách.
- Tài khoản thử của SE (`6b008bd67101bbcc7c52cd6e`) đang `BLOCKED` vì chưa có API xóa user — giữ, ghi để dọn khi có công cụ (SE-006).
- SE làm task trong `D:\workspace\buggysoft\cat_gpt` (thư mục dành cho CTO nghiệm thu); thư mục đó đang ở nhánh `fix/dependency-security-patch`. SE cần `git switch develop && git pull` rồi `git branch -d fix/dependency-security-patch`. Lần sau dùng worktree riêng.

**Dọn nhánh sau merge** — nhánh remote `fix/dependency-security-patch` đã xóa (TL). Nhánh local đang checkout ở thư mục SE: SE xóa.
**Trạng thái** — Done.

## Phản hồi UI
Không áp dụng.
