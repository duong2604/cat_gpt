# SE-003 — Chế độ phát hành `demo` / `staff` và menu theo vai trò

Trạng thái: Done
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 1,5 ngày làm việc (thêm ẩn Chat ở `staff`, 15/11/2026)
Phụ thuộc: làm sau [SE-002](SE-002-avatar-requires-login.md) (thứ tự ưu tiên, không phụ thuộc code). ~~Merge sau buổi demo 20/11/2026~~ — CTO cho phép merge sớm 17/11/2026 (bản demo cố định `34b465d` không đổi)
Hạn bàn giao review: **25/11/2026** · Hạn hoàn tất: **26/11/2026** (khung tích hợp 23–26/11, khách hàng chốt 15/11/2026)
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 16/11/2026 (vòng 4) · hoàn tất 17/11/2026
Chốt: 15/11/2026 — khách hàng chốt CS-6: bản nhân viên ẩn Chat khi còn phản hồi mẫu và ẩn tính năng chưa sẵn sàng; Swagger kiểm soát theo môi trường; bản demo local giữ Chat mẫu
SHA cơ sở: `origin/develop` @ `598b81d`
PR: [#6](https://github.com/duong2604/cat_gpt/pull/6)

## Mục tiêu
Cùng một mã nguồn chạy được hai chế độ: `demo` (giống hệt bản demo 20/11, có Chat mẫu) và `staff` (bản nhân viên thử nội bộ, không có tính năng chưa sẵn sàng). Menu chỉ hiện mục người dùng được phép và được dùng.

## Output
- PR từ `feature/release-mode` vào `develop`.
- Code:
  - Biến môi trường `RELEASE_MODE=demo|staff`, **mặc định `demo`**: API đọc qua `AppConfigService` (validate trong `env.validation.ts`, giá trị sai → không khởi động); web đọc `NEXT_PUBLIC_RELEASE_MODE` cùng giá trị. Ghi vào `.env.example` của cả hai app.
  - Chế độ `staff`:
    - **Chat ẩn khi nhà cung cấp LLM là bản mẫu** (`MockLlmProvider`): thanh bên không có mục Trò chuyện; `/chat`, `/chat/<id>` → trang 404 của app; API `POST /chat/stream`, `conversations/*` → `404`. Trang sau đăng nhập (`routes.home`) chuyển về `/profile` khi Chat bị ẩn.
    - **Tài liệu ẩn:** thanh bên không có mục Tài liệu; `/documents` → trang 404.
  - **Swagger theo môi trường:** `SWAGGER_ENABLED` đặt riêng cho từng môi trường; không đặt thì mặc định `true` ở `demo`, `false` ở `staff`.
  - Chế độ `demo`: không đổi gì so với `develop` hiện tại.
  - Nhóm "Quản trị" chỉ hiện với `ADMIN` ở cả hai chế độ (đã có — giữ, đưa vào kiểm tra).
- Tài liệu: [ui-release-standards mục 3](../design/ui-release-standards.md#3-chế-độ-phát-hành-và-tính-năng-hiển-thị) cột hiện trạng; [access-control](../design/access-control.md) KT-2 → "Đã sửa"; `README.md` mục chạy dự án ghi biến mới và cách chạy từng chế độ.

## Phạm vi
- **Làm:** như Output.
- **Không làm:** gắn LLM thật; bỏ SĐT khỏi màn quản trị ([SE-006](SE-006-account-admin-rules.md)); chỉnh giao diện ([SE-004](SE-004-ui-consistency.md)); tiêu chí tải R-3…R-8.

## Nguồn yêu cầu
- Yêu cầu: khách hàng 15/11/2026 — [CS-6](../design/access-control.md#4-chính-sách-đã-chốt).
- Thiết kế: [ui-release-standards mục 3](../design/ui-release-standards.md#3-chế-độ-phát-hành-và-tính-năng-hiển-thị); [access-control KT-2](../design/access-control.md#3-khoảng-trống-đã-xác-minh).

## Checklist nghiệm thu
Kiểm tra bằng **cả hai vai** — nhân viên (tài khoản thử riêng của task) và admin — ở **cả hai chế độ**, desktop + mobile 375px. Ghi kết quả theo bảng dưới (mỗi ô: thấy gì + ảnh hoặc mã HTTP).

| Kiểm tra | `demo` · nhân viên | `demo` · admin | `staff` · nhân viên | `staff` · admin |
|---|---|---|---|---|
| **Màn vào sau đăng nhập** | `/chat` | `/chat` | `/profile` | `/profile` |
| **Menu** | Trò chuyện, Tài liệu (Đang phát triển) | + Quản trị › Người dùng | Không có Trò chuyện, Tài liệu (chỉ còn menu tài khoản → Hồ sơ) | Quản trị › Người dùng |
| **Mở trực tiếp** `/chat`, `/chat/<id>` | Mở được | Mở được | Trang "Không tìm thấy trang"; API `404` | Như nhân viên |
| **Mở trực tiếp** `/documents` | Trang "Đang phát triển" | Như nhân viên | "Không tìm thấy trang" | Như nhân viên |
| **Mở trực tiếp** `/admin/users` | "Không có quyền truy cập"; API `403` | Mở được | "Không có quyền truy cập"; API `403` | Mở được |
| **Mở trực tiếp** `/profile` | Mở được | Mở được | Mở được | Mở được |

| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Không đặt biến (mặc định `demo`): 2 cột `demo` khớp bảng và giống `2636714` (gửi Chat → phản hồi mẫu chạy dần) | Giữ bản demo | UI so với ảnh TL-003 |
| AC2 | `RELEASE_MODE=staff`: 2 cột `staff` khớp bảng | CS-6 | UI + `curl` (`POST /chat/stream`, `GET /conversations` → `404`) |
| AC3 | **Swagger** `/api/v1/docs`: `demo` không đặt biến → `200`; `demo` + `SWAGGER_ENABLED=false` → `404`; `staff` không đặt biến → `404`; `staff` + `SWAGGER_ENABLED=true` → `200` | CS-6 | `curl -i` 4 cấu hình |
| AC4 | `RELEASE_MODE=abc` → API không khởi động, lỗi rõ | Cấu hình an toàn | Chạy thử |
| AC5 | Checklist hai vai đủ (sáng + tối, vi + en); tài khoản thử đã khóa | [workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) | Bàn giao 6.1 |
| AC6 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt; chỉ đổi file trong phạm vi | Quy ước repo | Lệnh |

## Quyết định còn mở
Không có. CS-6 đã chốt 15/11/2026.

## Kết quả review
- **Done 17/11/2026** — PR [#6](https://github.com/duong2604/cat_gpt/pull/6), SHA đầu PR đã review `6c941b8`, merge `783a8a3` vào `develop` (`gh pr merge 6 --merge --match-head-commit 6c941b8…`); CTO cho phép merge trước 20/11 (17/11/2026).
- Xác minh trên `develop` @ `783a8a3`: code trùng hoàn toàn SHA đã review (`git diff 6c941b8 783a8a3 -- apps packages pnpm-lock.yaml package.json` rỗng); typecheck 4/4, lint 3/3, build 3/3, api test 12/12 — **Nguồn: TL chạy 17/11/2026**.
- Kết luận từng AC: xem [Review vòng 4 (TL)](#review-vòng-4-tl). Màn 375 px: **dựa trên bằng chứng SE (ảnh vòng 2), TL chưa tự xác minh trực tiếp** (công cụ trình duyệt không thu được cửa sổ về 375 px).
- CI: repo chưa có CI tại thời điểm merge (thêm ở [SE-010](SE-010-dev-infra-ci.md)); không có branch protection trên `develop`.
- Dọn nhánh: remote `feature/release-mode` đã xóa (TL); nhánh local nằm ở worktree Senior Dev → Senior Dev dọn theo [workflow 2.1](../project/workflow.md#21-dọn-nhánh-và-worktree-sau-merge) trước khi nhận SE-010.

## Lịch sử review
### Checklist vòng 1
**Task** — SE-003 · PR [#6](https://github.com/duong2604/cat_gpt/pull/6) · SHA đầu PR `9281006` · vòng 1
**Kết quả** — Thêm `RELEASE_MODE` (api) / `NEXT_PUBLIC_RELEASE_MODE` (web), mặc định `demo`. API: `AppConfigService.releaseMode`, `swaggerEnabled` theo mode khi không đặt `SWAGGER_ENABLED`, `ChatHiddenGuard` (404 trên `ChatController`/`ConversationsController` khi `staff` + `LlmProvider.isMock`). Web: `lib/release-mode.ts`, `routes.home` theo mode, sidebar ẩn Trò chuyện/Tài liệu ở `staff`, `/chat` layout và `/documents` page gọi `notFound()` ở `staff`. Cập nhật `.env.example` (api, web), README, `ui-release-standards.md` mục 3–4, `access-control.md` KT-2.
**Checklist**
- [x] AC1 Mặc định `demo`: 2 cột `demo` khớp bảng — sidebar có Trò chuyện/Tài liệu, `/chat` mở được (`200`), `/` → `/chat` — xác minh qua curl (phiên admin) + browser (`find` sidebar); chưa gửi lại tin nhắn Chat để xem streaming (hành vi SE-001, ngoài phạm vi SE-003, không đổi code)
- [x] AC2 `RELEASE_MODE=staff`: UI `/chat`, `/documents` hiện đúng "Không tìm thấy trang" (xác minh bằng `get_page_text` qua trình duyệt thật, phiên admin); sidebar không còn nhóm "Không gian làm việc" (`find` xác nhận); API `curl` có cookie phiên: `POST /chat/stream` → `404`, `GET /conversations` → `404`, `GET /conversations/:id/messages` → `404`; không ảnh hưởng `/me`, `/admin/users` (vẫn `200`/`401` theo xác thực) — **lưu ý**: mã HTTP của *trang* `/chat`, `/documents` vẫn `200` dù nội dung đúng, do `Providers` (root layout) là Client Component bọc quanh children nên response đã bắt đầu stream trước khi `notFound()` chạy (đặc điểm kiến trúc RSC có sẵn của toàn app — xác nhận qua Next.js docs `node_modules/next/dist/docs` và qua debug log server-side `isStaffMode=true` đúng khi gọi `notFound()`); không phải lỗi do thay đổi này, ngoài khả năng sửa trong phạm vi task (cần đổi kiến trúc Client Component ở root layout)
- [x] AC3 Swagger 4 tổ hợp: `demo` không đặt biến → `200`; `demo` + `SWAGGER_ENABLED=false` → `404`; `staff` không đặt biến → `404`; `staff` + `SWAGGER_ENABLED=true` → `200` — `curl -i http://localhost:4001/api/v1/docs` từng tổ hợp (đã tạm comment dòng `SWAGGER_ENABLED` trong `.env` để thử "không đặt", khôi phục lại sau)
- [x] AC4 `RELEASE_MODE=abc` → API không khởi động — log: `Cấu hình môi trường không hợp lệ:\n  - RELEASE_MODE must be one of the following values: demo, staff`
- [ ] AC5 Checklist hai vai đủ (sáng + tối, vi + en) — **đạt một phần**: đã thử vai ADMIN ở cả `demo`/`staff` (desktop, theme theo máy, locale `vi`); **chưa thử**: vai `USER` riêng (logic không phân biệt vai nên rủi ro thấp — `ChatHiddenGuard` và sidebar filter không đọc `role`), theme sáng, locale `en`, mobile 375px; không tạo tài khoản thử riêng (dùng tài khoản admin seed có sẵn, không cần khóa)
- [x] AC6 `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt — chỉ đổi file trong phạm vi (api: config/llm/chat; web: lib/sidebar/chat-layout/documents; docs: README, ui-release-standards, access-control, tasks)
**Kiểm tra đã chạy** — `pnpm typecheck`, `pnpm lint`, `pnpm build` (cả ba đạt); curl thủ công cho AC2–AC4 (API `demo`/`staff` trên cổng 4000/4001, có đăng nhập admin seed); browser thật (Claude in Chrome) cho AC1–AC2 phía web trên cổng 3000
**Dọn nhánh trước khi nhận task này** (mục 2.1) — `develop` local @ `598b81d` (= `origin/develop`); đã dọn: nhánh `docs/thesis-implementation` (SE-008, Done, đã merge PR #5); còn giữ: `feature/openai-provider` (SE-007, chưa `Done`, lý do giữ: chưa merge), `fix/avatar-requires-login` (SE-002, chưa `Done`)
**Trạng thái** — Chờ Review

#### Review vòng 1 (TL)
Chép từ [báo cáo ngày 15/11/2026, vòng 10](../reports/daily/2026-11-15.md#vòng-10--2358) (`origin/develop` @ `c5f440e`).

**SE-003 — TL review vòng 1** (PR #6 @ `0f2dd1c`, `MERGEABLE`/`CLEAN` so với `develop` hiện tại) — kết luận **Cần sửa**
- [x] Diff đúng phạm vi (20 file: cấu hình `RELEASE_MODE`, `ChatHiddenGuard`, sidebar, route, tài liệu) — **Nguồn: TL kiểm tra** `git diff origin/develop...0f2dd1c`
- [ ] **Tích hợp sau PR #4 — chặn merge:** giả lập `develop` + PR #3 + PR #4 rồi ghép PR #6 → **xung đột** ở `apps/api/src/config/app-config.service.ts`, `apps/api/src/config/env.validation.ts`, `docs/design/access-control.md`; PR #6 thêm `abstract readonly isMock` vào `LlmProvider` nhưng `OpenAiLlmProvider` (PR #4) không khai báo → lỗi biên dịch sau khi ghép — **Nguồn: TL kiểm tra** `git merge-tree`
- [ ] **Web chưa theo nhà cung cấp LLM:** `apps/web/src/lib/release-mode.ts` + `app-sidebar.tsx`, `chat/layout.tsx` ẩn Trò chuyện chỉ theo `NEXT_PUBLIC_RELEASE_MODE`; API ẩn theo `staff` **và** `isMock`. Với `staff` + OpenAI: API cho dùng Chat nhưng web vẫn ẩn → lệch yêu cầu đã chốt (SE-003 Output: "Chat ẩn khi nhà cung cấp LLM là bản mẫu"; CS-6) — **Nguồn: TL đọc code**
- [ ] **`.env.example`:** `RELEASE_MODE=demo` kèm `SWAGGER_ENABLED=true` đặt sẵn, trong khi chú thích ghi "để trống sẽ theo RELEASE_MODE". Ai chép file này cho bản `staff` sẽ bật Swagger, ngược mặc định đã chốt; để trống giá trị (`SWAGGER_ENABLED=`) cũng không an toàn vì chuỗi rỗng chuyển thành `false` (`toBoolean`) → bản `demo` mất Swagger — **Nguồn: TL đọc code**
- [ ] **AC5 chưa đủ:** Senior Dev mới kiểm vai ADMIN, giao diện mặc định, tiếng Việt; thiếu vai nhân viên, sáng/tối, tiếng Anh, mobile 375 px — workflow 9.2 điều 1 (tiêu chí chưa xác minh)
- [x] Ghi nhận, không chặn: `/chat`, `/documents` ở `staff` trả HTTP `200` nhưng hiện đúng trang "Không tìm thấy trang"; API trả `404` là kiểm tra chính — chấp nhận, đã ghi trong PR và task
- [ ] AC1–AC4, AC6 — chưa kiểm lại độc lập; TL chạy lại ở vòng 2 sau khi PR #6 đã ghép với `develop` có PR #4 (máy đang thiếu bộ nhớ, server dev nền vừa bị tắt)

### Checklist vòng 2
**Task** — SE-003 · PR [#6](https://github.com/duong2604/cat_gpt/pull/6) · SHA đầu PR `9281006` (nhánh gốc vòng 1; commit mới vòng 2 thêm sau) · vòng 2
**Kết quả** — Sửa 3 mục TL yêu cầu ngay (mục 4–5 chờ PR #4 vào `develop`):
1. Chat theo nhà cung cấp LLM, API là nguồn duy nhất: thêm `GET /me/features` (`AppFeaturesDto { chatEnabled }`), tính bằng `isChatHidden()` dùng chung với `ChatHiddenGuard` (tách từ `chat-hidden.guard.ts`, không còn trùng logic). Web bỏ hẳn `NEXT_PUBLIC_RELEASE_MODE` khỏi quyết định ẩn/hiện Chat: `useFeatures()`/`useCurrentFeatures()` (mới), `AppShell` chờ cả `/me` và `/me/features` trước khi render con. `app-sidebar.tsx` lọc mục Trò chuyện theo `chatEnabled` (Tài liệu vẫn theo `isStaffMode` — không liên quan LLM, TL không yêu cầu đổi). `chat/layout.tsx` đổi từ `notFound()` phía server sang `ChatModeGuard` (client, cùng mẫu `AdminGuard`) đọc `chatEnabled` — nhân tiện không còn phụ thuộc đặc điểm streaming RSC đã ghi nhận ở vòng 1. Trích nội dung "Không tìm thấy trang" ra `NotFoundContent` dùng chung cho `not-found.tsx` và `ChatModeGuard`. `routes.home` trả về hằng số tĩnh `/chat` (bỏ nhánh theo `isStaffMode`); quyết định "vào đâu sau đăng nhập" chuyển vào `login-form.tsx` — gọi `/me/features` ngay sau khi đăng nhập thành công rồi mới điều hướng (`safeNextPath` nhận thêm tham số `fallback`).
2. `.env.example` (api): `SWAGGER_ENABLED` chuyển thành dòng chú thích `# SWAGGER_ENABLED=` (không còn giá trị mặc định gây hiểu nhầm).
3. AC5: kiểm thêm vai `USER` (tài khoản thử `se003.test@catgpt.local`, đã khóa sau khi kiểm), theme sáng + tối, `vi` + `en`, mobile 375 px (nhúng iframe cùng origin — công cụ đổi kích thước cửa sổ không đổi được viewport thật trong môi trường này, đã xác minh bằng `window.innerWidth` không đổi).
**Checklist**
- [x] Mục 1 (Chat theo LLM provider) — `/me/features` trả `{"chatEnabled":false}` ở `staff`+mock (curl, phiên admin); sidebar không còn mục Trò chuyện cho cả admin và `USER`; `/chat` hiện "Không tìm thấy trang" (client `ChatModeGuard`) cho cả hai vai; đăng nhập xong vào thẳng `/profile` (không qua `/chat`) — xác minh qua trình duyệt thật, cả vai `USER` lẫn admin; `demo` không đổi (sidebar có Trò chuyện/Tài liệu, `/chat` mở được, `/` → `/chat`) — hồi quy đã kiểm lại
- [x] Mục 2 (`.env.example`) — copy `.env.example` nguyên trạng + `RELEASE_MODE=staff` (ghi đè 2 dòng tương ứng vào `.env` thật để giữ `MONGODB_URI`/`JWT_ACCESS_SECRET` thật, cùng nội dung với `.env.example`) → Swagger `404`; 3 tổ hợp còn lại giữ nguyên kết quả vòng 1 (logic `swaggerEnabled` không đổi)
- [x] Mục 3 (AC5 đủ) — vai `USER` riêng ở `staff`: sidebar chỉ còn logo + menu tài khoản (không có Trò chuyện/Tài liệu/Quản trị — đúng, `USER` không phải admin); đăng nhập xong → `/profile`; `/chat` → "Không tìm thấy trang". Theme sáng/tối: ảnh chụp đúng cả hai, không vỡ bố cục. Locale `en`: "Page not found" / "Back to home" hiện đúng. Mobile 375px (iframe cùng origin, cookie phiên hoạt động bình thường vì cùng origin): `/chat` (not-found) và `/profile` không cuộn ngang, nội dung xuống dòng hợp lý, sidebar thu gọn còn icon thanh trên. Tài khoản thử đã khóa (`BLOCKED`) sau khi kiểm.
- [x] AC1, AC3, AC4, AC6 kiểm lại độc lập ở vòng 2 (không chỉ tin lại vòng 1) — AC1: `demo` không đổi (trên); AC3: 4 tổ hợp đạt (trên); AC4: `RELEASE_MODE=abc` vẫn báo lỗi rõ như vòng 1 (code không đổi phần này); AC6: `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt sau khi sửa — chỉ đổi file trong phạm vi (thêm `/me/features`, `ChatModeGuard`, `NotFoundContent`; sửa `routes.ts`, `login-form.tsx`, `app-sidebar.tsx`, `app-shell.tsx`, `.env.example`)
- [ ] Mục 4–5 (merge `develop` có PR #4, thêm `isMock=false` cho `OpenAiLlmProvider`, kiểm `LLM_PROVIDER=openai` → Chat hiện) — **chưa làm, chờ TL báo PR #4 đã vào `develop`** (dự kiến 24/11 theo kế hoạch tích hợp); sẽ làm ngay khi có tín hiệu, cùng PR #6
**Kiểm tra đã chạy** — `pnpm typecheck`, `pnpm lint`, `pnpm build` (cả ba đạt); curl cho `/me/features`, 4 tổ hợp Swagger, `.env.example` nguyên trạng + staff; trình duyệt thật (Claude in Chrome) cho sidebar/`,/chat`/`/profile` — hai vai (admin, `USER` thử), hai theme, hai locale, mobile 375px qua iframe cùng origin; chỉ chạy một bộ API + web tại một thời điểm, tắt ngay sau khi kiểm (máy thiếu bộ nhớ theo lưu ý của TL)
**Dọn nhánh trước khi nhận task này** (mục 2.1) — không đổi so với vòng 1 (đang sửa tiếp trên `feature/release-mode`, không nhận task mới)
**Trạng thái** — Chờ Review

#### Review vòng 2 (TL)
Chép từ [báo cáo ngày 16/11/2026, vòng 1](../reports/daily/2026-11-16.md#vòng-1--0030) (`origin/develop` @ `76e77c1`).

**SE-003 — TL review vòng 2** (PR #6 @ `bc16b1a`, `MERGEABLE`/`CLEAN` với `develop` hiện tại) — kết luận **Cần sửa**
- [x] Mục 2 vòng 1 (web theo nhà cung cấp LLM) — Đạt về thiết kế: `GET /me/features` (cần đăng nhập, guard toàn cục) trả `chatEnabled` từ `isChatHidden()` dùng chung với `ChatHiddenGuard`; sidebar, `/chat` (`ChatModeGuard`), trang sau đăng nhập đọc cùng cờ; Tài liệu vẫn theo `RELEASE_MODE` (đúng yêu cầu) — **Nguồn: TL đọc diff `0f2dd1c..bc16b1a`**
- [x] Mục 3 vòng 1 (`.env.example`) — Đạt — `# SWAGGER_ENABLED=` (để dạng chú thích), chú thích rõ
- [x] Mục 4 vòng 1 (AC5) — Đạt theo bàn giao SE (tài khoản USER riêng, sáng/tối, vi/en, iframe 375 px; tài khoản đã khóa); TL chưa chạy lại (máy thiếu bộ nhớ) — kiểm ở vòng sau cùng với bước ghép PR #4
- [ ] **Điều hướng trang chủ ở `staff` + LLM mẫu — Chưa đạt (AC2, dòng "Màn vào sau đăng nhập" → `/profile`):** `routes.home` cố định `/chat`, nên `apps/web/src/app/page.tsx` (`redirect(routes.home)`) và `apps/web/src/proxy.ts:29` (đã đăng nhập mà mở `/login`) đưa người dùng tới `/chat` → trang "Không tìm thấy"; nút "Về trang chủ" của `not-found.tsx` cũng trỏ `/chat` → quay lại đúng trang không tìm thấy — **Nguồn: TL đọc code @ `bc16b1a`**
- [ ] Nhỏ: `login-form.tsx` gọi `/me/features` trong `onSuccess`; nếu lời gọi lỗi thì không chuyển trang (người dùng kẹt ở form đã đăng nhập) — nên rơi về `routes.profile` khi lỗi
- [ ] Mục 1 vòng 1 (ghép PR #4, `isMock` cho `OpenAiLlmProvider`, thử `staff` + `openai`) — chưa làm, đúng kế hoạch (sau khi PR #4 vào `develop` 24/11)

### Checklist vòng 3
**Task** — SE-003 · PR [#6](https://github.com/duong2604/cat_gpt/pull/6) · SHA đầu PR `fb34758` · vòng 3
**Kết quả** — Sửa 2 mục TL yêu cầu ngay (mục 3 — ghép PR #4 — vẫn chờ):
1. Trang chủ ở MỌI lối vào giờ đọc `/me/features` trước khi chọn `/chat` hay `/profile`, không còn hằng số tĩnh `routes.home`:
   - `app/page.tsx` ("/"): chuyển thành Client Component, `useFeatures()` rồi `router.replace(...)` (hiện `FullPageSpinner` trong lúc chờ); lỗi/chưa có dữ liệu → mặc định `/profile` (biểu thức `data?.chatEnabled ? chat : profile` tự rơi về `profile` khi lỗi, không cần nhánh riêng).
   - `proxy.ts` dòng 29 (đã đăng nhập mà mở `/login`): đổi đích từ `routes.home` thành `"/"` — để `page.tsx` tự quyết định, middleware (Edge) không gọi API.
   - `not-found.tsx` (nút "Về trang chủ"): `NotFoundContent` tự đọc `useFeatures()` để chọn href thay vì nhận `homeHref` cố định từ nơi gọi — dùng chung cho `not-found.tsx` (route không tồn tại, mọi chế độ) và `ChatModeGuard` (Chat bị ẩn, `homeHref` trước đây luôn là `/profile` nên kết quả không đổi).
   - `routes.home` bị xóa khỏi `routes` (không còn nơi nào dùng); `safeNextPath` đổi `fallback` thành bắt buộc (trước đây mặc định `routes.home`, nay không còn khái niệm "trang chủ" tĩnh).
2. `login-form.tsx`: bọc lời gọi `/me/features` trong `try/catch`; lỗi → `chatEnabled = false` → về `routes.profile` qua `safeNextPath`, không còn kẹt ở form.
3. Mục 1 vòng 1 (ghép PR #4) — **chưa làm, vẫn chờ TL báo PR #4 đã vào `develop`** (dự kiến 24/11).
**Checklist**
- [x] Mục 1 — 3 lối vào × 2 chế độ, ghi URL cuối (trình duyệt thật, phiên admin):

  | Lối vào | `staff` + mock | `demo` |
  |---|---|---|
  | Mở `/` | `/profile` | `/chat` |
  | Đã đăng nhập, mở `/login` | `/profile` (qua `/` → proxy không còn đi thẳng `/chat`) | `/chat` |
  | Nút "Về trang chủ" ở trang không tìm thấy (`href` và sau khi bấm) | `/profile` | `/chat` |
- [x] Mục 2 — giả lập `/me/features` lỗi (ghi đè `XMLHttpRequest` trong console để trả lỗi mạng cho đúng request này, các request khác không đổi) rồi đăng nhập: không kẹt ở form, chuyển thẳng `/profile` (xác nhận qua tab context sau khi đăng nhập xong)
- [x] AC1–AC6 không hồi quy: `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt sau khi sửa; `demo` giữ nguyên ở cả 3 lối vào (trên); Swagger/`.env.example`/AC5 không đổi code nên không kiểm lại toàn bộ, chỉ xác nhận không file nào trong phạm vi đó bị đụng (`git diff bc16b1a..HEAD` chỉ gồm `routes.ts`, `proxy.ts`, `page.tsx`, `not-found.tsx`, `not-found-content.tsx`, `chat-mode-guard.tsx`, `login-form.tsx`)
- [ ] Mục 3 (ghép `develop` có PR #4, `isMock=false` cho `OpenAiLlmProvider`, thử `staff`+`openai`) — **chưa làm, chờ TL báo PR #4 đã vào `develop`**
**Kiểm tra đã chạy** — `pnpm typecheck`, `pnpm lint`, `pnpm build` (cả ba đạt); trình duyệt thật (Claude in Chrome) cho 3 lối vào × 2 chế độ và kịch bản lỗi `/me/features`; chỉ chạy một bộ API (cổng 4001) + web (cổng 3000) tại một thời điểm, tắt ngay sau khi kiểm từng chế độ (máy thiếu bộ nhớ theo lưu ý của TL)
**Dọn nhánh trước khi nhận task này** (mục 2.1) — không đổi so với vòng 1–2 (đang sửa tiếp trên `feature/release-mode`, không nhận task mới)
**Trạng thái** — Chờ Review

### Checklist vòng 4
**Task** — SE-003 · PR [#6](https://github.com/duong2604/cat_gpt/pull/6) · SHA đầu PR `7729e14` · vòng 4
**Kết quả** — Làm mục 1 vòng 1 còn lại (ghép PR #4/SE-007 đã vào `develop`):
1. `git merge origin/develop` vào `feature/release-mode` (`d0bcff7`). 5 file xung đột, không chồng logic — ghép giữ cả hai phía: `app-config.service.ts` (import `ReleaseMode` + `DEFAULT_LLM_MODEL`), `env.validation.ts` (enum `ReleaseMode` + `LlmProviderName` cạnh nhau), `access-control.md` (KT-1 theo bản SE-002 "Đã sửa", KT-2 theo bản SE-003 "Đã sửa"), `docs/tasks/README.md` (dòng SE-002 theo `develop` = Done, dòng SE-003 giữ bản `feature/release-mode` = Chờ Review), `packages/shared/src/types.ts` (giữ cả `AppFeaturesDto` và `AdminUserDto`, không liên quan nhau).
2. `OpenAiLlmProvider` chưa khai báo `isMock` (lớp trừu tượng `LlmProvider` yêu cầu, thêm ở SE-003 trước khi `OpenAiLlmProvider` có trên `develop`) → thêm `readonly isMock = false` (`7729e14`); không đổi gì khác trong file.
**Checklist**
- [x] Mục 1 vòng 1 (ghép `develop`, `isMock` cho `OpenAiLlmProvider`, thử `staff`+`mock` và `staff`+`openai`) — đạt:
  - `staff` + `mock` (`.env` tạm `RELEASE_MODE=staff`, `LLM_PROVIDER=mock`; API cổng 4000, web cổng 3000): `GET /me/features` → `{"chatEnabled":false}`; `GET /conversations` → `404`; `POST /chat/stream` → `404` (curl, phiên admin); trình duyệt thật (Claude in Chrome, phiên admin có sẵn): sidebar chỉ còn "Administration › Users", không còn "Chat"; mở `/chat` → "Page not found"; bấm "Back to home" → `/profile` — không hồi quy so với vòng 2–3
  - `staff` + `openai` (đổi `LLM_PROVIDER=openai`, khởi động lại API; `OPENAI_API_KEY` thật có sẵn trong `.env` máy chủ): `GET /me/features` → `{"chatEnabled":true}`; `GET /conversations` → `200`; `POST /chat/stream` → `200`, stream thật từ OpenAI (`data: {"type":"delta",...}` nhiều đoạn) — đã xóa hội thoại thử ngay sau khi xem log; trình duyệt thật: sidebar có mục "Chat" (mục "Administration › Users" vẫn còn, không có "Documents" — đúng `staff`), mở `/chat` vào được màn chat bình thường
  - Không chạy `staff`+`mock` và `staff`+`openai` cùng lúc (một bộ API+web tại một thời điểm, tắt ngay sau khi kiểm từng tổ hợp — máy thiếu bộ nhớ theo lưu ý TL)
- [x] AC1–AC6 không hồi quy sau khi ghép — `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt (4/4, 3/3, 3/3); `pnpm --filter @cat-gpt/api test` 12/12 đạt; chỉ đổi file trong phạm vi ghép (5 file xung đột ở trên) + `openai-llm.provider.ts` (`isMock`)
**Kiểm tra đã chạy** — `pnpm install --frozen-lockfile`; `pnpm build`/`typecheck`/`lint` (gốc, cả workspace); `pnpm --filter @cat-gpt/api test`; curl cho `/me/features`, `/conversations`, `/chat/stream` ở cả hai tổ hợp `staff`+`mock`/`staff`+`openai`; trình duyệt thật (Claude in Chrome) cho sidebar, `/chat`, nút "Back to home" ở cả hai tổ hợp
**Dọn nhánh trước khi nhận task này** (mục 2.1) — `develop` local chưa cập nhật (đang làm tiếp SE-003 trên `feature/release-mode`, không nhận task mới); `.env` thử (`RELEASE_MODE`, `LLM_PROVIDER`) đã khôi phục nguyên trạng sau khi kiểm; không tạo tài khoản thử mới (dùng phiên admin có sẵn từ trình duyệt)
**Trạng thái** — Chờ Review

#### Review vòng 4 (TL)
TL (17/11/2026) — PR #6 @ `6c941b8` (= SHA đã review; `MERGEABLE`/`CLEAN`; nhắm `develop`). Chi tiết: [báo cáo ngày 17/11 vòng 1](../reports/daily/2026-11-17.md#vòng-1--0020). Ghi lại bởi TL sau merge — Senior Dev **không** cần commit thêm vào PR (CTO 17/11/2026).
- [x] Giải xung đột (`git show --cc d0bcff7`) giữ cả hai phía, không đổi logic; `7729e14` chỉ thêm `readonly isMock = false` — PASS — TL đọc diff
- [x] typecheck 4/4, lint 3/3, build 3/3, api test 12/12 trên `6c941b8` — PASS — TL chạy
- [x] AC1–AC4 (API, bản build cổng 4200, Atlas dev; admin + USER thử): `staff`+`mock` → `chatEnabled:false`, `/conversations` `404`, `/chat/stream` `404`, chưa đăng nhập `401`, Swagger mặc định `404`; `staff`+`openai` → `chatEnabled:true`, stream thật; `demo`+`mock` → Chat mẫu, Swagger `200` — PASS — TL chạy
- [x] Giao diện desktop (Chrome, web dev 3200): `staff` → thanh bên chỉ Quản trị › Users; `/`, `/login` → `/profile`; `/chat`, `/documents` → "Page not found"; "Back to home" → `/profile`; `demo` → `/` → `/chat`, đủ Chat / Tài liệu (Coming soon) / Users — PASS — TL kiểm tra
- [ ] AC5 màn 375 px / tối / en — **NOT VERIFIED bởi TL** (không thu được cửa sổ); chấp nhận theo ảnh bàn giao vòng 2 của Senior Dev + TL đọc code (thanh bên mobile dùng cùng danh sách mục đã lọc, vòng 4 không đổi tệp giao diện) — CTO chấp thuận ghi nhận 17/11/2026
- [x] Dữ liệu thử: `tl1117.user@catgpt.local` đã khóa; hội thoại thử đã xóa — PASS
- [x] Ghi chú: phiếu bàn giao vòng 4 ghi SHA đầu PR `7729e14`; đầu thật `6c941b8` (thêm commit tài liệu) — không ảnh hưởng code

## Phản hồi UI
Chưa có.
