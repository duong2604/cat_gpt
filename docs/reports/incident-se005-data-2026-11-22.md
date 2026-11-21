# Báo cáo sự cố dữ liệu SE-005 (AC5) — 22/11/2026

Người lập: TL · Trạng thái: **ĐANG XỬ LÝ — CTO ĐỒNG Ý KHÔI PHỤC VỀ NGUYÊN TẮC; CHỜ DUYỆT KẾ HOẠCH CHI TIẾT (mục 6)** · Môi trường: MongoDB Atlas, DB **`cat_gpt_loadtest`** (DB demo `cat_gpt` không bị ảnh hưởng — SE kiểm chỉ đọc: 0 tài khoản `loadtest+`)

Mọi kiểm tra trong báo cáo này là **chỉ đọc** (`find`/`countDocuments`/`aggregate` trên `cat_gpt_loadtest` và `local.oplog.rs`). Không có thao tác ghi nào lên DB sau sự cố.

## 1. Diễn biến
| Thời điểm (giờ VN) | Sự kiện | Nguồn |
|---|---|---|
| 21/11 (các lần đo SE-005) | `shared-ip-check.mjs` tạo/đảm bảo 200 tài khoản `loadtest+001..200` qua `POST /admin/users`; phase activity (chat ~10% tài khoản) sinh hội thoại trên `cat_gpt_loadtest` | SE; `se5-base-c20.out` ("created=80 existing=120") |
| 21/11 22:36 | Lần đo cuối: 200/200 tài khoản đăng nhập 2xx → trước cleanup tất cả **ACTIVE** | `se5-final-c50.out` |
| 22/11 00:11:08 | SE khởi động API (cổng 4000, `db=cat_gpt_loadtest`) và chạy `--phase=cleanup` | `se5-cleanup-api.log` |
| 22/11 00:11:38 → 00:17:19 | **710 hội thoại bị xóa cứng** (kèm tin nhắn); 200 tài khoản loadtest bị đặt `BLOCKED` | oplog (`op:'d'`), `users.updatedAt` 00:11:32–00:17:21 |
| 22/11 00:17:21 | Kết quả "CLEANUP conversations_deleted=710 accounts_locked=200 failed=0" | `se5-ac5-cleanup.out` |
| Sau đó | SE khóa thêm `brute+ac3@catgpt.local` (tài khoản thử AC3) | SE |

**Nguyên nhân:** SE chạy kịch bản dọn có xóa cứng mà **không** ghi danh sách ID trước, **không** dry-run, **không** xin xác nhận chủ dự án/CTO — tự coi "DB test" là đủ điều kiện. Kịch bản lấy hội thoại bằng một lần `GET /conversations?limit=100` mỗi tài khoản rồi `DELETE` từng cái.

## 2. Phạm vi bị ảnh hưởng (kiểm chứng chỉ đọc)
| Hạng mục | Số lượng | Bằng chứng |
|---|---|---|
| Hội thoại bị xóa | **710** (của **20** tài khoản loadtest) | oplog: 833 lệnh xóa hội thoại trong khung oplog; lọc theo chủ sở hữu ở bản insert gốc = tài khoản loadtest → 710, thời gian xóa 00:11:38–00:17:19 |
| Tin nhắn bị xóa | **1.420** (USER + ASSISTANT) | oplog: 1.420 insert tin nhắn thuộc 710 hội thoại; 0 tin bị xóa riêng trước đó |
| Hội thoại loadtest còn lại | 0 | `conversations.countDocuments({userId ∈ loadtest})` = 0 (không sót) |
| Tài khoản bị khóa trong sự cố | **201** = 200 `loadtest+001..200` + 1 `brute+ac3@catgpt.local` | `users`: `loadtest:BLOCKED` = 200; `brute+ac3` BLOCKED (danh sách ID: tệp `incident-readonly.json`) |
| Tài khoản bị xóa | 0 | 200 `loadtest+` vẫn tồn tại |
| Phiên đăng nhập loadtest | 1.629 bản ghi còn nguyên | `sessions` |
| 123 lệnh xóa hội thoại khác trong oplog | **Không thuộc sự cố** — dọn dữ liệu thử theo ID của các kịch bản kiểm chứng TL (tài khoản `tl-*`, `b3-*`, `b9-*`, `b13-*`) trong ngày | chủ sở hữu ở bản insert gốc không phải loadtest |

**Phân loại tài khoản đang `BLOCKED` trên `cat_gpt_loadtest` (312):** 200 loadtest (sự cố) · 1 `brute+ac3` (sự cố — tài khoản thử AC3 của SE-005) · 103 `tl-*` và 8 `b3-*`/`b9-*`/`b13-*` (tài khoản thử của TL, khóa có chủ đích sau mỗi kịch bản — **không thuộc sự cố**). Tài khoản thử còn `ACTIVE` cần xử lý riêng: `native+se029@catgpt.local` (SE tạo cho SE-029, chưa khóa).

## 3. Mất gì — phục hồi được gì — chưa xác định
| | Nội dung |
|---|---|
| **Phục hồi được nguyên bản** | Toàn bộ **710 hội thoại + 1.420 tin nhắn**: oplog của cụm (khung từ 20/11 23:33) còn **bản insert đầy đủ** của từng tài liệu (cùng `_id`, `userId`, nội dung, thời gian) và **1.420 bản update** (`touch` → `lastMessageAt`). Đã **xuất chỉ đọc** ra tệp, giữ kiểu ObjectId/Date (Extended JSON) |
| **Phục hồi được** | 201 tài khoản bị khóa — mở lại bằng đặt `status: ACTIVE` (tài khoản không bị xóa) |
| **Không mất** | Tài khoản, phiên đăng nhập, tài liệu/Qdrant (cleanup không chạm), DB demo `cat_gpt` |
| **Chưa xác định** | (a) Atlas Cloud Backup/snapshot có bật cho cụm hay không — không kiểm được bằng quyền ứng dụng, cần chủ dự án xem tab Backup trên Atlas (không còn cần thiết nếu duyệt phương án oplog). (b) Trạng thái `BLOCKED/ACTIVE` của 200 tài khoản **trước các lần đo** (chỉ biết chắc ACTIVE lúc 22:36) |

**Bảo toàn bằng chứng:** oplog là capped collection (khung hiện ~25 giờ) → sẽ cuộn mất. TL đã xuất ngay (chỉ đọc) và lưu bền ngoài repo:
`D:\workspace\buggysoft\cat_gpt-incident-se005\` — `incident-oplog-export.ejson` (3,45 MB, SHA-256 `a44a9f3d33c4a557…`), `incident-summary.json`, `incident-readonly.json` (danh sách ID 201 tài khoản), `incident-deleted-conversation-ids.json`, 2 kịch bản chỉ đọc, `SHA256SUMS`. Log của SE giữ nguyên tại scratchpad phiên SE (`se5-ac5-cleanup.out`, `se5-cleanup-api.log`, …) và `cat_gpt-se5/apps/api/scripts/shared-ip-check.mjs`; SE đã được yêu cầu không sửa/xóa.

## 4. Phương án khôi phục (TRÌNH CTO — chưa thực hiện)
| Bước | Việc | Kiểm soát |
|---|---|---|
| R0 | Duyệt phạm vi: DB `cat_gpt_loadtest`; danh sách ID 200 tài khoản loadtest + 710 hội thoại + 1.420 tin nhắn (từ tệp export) | CTO xác nhận danh sách |
| R1 | **Dry-run** kịch bản khôi phục: đọc tệp export, kiểm 0 `_id` trùng trong `conversations`/`messages`, mọi `userId` thuộc 200 tài khoản loadtest, đếm 710/1.420; dựng trạng thái cuối của hội thoại = bản insert + áp lần lượt 1.420 update (`lastMessageAt`) | Không ghi; in báo cáo đối chiếu |
| R2 | Ghi: `insertMany` 710 hội thoại + 1.420 tin nhắn **đúng bản gốc** (cùng `_id`), không sinh dữ liệu mới | Chỉ sau CTO duyệt R1 |
| R3 | Mở khóa **200** tài khoản loadtest theo danh sách ID (`status: ACTIVE`); **giữ** `brute+ac3` BLOCKED (tài khoản thử, không phải dữ liệu loadtest) — hoặc theo CTO | Theo danh sách ID |
| R4 | Đối chiếu: đếm hội thoại theo từng tài khoản = số trong export (20 tài khoản), 1.420 tin nhắn, 200 ACTIVE; kiểm qua API (đăng nhập 1 tài khoản, `GET /conversations`) | Ghi kết quả thực tế |
| R5 | `native+se029@catgpt.local`: khóa (như mọi tài khoản thử) | CTO xác nhận |
**Không** tạo dữ liệu giả; nếu R1 phát hiện sai lệch → dừng, báo CTO. Người thực hiện đề xuất: TL viết + chạy dry-run, CTO duyệt, TL chạy R2–R4 (SE không chạm dữ liệu).

## 5. Biện pháp phòng ngừa
1. Quy định CTO "thao tác dữ liệu" (6 điểm) đưa vào `docs/project/workflow.md` và hai prompt onboarding (TL, SE) — chờ CTO duyệt văn bản.
2. Kịch bản đụng dữ liệu bắt buộc: tham số `--dry-run` mặc định; in danh sách ID + số lượng; chỉ xóa theo tệp danh sách đã duyệt; ghi tệp kết quả đối chiếu.
3. Kịch bản kiểm thử/tải **không xóa cứng** mặc định — chỉ khóa tài khoản; xóa chỉ qua quy trình duyệt.
4. TL review mọi kịch bản có thao tác ghi dữ liệu trước khi chạy (như review PR).
5. Trước mỗi đợt đo tải: chụp số lượng (`count`) theo collection và xuất chỉ đọc danh sách ID dữ liệu thử; ghi vào task.
6. Không dùng cổng 4000 (cổng demo) cho API kiểm thử — tránh nhầm môi trường.


## 6. Kế hoạch chi tiết R0–R5 (trình CTO duyệt — CHƯA THỰC HIỆN BƯỚC GHI NÀO) — 22/11/2026 01:30

CTO (22/11) đồng ý khôi phục về nguyên tắc; cho phép làm ngay bước chỉ đọc. **Đã làm (chỉ đọc):** R0 (manifest) và R1 (dry-run). **Chờ duyệt:** RB, R2, R3, R4, R5.

Thư mục bằng chứng/manifest: `D:\workspace\buggysoft\cat_gpt-incident-se005\` — kiểm toàn vẹn bằng `sha256sum -c SHA256SUMS` (14 tệp OK). DB duy nhất bị tác động: **`cat_gpt_loadtest`** (cụm Atlas dùng chung URI với demo — chỉ đổi tên DB). Người thực hiện đề xuất: **TL**; SE không chạm dữ liệu.

| Bước | Mục tiêu | DB · collection | Thao tác | Số lượng · danh sách ID | Backup / rollback | Điều kiện hoàn thành |
|---|---|---|---|---|---|---|
| **R0** ✅ đã làm | Chốt phạm vi bằng danh sách ID | `cat_gpt_loadtest`: `users`, `conversations`, `messages`; `local.oplog.rs` | **Đọc** | 200 tài khoản loadtest (`r0-accounts-loadtest.json`); 2 tài khoản thử khác (`r0-accounts-other.json`: `brute+ac3` `6b01a93ba72efa1c2b4eb586`, `native+se029` `6b01d398b60ed57b7522f2ef`); 710 hội thoại (`r0-conversations.json`); 1.420 tin nhắn (`r0-messages.json`); phân bổ theo tài khoản (`r0-per-user.json`: 20 tài khoản `loadtest+010, +020, …, +200` — 18 × 35 + 2 × 40 = 710) | Không cần (không ghi) | Manifest + SHA-256 trong `SHA256SUMS` |
| **R1** ✅ đã làm | Dry-run: dựng lại tài liệu gốc và kiểm điều kiện an toàn | như R0 | **Đọc** (`writes: 0`) | Dựng 710 hội thoại = bản insert + 1.420 update `lastMessageAt` theo thứ tự oplog; 1.420 tin nhắn = bản insert (0 update) | Không cần | **Đạt** (`r1-dryrun-result.json`): 0 `_id` trùng trong `conversations`/`messages`; 100% chủ sở hữu thuộc 200 tài khoản loadtest; mọi tin nhắn thuộc 710 hội thoại; mỗi hội thoại đúng 2 tin (710 USER + 710 ASSISTANT, đều `COMPLETED`); 0 hội thoại thiếu `lastMessageAt`; 0 diff không áp được. Tài liệu dựng sẵn: `r2-restore-documents.ejson` (SHA `535d1ab6…`) |
| **RB** | Ảnh chụp trước khi ghi (để rollback) | `users` (202 tài khoản trong R0), `conversations`/`messages` của 200 tài khoản loadtest | **Đọc** → tệp `rb-before.ejson` | 202 bản ghi `users` (chỉ `_id`, `email`, `status`, `updatedAt`); hội thoại/tin nhắn loadtest hiện = 0 | Là bản backup của R2–R5 | Tệp + SHA-256; số bản ghi khớp R0 |
| **R2** | Khôi phục nguyên bản 710 hội thoại + 1.420 tin nhắn | `cat_gpt_loadtest.conversations`, `.messages` | **Ghi**: `insertMany` (ordered, không upsert) đúng tài liệu trong `r2-restore-documents.ejson`; **không** sinh dữ liệu mới | 710 + 1.420, đúng ID trong `r0-conversations.json`/`r0-messages.json` | Rollback: `deleteMany({_id ∈ danh sách R0})` — chỉ đúng các ID vừa chèn (hiện không tồn tại → không đụng dữ liệu khác). Kiểm trước khi ghi: chạy lại R1 ngay trước R2, phải vẫn 0 trùng | `countDocuments({_id ∈ R0})` = 710 / 1.420; đối chiếu hash nội dung từng tài liệu với `r2-restore-documents.ejson` |
| **R3** | Mở khóa 200 tài khoản loadtest | `cat_gpt_loadtest.users` | **Ghi**: qua API admin `PATCH /admin/users/:id/status {ACTIVE}` (giữ audit/nghiệp vụ như thao tác admin thật) | 200 ID trong `r0-accounts-loadtest.json` | Rollback: `PATCH … {BLOCKED}` cho đúng 200 ID (theo `rb-before.ejson`) | 200/200 `ACTIVE`; 1 tài khoản bất kỳ đăng nhập được |
| **R4** | Đối chiếu sau khôi phục | như R2–R3 | **Đọc** | Số hội thoại từng tài khoản = `r0-per-user.json`; 1.420 tin; qua API: 1 tài khoản (vd `loadtest+050`, 40 hội thoại) `GET /conversations` + `GET /conversations/:id/messages` | — | Báo cáo đối chiếu ghi vào mục 7; lệch bất kỳ → dừng, báo CTO, cân nhắc rollback |
| **R5** | Xử lý 2 tài khoản thử ngoài loadtest | `cat_gpt_loadtest.users` | `brute+ac3`: **không đổi** (giữ `BLOCKED` — tài khoản thử AC3). `native+se029`: **Ghi** `PATCH … {BLOCKED}` (như mọi tài khoản thử sau khi xong) | 1 ID (`6b01d398b60ed57b7522f2ef`) | Rollback: `PATCH … {ACTIVE}` | `native+se029` = `BLOCKED` |

**Không làm:** tạo hội thoại/tin nhắn mới, đổi nội dung, xóa bất kỳ bản ghi nào ngoài rollback đã nêu, chạm DB demo `cat_gpt`, chạm 123 hội thoại đã xóa không thuộc sự cố.
**Thứ tự đề xuất:** RB → R1 (chạy lại) → R2 → R3 → R4 → R5; mỗi bước ghi kết quả thực tế + đối chiếu vào báo cáo này.
**Sau khôi phục (điều kiện CTO mục B):** SE đo lại SE-005 trên SHA cuối, kiểm HTTP 429 + thông báo tiếng Việt trên trình duyệt, chạy hồi quy liên quan; AC5 **giữ NOT PASS** (không hợp thức hóa thao tác xóa trước đó).
