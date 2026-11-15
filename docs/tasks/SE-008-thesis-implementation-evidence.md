# SE-008 — Tài liệu đồ án: hiện thực Module 1–2 và bảng bằng chứng kiểm thử

Trạng thái: Chờ Review
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 2 ngày làm việc
Phụ thuộc: Không chặn. Làm **trước** [SE-003](SE-003-release-mode-navigation.md) (cùng P1, hạn bàn giao sớm hơn); SE-003 bắt đầu sau khi bàn giao SE-008, hạn SE-003 (25/11) không đổi
Hạn bàn giao review: **18/11/2026** · Hạn hoàn tất: **19/11/2026** (TL review + tổng hợp) — khách hàng + CTO chốt 15/11/2026
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 · hoàn tất —
Chốt: 15/11/2026 — CTO duyệt vòng 1 TL-004, giao SE-008 ngay; khách hàng giao SE hai đầu ra cho bộ nguồn đồ án ([TL-004](TL-004-thesis-source-pack.md)); chỉ tài liệu và ảnh
SHA cơ sở: `origin/develop` @ `2f003a0` (15/11/2026, ghi lúc chuyển `Đang làm`)
PR: https://github.com/duong2604/cat_gpt/pull/5 (nhắm `develop`) · SHA đầu PR `065d0d3` (vòng 2)

## Mục tiêu
Senior Dev là người hiểu code nhất: viết phần **hiện thực** Module 1–2 bằng văn phong đưa được vào báo cáo đồ án, và lập **bảng bằng chứng kiểm thử** có ảnh để TL tổng hợp vào `04-validation-and-results.md`. Người đọc cuối là một AI viết Word và sinh viên — cần rõ ràng, truy vết được, không suy đoán.

## Output
1. `docs/thesis/03-implementation.md` (SE sở hữu).
2. `docs/thesis/evidence/test-cases.md` — bảng ca kiểm thử + danh mục ảnh (SE lập, TL tổng hợp sang `04`).
3. `docs/thesis/images/*.png` — ảnh đã chọn, tên ổn định.
4. PR `docs/thesis-implementation` → `develop`, checklist vòng 1 trong file này.

## Phạm vi
- **Làm:**
  - `03-implementation.md` cho **Module 1** (xác thực, phiên, hồ sơ, quản trị) và **Module 2** (Chat, SSE, dừng/tạo lại, provider LLM). Mỗi module: luồng hiện thực; Web ↔ API ↔ MongoDB phối hợp thế nào; các quyết định cần giải thích (phiên đăng nhập + refresh rotation, sở hữu hội thoại theo `userId`, streaming SSE + Dừng, lựa chọn provider AI và `mock` mặc định); dẫn tới file code (đường dẫn + tên hàm/lớp), commit hoặc PR.
  - Đầu file: bảng **trạng thái tích hợp** từng phần, dùng đúng 4 mức của [README bộ nguồn](../thesis/README.md#3-trạng-thái-module-tại-sha-cơ-sở): `Đã tích hợp (develop @ <sha>)` · `Đã kiểm thử trên PR, chưa tích hợp` · `Chỉ có demo` · `Hướng phát triển`. Ảnh đại diện chỉ chính chủ (PR #3 / SE-002) và OpenAI thật (PR #4 / SE-007) ghi **đã kiểm thử trên PR, chưa tích hợp**; mỗi đoạn mô tả hai phần này gắn nhãn đó ngay tại đoạn để TL đổi một chỗ sau khi tích hợp.
  - `evidence/test-cases.md`: bảng `Mã ca | Module | Vai trò | Bước thử | Kết quả mong đợi | Kết quả thực tế | SHA | Nguồn`. Mã ca `TC-M1-nn`, `TC-M2-nn`. Ưu tiên lấy kết quả đã có trong hồ sơ (SE-001, SE-002, SE-007, TL-003, [access-control](../design/access-control.md)) — ghi nguồn tới đúng mục; chạy lại khi cần ảnh.
  - Ảnh: gom ảnh UI sẵn có hoặc chụp bổ sung bằng **dữ liệu thử** (tài khoản `*.test@catgpt.local` / `se008.*@catgpt.local`, nội dung hội thoại mẫu). Danh mục ảnh trong `evidence/test-cases.md`: `Mã hình | Chú thích | Màn hình (route) | Vai trò | SHA chạy | Đường dẫn`. Tên file `images/m<module>-<nn>-<slug>.png`. Desktop rộng ≥ 1280 px (mobile 375 px khi cần), ≤ 500 KB/ảnh.
  - Mục thiếu bằng chứng: ghi dòng với kết quả thực tế `THIẾU — <lý do>` để TL xử lý; không bịa kết quả.
- **Sơ đồ:** khi `03` cần sơ đồ (cấu trúc module — D9 trong [02 mục 9](../thesis/02-requirements-and-design.md#9-sơ-đồ-file-nguồn-hiện-có-và-việc-cần-xuất--vẽ-lại)), viết bằng Mermaid ngay trong `03` và ghi mã D tương ứng; không chép hình từ tài liệu khác.
- **Không làm:** sửa code; sửa `README.md`, `01`, `02`, `04` của `docs/thesis/` (TL sở hữu); sửa file đang có trong PR #3/#4; merge; thay đổi bản demo `34b465d`.

**Ảnh tạm có sẵn** (TL chụp khi review 15/11, 768 px — chỉ dùng nếu không chụp lại được; ghi đúng SHA):
`C:\Users\duong\AppData\Local\Temp\claude-chrome-screenshots-W0KrXu\` — `…-0.jpg` hồ sơ (admin thử, desktop, PR #3 @ `d60864a`), `…-2.png` hồ sơ mobile sau khi xóa ảnh (PR #3), `…-4.jpg` Chat đang stream OpenAI (PR #4), `…-8.jpg` nhãn "Câu trả lời bị cắt…" (PR #4 @ `e1fda76`).

## Nguồn yêu cầu
- Yêu cầu khách hàng 15/11/2026 — [báo cáo ngày 15/11 vòng 4](../reports/daily/2026-11-15.md#vòng-4--1900).
- Function Spec / Basic Design: [module-1-auth.md](../design/module-1-auth.md), [module-2-chat.md](../design/module-2-chat.md) (bản trên PR #4 cho §4.5 OpenAI), [access-control.md](../design/access-control.md).
- Bằng chứng có sẵn: [SE-001](SE-001-chat-integration.md#lịch-sử-review), [SE-002](SE-002-avatar-requires-login.md#lịch-sử-review), SE-007 (trên PR #4: `docs/tasks/SE-007-openai-provider.md` @ `e1fda76`), [TL-003](TL-003-access-ui-release-audit.md).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | `03` mô tả Module 1 và 2: luồng, phối hợp Web–API–DB, các quyết định (phiên, sở hữu hội thoại, SSE + Dừng, provider) | Yêu cầu 15/11 (tin 3 mục 2) | TL đọc, đối chiếu code |
| AC2 | Mỗi nhận định kỹ thuật dẫn tới file code / commit / PR có thật tại SHA ghi trong file | Yêu cầu 15/11 | TL `git show <sha>:<file>` ngẫu nhiên ≥ 10 dẫn chứng |
| AC3 | Phân biệt đúng **đã tích hợp trên `develop`** và **đã kiểm thử trên PR** (SE-002, SE-007) | Yêu cầu 15/11 (tin 2 mục 1) | TL đối chiếu `gh pr view 3/4`, `git log origin/develop` |
| AC4 | `evidence/test-cases.md`: đủ 8 cột; tối thiểu: đăng nhập đúng/sai, khóa tài khoản có hiệu lực ngay, phiên (đăng xuất từ xa), USER bị chặn trang/API quản trị, hồ sơ; Chat gửi + stream, Dừng, Tạo lại, mở lại hội thoại, hội thoại người khác → 404, giới hạn 20 tin/phút; SE-002 ảnh chính chủ; SE-007 ba kết thúc Hoàn tất / Bị cắt / Đã dừng + hủy kết nối (test server giả lập) + lượt Dừng **không nhận được usage** | TL-004, hồ sơ task | TL đọc + đối chiếu nguồn |
| AC5 | Ảnh mở được từ đường dẫn trong repo, có chú thích, vai trò, SHA; chỉ dữ liệu thử; không có khóa API, email/SĐT thật | Yêu cầu 15/11; quy tắc bảo mật | TL mở từng ảnh; `grep -ri "sk-" docs/thesis` |
| AC6 | Mục thiếu bằng chứng đánh dấu `THIẾU — <lý do>` | Yêu cầu 15/11 | Đọc |
| AC7 | PR chỉ thay đổi `docs/thesis/03-implementation.md`, `docs/thesis/evidence/**`, `docs/thesis/images/**`, file task này và dòng SE-008 trong mục lục | Phạm vi | `gh pr diff --name-only` |
| AC8 | Dữ liệu thử đã dọn (khóa tài khoản thử, xóa hội thoại thử); không chạy OpenAI thật quá 10 lượt; key chỉ nằm trong `apps/api/.env` | Workflow 9.1; quy tắc bảo mật | Ghi trong checklist |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| — | Không có | — | — |

## Kết quả review
Vòng 1 (`9c21c18`): TL **Cần sửa** — xem [Review vòng 1 (TL)](#review-vòng-1-tl). Vòng 2: Senior Dev đã sửa đủ 5 mục TL yêu cầu, bàn giao lại ngày 15/11/2026, PR #5 nhắm `develop`, SHA đầu PR `065d0d3`. Chờ TL review lại.

## Lịch sử review

### Checklist vòng 1
**Task** — SE-008 · PR https://github.com/duong2604/cat_gpt/pull/5 · SHA đầu PR `9c21c18` · vòng 1
**Kết quả** — Thêm `docs/thesis/03-implementation.md` (hiện thực Module 1–2, sơ đồ D9), `docs/thesis/evidence/test-cases.md` (bảng TC-M1/TC-M2 + danh mục hình), 13 ảnh trong `docs/thesis/images/`. Không sửa code, không sửa `README.md`/`01`/`02`/`04` của `docs/thesis/`, không đụng file đang nằm trong PR #3/#4.

**Checklist** (kiểm tra 15/11/2026 trên `D:\workspace\buggysoft\cat_gpt`, máy chủ `pnpm dev` đang chạy sẵn trên `origin/develop` @ `2f003a0`, cổng API 4000 / web 3000; tài khoản thử `se008.a@catgpt.local`, đã khóa; hội thoại thử đã xóa)
- [x] AC1 `03` mô tả Module 1 và 2: luồng, phối hợp Web–API–DB, các quyết định (phiên + rotation, sở hữu hội thoại theo `userId`, SSE + Dừng, provider mock/OpenAI) — Đạt — [03-implementation.md §2–4](../thesis/03-implementation.md)
- [x] AC2 Mỗi nhận định dẫn tới file code/commit/PR có thật tại SHA ghi trong file — Đạt — ví dụ kiểm được: `auth.service.ts` (`login`/`refresh`/`logout`), `jwt.strategy.ts` (`validate`), `sessions.service.ts` (`create`/`rotate`/`revoke`), `sessions/refresh-token.ts`, `me.service.ts` (`updateAvatar`), `admin-users.service.ts` (`setStatus`/`assertNotSelf`/`assertNotLastActiveAdmin`), `chat.service.ts` (`streamAnswer`/`stop`/`regenerate`), `conversations.service.ts` (`getOwnedOrThrow`), `chat/sse-stream.ts`, `llm/mock-llm.provider.ts` — tất cả tại `2f003a0`; `storage/files.controller.ts` tại PR #3 `d60864a`; `llm/openai-llm.provider.ts` tại PR #4 `e1fda76` (12 dẫn chứng, vượt mức ≥ 10 của cách kiểm tra)
- [x] AC3 Phân biệt **đã tích hợp trên `develop`** và **đã kiểm thử trên PR** (SE-002, SE-007) — Đạt — bảng trạng thái tích hợp đầu `03-implementation.md`; mỗi đoạn liên quan gắn nhãn `[PR #3]`/`[PR #4]` ngay tại chỗ
- [x] AC4 `evidence/test-cases.md` đủ 8 cột; bao phủ đăng nhập đúng/sai, khóa tài khoản có hiệu lực ngay, phiên, USER bị chặn trang/API quản trị, hồ sơ, Chat gửi + stream, Tạo lại, mở lại hội thoại, hội thoại người khác → 404, giới hạn 20 tin/phút, ảnh chính chủ (SE-002), ba kết thúc OpenAI + hủy kết nối + Dừng không tính phí (SE-007) — Đạt, trừ một dòng xem AC6 — [test-cases.md](../thesis/evidence/test-cases.md)
- [x] AC5 Ảnh mở được, có chú thích/vai trò/SHA, chỉ dữ liệu thử, không khóa API/email/SĐT thật — Đạt — 13 ảnh, 85–392 KB (dưới 500 KB); `grep -ri "sk-" docs/thesis` chỉ khớp đúng dòng tài liệu trích lại lệnh này, không có khóa thật; tài khoản dùng để chụp đều thuộc `*.test@catgpt.local`/`se00x.*@catgpt.local`
- [ ] AC6 Mục thiếu bằng chứng đánh dấu `THIẾU — <lý do>` — TC-M2-02 (Dừng giữa chừng, ảnh ≥ 1280px): mock trả lời hết trong dưới 1 giây cho mọi câu hỏi thử, ngắn hơn độ trễ một lượt thao tác của công cụ tự động hóa trình duyệt nên không bấm Dừng kịp lúc đang chạy — ghi `THIẾU` kèm lý do trong `test-cases.md`, dùng lại kết quả bằng chữ của SE-001; mobile 375px cho mọi màn hình cũng để trống vì công cụ đổi kích thước cửa sổ không hoạt động trong môi trường kiểm tra này (như SE-001, SE-002) — xem mục "Chưa chụp" cuối `test-cases.md`
- [x] AC7 PR chỉ thay đổi đúng phạm vi khai báo — Đạt — `git diff --stat origin/develop...HEAD`: `docs/tasks/README.md` (1 dòng SE-008), `docs/tasks/SE-008-thesis-implementation-evidence.md`, `docs/thesis/03-implementation.md`, `docs/thesis/evidence/test-cases.md`, `docs/thesis/images/*.png` (13 file) — đúng 17 file, không hơn
- [x] AC8 Dữ liệu thử đã dọn; không chạy OpenAI thật quá 10 lượt; key chỉ trong `apps/api/.env` — Đạt — `se008.a@catgpt.local` đã `BLOCKED`, hội thoại thử đã xóa (`DELETE /conversations/:id` → `204`); không gọi OpenAI thật lần nào trong phiên này (ảnh PR #4 dùng lại ảnh TL đã chụp sẵn khi review 15/11, không chụp mới); không đọc hay sửa `apps/api/.env`

**Kiểm tra đã chạy** — Không sửa code nên không chạy `pnpm build`/`typecheck`/`lint`. Đã kiểm thủ công: mọi file được link tới (`module-1-auth.md`, `module-2-chat.md`, `access-control.md`, SE-001/SE-002/TL-003, `02-requirements-and-design.md`, `context.md`) tồn tại trong repo; `grep -ri "sk-" docs/thesis`; `ls -la docs/thesis/images` (85 KB – 392 KB, dưới giới hạn 500 KB); `git diff --stat origin/develop...HEAD` đúng 17 file.
**Dọn nhánh trước khi nhận task này** (mục 2.1) — `develop` local đã cập nhật tới `71e1263` trước khi tạo nhánh `docs/thesis-implementation` (từ `2f003a0`, sau đó merge `71e1263` vào cùng nhánh khi `origin/develop` tiến thêm giữa chừng); không có nhánh/worktree nào đủ điều kiện dọn — [SE-002](SE-002-avatar-requires-login.md) vẫn `Chờ Review`, chưa `Done`
**Trạng thái** — Chờ Review

#### Review vòng 1 (TL)
**Task** — SE-008 · PR https://github.com/duong2604/cat_gpt/pull/5 · SHA đã review `bbfd59f` (đầu PR thực tế; checklist SE ghi `9c21c18` vì commit `bbfd59f` chỉ ghi bàn giao) · `MERGEABLE`/`CLEAN` · vòng 1
**Kết luận** — **Cần sửa.** Phạm vi đúng, `03` đầy đủ và phần lớn nhận định khớp code; bảng ca kiểm thử đủ cột. Phải sửa 1 lỗi bảo mật, 2 nhận định sai trong `03`, 1 ca ghi quá bằng chứng, chú thích ảnh và 1 liên kết gãy.
**Checklist** (TL tự kiểm tra trên worktree TL, `git show`/`git grep` tại `bbfd59f`, `origin/fix/avatar-requires-login` @ `d60864a`, `origin/feature/openai-provider` @ `e1fda76`)
- [ ] AC1 `03` đủ Module 1–2, Web–API–DB, các quyết định — nội dung đạt; **2 nhận định sai** (AC2)
- [ ] AC2 Dẫn chứng khớp code — đối chiếu hơn 30 dẫn chứng (guard toàn cục `app.module.ts:35-37`; `DUMMY_PASSWORD_HASH`, `signAccessToken`; `rotate`, `REFRESH_REUSE_GRACE_MS`, `findActive`, `revokeAllForUser(userId, exceptSessionId)`; `randomBytes(32)`/`hashSecret`; `assertNotSelf`, `assertNotLastActiveAdmin`, `countActiveAdmins`; `setStatus` thu hồi phiên khi `BLOCKED`; `USER_SAME_PASSWORD`, `detectImageType`, `AVATAR_MAX_SIZE_BYTES`, `storage.delete`; `randomUUID`, chặn path traversal; `useStaticAssets` `dotfiles:'deny'`, `maxAge:'7d'`; `refreshPromise`/`refreshSession`, `recoverFromUnauthorized`; `inFlight`, `assertNotStreaming` → `CHAT_STREAM_IN_PROGRESS`, `assertRateLimit`/`sendLog`, chú thích `ponytail`, `makeTitle`, `recentMessages`, `deleteMessage`; `split(/(\s+)/)`, 20–40 ms; PR #3: `FilesController`, `findById`, `getAbsolutePath`, `Cache-Control: private, no-store` + `cacheControl:false`, `AdminUserDto`, `toAdminDto`, `AdminUserResponse`; PR #4: `store:false`, `LlmError`, `ponytail`, `aborted` → `STOPPED` trước `TRUNCATED`) — các dẫn chứng còn lại khớp, **2 sai**:
  - §1: "`apps/web/src/proxy.ts` rewrite `/api/*`" — sai: rewrite nằm ở `apps/web/next.config.ts` (`rewrites()` → `${API_INTERNAL_URL}/api/:path*`); `proxy.ts` chỉ đọc cookie `cat_session` để điều hướng (đúng như §2.1 đã viết).
  - §3.3: mock `/error` "ném lỗi giữa chừng (ở khoảng 40% nội dung)" — sai: `mock-llm.provider.ts` ném lỗi khi đã phát **20 đoạn** (`emitted === 20`), không theo tỷ lệ.
- [x] AC3 Phân biệt `develop` / PR #3 / PR #4 — Đạt — bảng đầu `03` + nhãn tại chỗ; SHA PR khớp `gh pr view`
- [ ] AC4 Bảng ca kiểm thử — đủ 8 cột, 23 ca, đủ nhóm yêu cầu; **TC-M1-02 ghi quá bằng chứng**: "thời gian phản hồi như nhau" — `module-1-auth §7` và TL-003 không đo thời gian; bằng chứng hiện có là code (M1-08: luôn chạy `verifyPassword` với `DUMMY_PASSWORD_HASH`). Ghi đúng mức: "kiểm qua code; chưa đo thời gian phản hồi"
- [ ] AC5 Ảnh và dữ liệu — mở đủ 13 ảnh: đúng màn hình, vai trò, chỉ tài khoản thử; **chưa đạt**:
  - **Bảo mật:** `evidence/test-cases.md` dòng 5 ghi **mật khẩu của tài khoản thử** `se008.a@` dạng chữ thường — repo công khai. Xóa khỏi file; admin **đặt lại mật khẩu** `se008.a@` (giữ `BLOCKED`) để mật khẩu đã lộ trong lịch sử commit vô hiệu; ghi vào checklist
  - `m1-05`: chú thích "không cột ảnh… cột ảnh cũng chưa có trên `develop`" — sai: `users-management.tsx` trên `develop` hiện `UserAvatar` (ảnh hoặc chữ cái đầu) ở cột Người dùng (ảnh chụp đúng là thấy chữ cái đầu); PR #3 mới bỏ
  - `m2-01`: chú thích "câu trả lời markdown (bảng so sánh)" — ảnh hiện danh sách đánh số + dòng "Đây là câu trả lời mẫu…"; "sau khi tải lại" không thấy được trong ảnh → chú thích theo đúng nội dung nhìn thấy
  - `m1-08`: ghi "768px" — thực tế 238 × 432 (mobile)
  - `m2-04`: thanh bên có tiêu đề hội thoại lỗi mã hóa ("H◆y giải thích…", rác từ lần thử curl) → đánh dấu **không dùng trong báo cáo** (hoặc cắt bỏ thanh bên); TL chụp lại sau tích hợp PR #4
  - Đạt: kích thước ≤ 392 KB; 9 ảnh `develop` 1536 × 695; không có `sk-`, SĐT, email cá nhân
- [x] AC6 Mục thiếu ghi `THIẾU — <lý do>` — Đạt (TC-M2-02 ảnh "Đã dừng"; mobile 375 px). TL nhận chụp lại sau tích hợp (B10)
- [ ] AC6/liên kết — **1 liên kết gãy**: `test-cases.md` → `../../tasks/SE-002-avatar-requires-login.md#checklist-vòng-1` (checklist vòng 1 SE-002 chỉ có trên PR #3) → trỏ `https://github.com/duong2604/cat_gpt/blob/d60864a/docs/tasks/SE-002-avatar-requires-login.md#checklist-vòng-1`. Kiểm: 687 link, 1 lỗi
- [x] AC7 Phạm vi — Đạt — `gh pr view 5`: 17 file, đúng danh sách cho phép
- [x] AC8 Dữ liệu thử đã khóa/xóa, không gọi OpenAI — Đạt theo bàn giao; bổ sung việc đặt lại mật khẩu ở AC5
- [x] `.env.example` local — **TL chấp nhận** cách xử lý: bản sửa là nháp cũ (`LLM_PROVIDER=openai`, key trống — khớp điều TL ghi nhận trước đó), đã bị `.env.example` của PR #4 thay thế; Senior Dev stash rồi bỏ, không có giá trị thật. Không cần khôi phục
**Trạng thái và bước tiếp theo** — Cần sửa → Senior Dev sửa trong cùng PR #5, chép mục review này vào "Lịch sử review" của SE-008 (`#### Review vòng 1 (TL)`), thêm `### Checklist vòng 2`, chuyển `Chờ Review`. Chưa nhận SE-003 cho tới khi bàn giao vòng 2 (ước lượng sửa 0,25 ngày; hạn 18/11 không đổi).

### Checklist vòng 2
**Task** — SE-008 · PR https://github.com/duong2604/cat_gpt/pull/5 · SHA đầu PR `065d0d3` · vòng 2
**Kết quả** — Sửa đúng 5 mục TL yêu cầu, không đổi phạm vi file (vẫn 17 file đã khai báo).

**Checklist**
- [x] 1. AC5 bảo mật — Đạt. Xóa mật khẩu khỏi `test-cases.md` dòng 5 (chỉ còn email `se008.a@catgpt.local`, ghi rõ "mật khẩu không ghi trong tài liệu này"); admin `POST /admin/users/:id/reset-password` cho `se008.a@catgpt.local` → `204`, tài khoản vẫn `BLOCKED` (xác minh lại `GET /admin/users/:id` → `status: "BLOCKED"`); mật khẩu mới không ghi vào bất kỳ file nào trong repo. `grep -rniE "sk-|mật khẩu \`|Se008Thesis" docs/thesis/` chỉ còn khớp các câu mô tả chung (bcrypt, tài liệu tham khảo OWASP), không còn giá trị thật
- [x] 2. AC2 hai nhận định sai — Đạt. §1: sửa thành `apps/web/next.config.ts` khai báo `rewrites()` chuyển `/api/:path*` sang `${API_INTERNAL_URL}/api/:path*`, ghi rõ `proxy.ts` không tham gia (đã xác minh lại bằng `grep -n "rewrites\|API_INTERNAL_URL" apps/web/next.config.ts`). §3.3: sửa thành "ném lỗi ngay khi đã phát đủ 20 đoạn (`emitted === 20` trong `mock-llm.provider.ts`, không theo tỷ lệ nội dung)"
- [x] 3. AC4 TC-M1-02 — Đạt. Kết quả thực tế sửa thành: "Đạt phần thông báo lỗi; thời gian phản hồi đồng đều chỉ kiểm qua code (M1-08: luôn chạy `verifyPassword` với `DUMMY_PASSWORD_HASH`), chưa đo" — đúng nguyên văn TL yêu cầu
- [x] 4. AC5 chú thích ảnh — Đạt. `m1-05`: sửa thành "cột 'Người dùng' hiện `UserAvatar` (ảnh hoặc chữ cái đầu khi chưa có ảnh; mọi tài khoản thử trong ảnh chưa có ảnh nên chỉ thấy chữ cái đầu); PR #3 mới bỏ cột ảnh này" (xác minh lại `grep -n "UserAvatar" apps/web/src/features/admin-users/components/users-management.tsx`). `m2-01`: sửa thành "danh sách đánh số kèm dòng 'Đây là câu trả lời mẫu…'", bỏ "bảng so sánh" và "sau khi tải lại". `m1-08`: đo lại bằng `System.Drawing.Image` → đúng 238×432, sửa cả dòng "Tình trạng" lẫn đoạn giới thiệu chung (trước ghi chung "768px" cho cả 4 ảnh tạm). `m2-04`: đổi "Tình trạng" thành "Không dùng trong báo cáo — thanh bên có tiêu đề hội thoại lỗi mã hóa…; TL chụp lại sau tích hợp PR #4" (giữ file, không dùng)
- [x] 5. Liên kết gãy — Đạt. 4 dòng TC-M1-09…12 (không chỉ dòng TL nêu) đều trỏ `../../tasks/SE-002-avatar-requires-login.md#checklist-vòng-1` — tất cả đổi sang `https://github.com/duong2604/cat_gpt/blob/d60864a/docs/tasks/SE-002-avatar-requires-login.md#checklist-vòng-1` để nhất quán. Xác nhận `docs/tasks/SE-002-avatar-requires-login.md` **có tồn tại** trên `develop` (bản `Sẵn sàng` gốc, có heading `## Lịch sử review` rỗng) nên 2 liên kết trong `03-implementation.md` (`#lịch-sử-review` và không neo) không gãy, không cần sửa — chỉ anchor `#checklist-vòng-1` là chưa tồn tại trên `develop`

**Kiểm tra đã chạy** — Không sửa code. `git diff --stat origin/develop...HEAD` vẫn đúng 17 file (không đổi phạm vi so với vòng 1). Mở lại cả 13 ảnh, đối chiếu kích thước thật bằng `System.Drawing.Image` cho 4 ảnh PR tạm (768×348, 238×432, 768×320, 768×320). `grep -rniE "sk-|mật khẩu \`|Se008Thesis"` và kiểm thủ công: không còn mật khẩu, khóa API hay SĐT/email cá nhân trong `docs/thesis/`.
**Dọn nhánh** — Không đổi so với vòng 1: `develop` local tại `71e1263` khi vòng 1 bàn giao, nay tại `f4bd76f` sau khi merge review của TL; không có nhánh/worktree nào đủ điều kiện dọn (SE-002 vẫn `Chờ Review`).
**Trạng thái** — Chờ Review

## Phản hồi UI
Không áp dụng (tài liệu).
