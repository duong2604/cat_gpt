# SE-018 — Nâng bản vá bảo mật phụ thuộc (`multer`, `next`)

Trạng thái: Chờ Review (Senior Dev bàn giao 21/11/2026; nhận 21/11/2026; TL chuyển Sẵn sàng 20/11/2026: gate thứ tự CTO 18/11 "sau khi SE-014 merge" đã đạt — SE-014 `124ccee`; Module 4 hết task SE. Khi TL chạy thử `34b465d` ngày 20/11, `next dev` dừng ở thông báo khuyến nghị nâng bản vá bảo mật Next.js — cùng bản `next` 16.4.2 với `develop`. Chỉ vá trên `develop`; **không** sửa bản đóng băng `34b465d`. AC1 chạy `pnpm audit --prod` tại thời điểm nhận task: advisory mới phát sinh sau 18/11 cũng phải được ghi lại)
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 0,25 ngày làm việc
Phụ thuộc: không chặn kỹ thuật. **Thứ tự:** làm sau khi SE-014 merge, không xen vào SE-014 (CTO 18/11/2026)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu 21/11/2026 · bàn giao review — · hoàn tất —
Chốt: 18/11/2026 — CTO yêu cầu ghi đề xuất nâng bản vá thành task riêng
SHA cơ sở: `origin/develop` @ `356e6a6`
PR: https://github.com/duong2604/cat_gpt/pull/36 (SHA đầu PR `f92b175`)

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
Chưa có (TL review PR).

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
- [x] AC4 CI tại PR head — `build` SUCCESS tại `f92b175` (run [44790199947](https://github.com/duong2604/cat_gpt/actions/runs/44790199947)); `mergeStateStatus` CLEAN.
- [x] Dữ liệu thử đã dọn — tài khoản thử tạo bằng admin, tên `SE-018 regression tester`, ID `6b008bd67101bbcc7c52cd6e`. Đã xóa theo ID đã ghi: 4 tài liệu (`6b008bd8…cd70/cd72/cd74/cd76`), 2 hội thoại (`6b008bdf…cd7b`, `6b008bdc…cd78`), avatar; xác nhận `404` sau xóa. Tài khoản **bị khóa** (`BLOCKED`) vì chưa có API xóa user. Không đụng dữ liệu khác; không chạy `text-embedding-3-large`; không đụng SE-017, PR #30/#35, worktree review, `34b465d`.
- Checklist hai vai (mục 9.1): Quyền — ca được phép và từ chối đã kiểm (401/403/404 ở trên); trạng thái trống/tải/lỗi, desktop/mobile, sáng/tối, vi/en — Không áp dụng (không đổi giao diện); chế độ `staff`/`demo` — đã kiểm; ma trận quyền/chuẩn giao diện — không đổi.
- Simplicity First: đổi 2 gói + lock; không abstraction, không dependency mới; giới hạn: vá không kéo thêm advisory ngoài phạm vi.

**Kiểm tra đã chạy:** `pnpm install --frozen-lockfile`; `pnpm audit --prod` (trước/sau); `pnpm turbo run typecheck|lint|build --force`; `pnpm -C apps/api test`; `apps/api` `node dist/main.js` + kịch bản regression API (28/28 PASS, `se018-regression.mjs`); `RELEASE_MODE=staff` kiểm `/documents`; `next start` web (`/login` 200).

**Rủi ro:** thấp — Next.js 16.4.2 → 16.4.6 và `@nestjs/platform-express` 12.2.0 → 12.5.1 cùng dòng; không breaking đã thấy qua build/typecheck/regression.

**Trạng thái:** sẽ chuyển `Chờ Review` khi mở PR (sau khi commit và push).


## Phản hồi UI
Không áp dụng.
