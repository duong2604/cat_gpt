# TL-003 — Dọn nhánh local, rà quyền và chuẩn UI/phát hành

Trạng thái: Chờ Review
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: Không. Không thay đổi code; bản demo 20/11 (`fbffd5b`, chạy tại `34b465d`) giữ nguyên
Hạn bàn giao review: 15/11/2026 · Hạn hoàn tất: Không đặt
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 (vòng 1, 2, 3) · hoàn tất —
Chốt: 15/11/2026 (khách hàng giao 3 việc: dọn nhánh local, rà UI và phân quyền, chuẩn hóa tiêu chí UI và phát hành)
SHA cơ sở: `origin/develop` @ `06a5a83`
PR: Không — tài liệu TL tích hợp trực tiếp theo đợt được giao

## Mục tiêu
Biết chắc ai được xem/sửa gì trên `develop`, chuẩn giao diện và điều kiện để mở cho nhân viên thử, và có danh sách việc cho Senior Dev theo thứ tự ưu tiên — mà không động vào bản demo.

## Output
- Bảng dọn nhánh (mục Lịch sử review).
- [access-control.md](../design/access-control.md) — ma trận quyền; [ui-release-standards.md](../design/ui-release-standards.md) — chuẩn UI, chế độ phát hành, tiêu chí 500 nhân sự.
- [workflow.md mục 9.1–9.2](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) — trách nhiệm hai vai, checklist hai vai, điều kiện chặn merge.
- Task: [SE-002](SE-002-avatar-requires-login.md) (`Sẵn sàng`), [SE-003](SE-003-release-mode-navigation.md) (`Sẵn sàng` phần đã rõ), [SE-004](SE-004-ui-consistency.md) (`Nháp`).

## Phạm vi
- Làm: kiểm kê và dọn nhánh **local**; kiểm tra API + UI với 3 tài khoản; viết tài liệu và task.
- Không làm: sửa code; xóa nhánh remote; đổi bản demo.

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Mỗi nhánh local ngoài `main`/`develop`/`preview/module-2-4-demo` có SHA, PR/task, worktree, phần riêng so với `origin/develop`, quyết định + căn cứ | Bảng dọn nhánh |
| AC2 | Ma trận vai trò → màn hình → thao tác → dữ liệu → khi thiếu quyền; mỗi dòng phân loại XM / KT / CS, có bằng chứng | access-control.md |
| AC3 | Chuẩn UI 5 hạng mục; kiểm tra trống/tải/lỗi/thành công trên desktop + mobile; đề xuất ẩn tính năng; tiêu chí 500 nhân sự ghi rõ mục bắt buộc trước thử nội bộ | ui-release-standards.md |
| AC4 | Workflow có trách nhiệm hai vai, checklist hai vai, điều kiện chặn merge; mục lục có liên kết | Diff tài liệu |
| AC5 | Task SE theo thứ tự quyền → menu/chế độ → giao diện; phần chưa rõ ghi câu hỏi, không `Sẵn sàng` | SE-002…SE-004 |

## Quyết định còn mở
CS-1…CS-6 ở [access-control mục 4](../design/access-control.md#4-chính-sách-đã-chốt); U1 ở [SE-004](SE-004-ui-consistency.md#quyết-định-còn-mở); hạn SE-002/SE-003 (đề xuất 23–26/11).

## Kết quả review
- Vòng 1 (15/11/2026): khách hàng **duyệt** kết quả rà soát; chốt CS-1…CS-6 và U1; giao SE-002 ngay; yêu cầu ghi quyết định vào tài liệu/task, mở task kiểm chứng giới hạn đăng nhập chung IP, đặt hạn SE-002/SE-003 trong khung 23–26/11.
- Vòng 2 (15/11/2026): khách hàng xác nhận; yêu cầu Senior Dev tiếp tục SE-002 theo phạm vi mới, giữ hạn SE-002/SE-003, chốt thu hồi phiên khi đổi email, thay luồng khôi phục admin bằng quy trình riêng, đưa SE-005 lên trước SE-006, bổ sung kiểm tra SE-002/SE-003/SE-005.
- Vòng 3 (15/11/2026): đã bàn giao — [checklist vòng 3](#checklist-vòng-3). Chờ khách hàng xác nhận.
- **CTO duyệt phần rà soát** (15/11/2026, qua [báo cáo ngày 15/11 vòng 1](../reports/daily/2026-11-15.md#vòng-1--1720)). Còn mở: **R1** (người phê duyệt / người thực hiện khôi phục admin) và **Q1** (chặn tạm theo IP khi dò mật khẩu). SE-006: phần code (CS-2, CS-3, CS-4, nhật ký, lệnh `admin:recover`, buộc đổi mật khẩu) **Sẵn sàng**; phần chờ R1 là danh sách người phê duyệt/thực hiện, kênh xác minh, nơi lưu phiếu và **diễn tập chính thức** (R-10) — xem [SE-006](SE-006-account-admin-rules.md#phần-sẵn-sàng-và-phần-chờ-r1). Mốc SE-005, SE-006, SE-004 vẫn là **dự kiến** cho tới khi khách hàng + CTO chốt.
- **Rà soát TL 17/11/2026** ([báo cáo](../reports/daily/2026-11-17.md#vòng-2--0045)): AC1–AC5 — PASS (khách hàng duyệt vòng 1–2; CTO duyệt phần rà soát 15/11). Khoảng trống đã đóng trên `develop`: KT-1 (PR #3 → `1674425`), KT-2 (PR #6 → `783a8a3`) — [access-control mục 3](../design/access-control.md#3-khoảng-trống-đã-xác-minh). Còn mở: KT-3 (`auth.controller.ts:25` vẫn `@Throttle` 5/phút/IP → [SE-005](SE-005-login-limit-shared-ip.md)), KT-4 (một tiến trình), CS-2/3/4 chưa hiện thực ([SE-006](SE-006-account-admin-rules.md)). **Chờ khách hàng:** xác nhận vòng 3; chốt R1, Q1. Giữ `Chờ Review`.

## Lịch sử review

### Checklist vòng 1
**Task hoặc yêu cầu** — TL-003 · tài liệu tích hợp trên `develop` (SHA ghi trong báo cáo gửi khách hàng) · kiểm tra trên `06a5a83` · vòng 1
**Kết luận** — Không có lỗi phân quyền hay lỗi chặn demo. 2 khoảng trống cần sửa (KT-1 ảnh đại diện công khai, KT-2 Swagger), 2 khoảng trống chặn thử nội bộ 500 người (KT-3 giới hạn đăng nhập theo IP, KT-4 giới hạn Chat trong bộ nhớ), 6 chính sách cần chốt.

**Bảng dọn nhánh local** (`git fetch --prune origin` 15/11/2026; working tree sạch; `git worktree list` chỉ có thư mục chính trên `develop` @ `06a5a83`)

| Nhánh | SHA cuối | PR / task | Worktree | Riêng so với `origin/develop` | Quyết định | Căn cứ |
|---|---|---|---|---|---|---|
| `docs/reorganize-project-docs` | `9c426f2` | Không có PR (tích hợp fast-forward); task [2026-11-15-reorganize-project-docs](2026-11-15-reorganize-project-docs.md) | Không | 0 commit (`git rev-list --count origin/develop..` = 0; là tổ tiên của `origin/develop`) | **Giữ** | Task còn `Chờ Review` ([workflow 2.1](../project/workflow.md#21-dọn-nhánh-và-worktree-sau-merge) điều 6); xóa bằng `git branch -d` khi task `Done` |
| `main`, `develop`, `preview/module-2-4-demo` | `e2131b8`, `06a5a83`, `b2a4b22` | — | `develop` là thư mục chính | `preview` riêng 5 commit | Giữ | Ngoài phạm vi dọn theo yêu cầu |

Đã xóa đợt này: không có (các nhánh SE-001 đã dọn ngày 15/11/2026, ghi ở [SE-001](SE-001-chat-integration.md#review-vòng-1)). Nhánh tài liệu của chính đợt này (`docs/tl-003-access-ui-audit`) xóa local sau khi lên `develop`.

**Checklist** (SHA kiểm tra `06a5a83` cho mọi dòng; script curl ở scratchpad TL, kết quả trích trong [access-control](../design/access-control.md#2-ma-trận-vai-trò--màn-hình--thao-tác--dữ-liệu--khi-thiếu-quyền))
- [x] AC1 Kiểm kê và dọn nhánh — Đạt — bảng trên; lệnh `git for-each-ref`, `git rev-list --count`, `git merge-base --is-ancestor`, `git worktree list`
- [x] AC2 Ma trận quyền — Đạt — chưa đăng nhập: 5 API → `401`, ảnh đại diện → `200` (KT-1); NV1 (USER): 6 thao tác quản trị → `403`, 7 thao tác trên hội thoại NV2 → `404 CONVERSATION_NOT_FOUND`, danh sách không chứa hội thoại NV2, `PATCH /me` với `role`/`email` → `400`, thu hồi phiên admin → `404`; ADMIN: đọc hội thoại NV2 → `404` (tách quyền quản trị khỏi nội dung), tự khóa/tự hạ quyền → `400 USER_CANNOT_MODIFY_SELF`; nâng NV2 lên ADMIN → `200` ngay trên phiên đang mở, hạ lại → `403`; khóa NV2 → `401 AUTH_ACCOUNT_BLOCKED` ngay, refresh `401`. UI: NV1 không thấy nhóm Quản trị; `/admin`, `/admin/users` → "Không có quyền truy cập"; `/chat/<id admin>` và `/chat/not-an-id` → "Không tìm thấy cuộc trò chuyện". Đặt lại mật khẩu admin (CS-2) chỉ xác minh qua code để không làm mất phiên demo
- [x] AC3 Chuẩn UI và phát hành — Đạt — 7 màn hình × trống/tải/lỗi/thành công/mobile ghi ở [ui-release-standards mục 2](../design/ui-release-standards.md#2-kiểm-tra-trạng-thái-giao-diện-15112026-06a5a83) (ảnh chụp + `file:dòng` cho trạng thái tải); mobile 375px qua khung nhúng: Chat, Hồ sơ không cuộn ngang, Quản trị người dùng cột "…" bị che (chưa đạt → SE-004); font hiện là chồng font hệ thống; R-1…R-9 với cột "Trước thử nội bộ". Đăng nhập bị `429` sau 5 lần/phút từ một IP khi kiểm tra với 3 tài khoản → KT-3/R-3
- [x] AC4 Workflow và mục lục — Đạt — `workflow.md` mục 9.1, 9.2, bước 6 dẫn về 9.2; `docs/README.md` thêm 2 tài liệu thiết kế + checklist hai vai + điều kiện chặn merge + task mới; kiểm tra liên kết 0 lỗi
- [x] AC5 Task SE — Đạt — SE-002 (KT-1, `Sẵn sàng`), SE-003 (chế độ phát hành + menu, `Sẵn sàng` trừ phần Chat ở `staff` chờ CS-6), SE-004 (giao diện, `Nháp` chờ U1 + CS-4). Cả hai task `Sẵn sàng` ghi **merge sau demo 20/11**; hạn chờ khách hàng + CTO chốt

**Kiểm tra đã chạy** — `pnpm dev` trên `develop` @ `06a5a83`; script curl 3 tài khoản (2 đợt, chờ 60 s vì giới hạn đăng nhập); trình duyệt: đăng nhập sai/đúng, `/chat`, `/chat/<id>`, `/profile` (Thông tin, Phiên đăng nhập), `/admin`, `/admin/users`, `/documents` với admin và NV1; khung 375px cho `/chat`, `/profile`, `/admin/users`; `git diff --check`; kiểm tra liên kết.
**Dữ liệu thử** — tạo `audit.nv2@catgpt.local` (USER); dùng lại `se001.test@catgpt.local`; cả hai **đã khóa lại** (chưa có xóa cứng). Hội thoại thử đã xóa; ảnh đại diện thử đã xóa (URL → `404`). Phiên trình duyệt trả về admin như trước kiểm tra.
**Trạng thái và bước tiếp theo** — Chờ Review; khách hàng + CTO chốt CS-1…CS-6, U1 và hạn SE-002/SE-003.

### Checklist vòng 2
**Task hoặc yêu cầu** — TL-003 vòng 2: ghi quyết định khách hàng 15/11/2026 vào ma trận quyền, tiêu chí UI và task · tài liệu trên `develop` (SHA ghi trong báo cáo gửi khách hàng) · cơ sở `dbc4d85` · vòng 2. Vòng trước: [checklist vòng 1](#checklist-vòng-1)
**Kết luận** — Đã ghi đủ 6 quyết định; 5 task SE có phạm vi và tiêu chí theo quyết định; SE-002 đang làm, phạm vi đổi giữa chừng (Senior Dev cần điều chỉnh). Không đổi code; bản demo giữ `fbffd5b` (máy trình chiếu chạy `34b465d`).
**Checklist**
- [x] Ma trận quyền ghi CS-1…CS-6 đã chốt — Đạt — [access-control mục 4](../design/access-control.md#4-chính-sách-đã-chốt) (quyết định + phương án + task); dòng ma trận CS-2/CS-3/CS-4 và KT-1 trỏ đúng task
- [x] Phương án khôi phục tài khoản admin trước thử nội bộ — Đạt — CS-2: ≥ 2 admin hoạt động; quên mật khẩu → admin khác hạ quyền → đặt lại → nâng lại; mất hết admin → lệnh `admin:recover` trên máy chủ, có nhật ký; tiêu chí bắt buộc [R-10](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự) có diễn tập; làm ở SE-006
- [x] Đổi email: xác nhận, email trùng, nhật ký, xử lý phiên — Đạt — CS-3: hộp thoại xác nhận; `USER_EMAIL_EXISTS` (đã có, `users.service.ts`); `audit_logs`; **thu hồi mọi phiên** của nhân viên khi email đổi (lý do ghi ở CS-3); SE-006 AC3–AC5
- [x] Tiêu chí UI theo quyết định — Đạt — [ui-release-standards](../design/ui-release-standards.md): Be Vietnam Pro đã duyệt; `staff` ẩn Chat mẫu + Tài liệu; Swagger theo `SWAGGER_ENABLED` từng môi trường (mặc định tắt ở `staff`); màn quản trị không hiện SĐT, ảnh; thêm R-10
- [x] SE-002 giao ngay, checklist URL ảnh trực tiếp — Đạt — [SE-002](SE-002-avatar-requires-login.md) hạn **23/11 / 24/11**; AC1–AC3: chưa đăng nhập `401`, chính chủ `200`, tài khoản khác + admin `404`, cho cả **ảnh tải trước thay đổi** (chuẩn bị trên `develop`) và ảnh mới. Senior Dev đã `Đang làm` từ 15/11 theo phạm vi cũ ("mọi người đã đăng nhập") — ghi chú đổi phạm vi trong task
- [x] SE-003 cập nhật phạm vi — Đạt — [SE-003](SE-003-release-mode-navigation.md) hạn **25/11 / 26/11**; thêm ẩn Chat ở `staff` (thanh bên, `/chat` 404, API 404, trang chủ → Hồ sơ), Swagger theo môi trường
- [x] SE-004 chuẩn bị — Đạt — [SE-004](SE-004-ui-consistency.md) `Sẵn sàng`: 4 màn đang dùng trước; bàn giao kèm ảnh trước/sau + checklist thao tác nhân viên và admin, desktop + mobile; hạn đề xuất 30/11 / 01/12 (chờ chốt)
- [x] Task riêng kiểm chứng giới hạn đăng nhập chung IP — Đạt — [SE-005](SE-005-login-limit-shared-ip.md): script 200 tài khoản/5 phút/1 IP chạy trước và sau khi sửa. Phát hiện thêm khi soạn: mọi API giới hạn chung **120 request/phút/IP** (`app.module.ts`) — đưa vào KT-3 và SE-005
- [x] Thứ tự task quyền → chế độ/menu → giao diện — Đạt — SE-002 → SE-003 → SE-006 → SE-005 → SE-004 ([mục lục](README.md)); hạn ngoài khung 23–26/11 là đề xuất, chờ chốt
**Kiểm tra đã chạy** — đọc `admin-users.service.ts`, `users.service.ts`, `admin-seed.service.ts`, `app.module.ts`, `auth.controller.ts`, `users-management.tsx`, `user-form-dialog.tsx`; `git diff --check`; kiểm tra liên kết.
**Ghi nhận quy trình** — Senior Dev đang làm SE-002 trên **cùng thư mục làm việc** với TL; tài liệu chưa commit của TL bị kéo sang nhánh `fix/avatar-requires-login`. TL đã chuyển phần của mình sang worktree riêng `../cat_gpt-tl`, không chạm code của Senior Dev. Từ nay TL và Senior Dev dùng worktree riêng.
**Trạng thái và bước tiếp theo** — Chờ Review; khách hàng xác nhận vòng 2 và hạn đề xuất của SE-004/SE-005/SE-006.

### Checklist vòng 3
**Task hoặc yêu cầu** — TL-003 vòng 3 · tài liệu trên `develop` (SHA ghi trong báo cáo gửi khách hàng) · cơ sở `2636714` · vòng 3. Lịch sử: [vòng 1](#checklist-vòng-1), [vòng 2](#checklist-vòng-2)
**Kết luận** — Senior Dev đã nhận phạm vi mới của SE-002 trong phiên đang làm; tài liệu và task cập nhật theo 6 yêu cầu. Không đổi code; bản demo giữ `fbffd5b` (máy trình chiếu `34b465d`).
**Checklist**
- [x] Senior Dev tiếp tục SE-002 theo phạm vi mới, đọc bản `2636714`, giữ code dở, worktree riêng — Đạt — nhánh `fix/avatar-requires-login` chứa `2636714` (`git merge-base --is-ancestor 2636714 977c03d`), file task trên nhánh trùng `develop` (`git diff --quiet 2636714 977c03d -- docs/tasks/SE-002-…`); code dở giữ qua merge `bc5516b` rồi commit phạm vi mới `977c03d` "avatars are owner-only, drop avatarUrl from admin DTO"; PR #3 mở nhắm `develop`, trên GitHub đầu PR còn `02f31f5` (chưa đẩy `977c03d`), chưa bàn giao. Working tree: Senior Dev `D:\workspace\buggysoft\cat_gpt`, TL `../cat_gpt-tl` (`git worktree list`). Chưa có xác nhận bằng lời của Senior Dev — prompt gửi kèm báo cáo này
- [x] Giữ hạn SE-002 23/11 – 24/11, SE-003 25/11 – 26/11 — Đạt — file task + [mục lục](README.md)
- [x] SE-002: dữ liệu thử riêng, ảnh theo phiên bản cũ, 4 vai, đăng xuất / đổi tài khoản cùng trình duyệt — Đạt — [SE-002 checklist](SE-002-avatar-requires-login.md#checklist-nghiệm-thu): tài khoản `se002.a@`, `se002.b@` riêng; ảnh cũ tạo trên `2636714` trước khi chuyển nhánh; AC1–AC4 (chưa đăng nhập `401`, chính chủ `200`, nhân viên khác `404`, admin `404`); AC5 cùng trình duyệt: đăng xuất → `401`, đăng nhập B → `404`, không lấy từ cache
- [x] SE-003: màn vào sau đăng nhập, menu, truy cập trực tiếp, cả hai vai, Swagger — Đạt — [SE-003 checklist](SE-003-release-mode-navigation.md#checklist-nghiệm-thu): bảng 2 chế độ × 2 vai × 6 kiểm tra; Swagger 4 cấu hình
- [x] Chốt thu hồi mọi phiên khi đổi email — Đạt — [access-control CS-3](../design/access-control.md#4-chính-sách-đã-chốt); [SE-006](SE-006-account-admin-rules.md) Output 2, AC4 (2 thiết bị)
- [x] Quy trình khôi phục admin riêng thay hạ quyền → nâng quyền — Đạt — [access-control 4.1](../design/access-control.md#41-quy-trình-khôi-phục-tài-khoản-admin-đề-xuất--chờ-duyệt): 3 vai (người yêu cầu, người phê duyệt CTO, người thực hiện do CTO chỉ định), 5 bước, nhật ký `ADMIN_RECOVERED`, diễn tập có biên bản trước thử nội bộ (R-10). Chặn thêm đường vòng: không đặt lại mật khẩu tài khoản vừa bị hạ từ ADMIN trong 24 giờ (SE-006 AC1). R1 (ai phê duyệt/thực hiện) chờ chốt
- [x] SE-005 lên trước SE-006; kịch bản kiểm chứng — Đạt — [SE-005 kịch bản](SE-005-login-limit-shared-ip.md#kịch-bản-kiểm-chứng): 200 tài khoản hợp lệ, 1 IP, đăng nhập dồn 5 phút + thao tác 5 phút (~1.200 request/phút), bậc 10/20/50 luồng; ngưỡng `429` 0%, `5xx` < 1%, p95 ≤ 1 s; 4 bước xác nhận chống dò mật khẩu. Q1 (chặn tạm theo IP) chờ chốt
- [x] Xếp lại mốc theo ngày làm việc, mốc chưa duyệt để dự kiến — Đạt — SE-005 dự kiến 27/11 (T6) / 30/11 (T2); SE-006 dự kiến 02/12 (T4) / 03/12 (T5); SE-004 dự kiến 04/12 (T6) / 07/12 (T2); bỏ qua thứ Bảy, Chủ nhật
**Kiểm tra đã chạy** — `git fetch`; `git worktree list`; `git merge-base`, `git diff --quiet`, `git show --stat 977c03d`; `gh pr list --head fix/avatar-requires-login`; `git diff --check`; kiểm tra liên kết.
**Trạng thái và bước tiếp theo** — Chờ Review; khách hàng xác nhận vòng 3, chốt R1 (quy trình khôi phục) và Q1 (chặn tạm theo IP), duyệt mốc dự kiến.

**CTO review vòng 6 (17/11/2026):**
- **R1 — đồng ý có điều kiện:** giữ quy trình 3 vai. Mỗi lần khôi phục admin phải có **CTO phê duyệt rõ ràng**, có nhật ký kiểm toán (`ADMIN_RECOVERED`), và không tạo đường vòng vượt kiểm soát quyền. Ghi vào [SE-006](SE-006-account-admin-rules.md) khi phần chờ R1 của SE-006 chuyển `Sẵn sàng`.
- **Q1 — chưa chốt:** giữ yêu cầu SE-005 kiểm thử nhiều người dùng chung IP, chống dò mật khẩu, đo tỷ lệ `429`. TL đề xuất chính sách sau khi có số liệu.
- Không đóng TL-003 khi xác nhận vòng 3 và Q1 còn mở.

## Phản hồi UI
Chưa có.
