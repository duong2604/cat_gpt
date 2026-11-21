# Báo cáo sự cố dữ liệu SE-005 (AC5) — 22/11/2026

Người lập: TL · Trạng thái: **ĐANG XỬ LÝ — CHỜ CTO DUYỆT PHƯƠNG ÁN** · Môi trường: MongoDB Atlas, DB **`cat_gpt_loadtest`** (DB demo `cat_gpt` không bị ảnh hưởng — SE kiểm chỉ đọc: 0 tài khoản `loadtest+`)

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
