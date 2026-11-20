# Sự cố 19/11/2026 — xóa nhầm 2 hội thoại của admin

Người lập: TL · 21/11/2026 · Trạng thái: **Chờ CTO quyết phương án** · Kiểm tra đã làm: **chỉ đọc**, không restore, không sửa dữ liệu.

## 1. Tóm tắt

Lúc **19/11/2026 23:47:46 (giờ Việt Nam; 16:47:46 UTC)**, trong lúc dọn dữ liệu thử của SE-015, phiên Senior Dev lọc hội thoại theo regex tiêu đề và gọi API xóa, làm mất 2 hội thoại của `admin@catgpt.local` không thuộc phiên kiểm thử:

| Hội thoại | Tạo lúc (từ ObjectId, UTC) |
|---|---|
| `6af97fa97574d45095c4708d` | 15/11/2026 09:47:21 |
| `6ae0bae8cf5039534ca9f362` | 27/10/2026 14:53:28 |

**Đính chính so với báo cáo 19–20/11:** báo cáo trước ghi "xóa kèm toàn bộ tin nhắn". Oplog cho thấy lúc xóa **không có tin nhắn nào bị xóa cùng** (mục 3). Phần mất được xác nhận là 2 bản ghi hội thoại (tiêu đề, thời gian, chủ sở hữu). Không xác định được hai hội thoại từng có tin nhắn hay không trước 19/11 22:50 (giờ VN), vì oplog không lưu xa hơn.

## 2. Nguyên nhân

- Lọc bản ghi cần xóa theo **tiêu đề / regex** thay vì theo id đã ghi lúc tạo.
- Dùng chung tài khoản thật (`admin`) với dữ liệu thử, nên bộ lọc rộng chạm vào dữ liệu thật.
- Hội thoại không có xóa mềm; API `DELETE /conversations/:id` xóa hẳn (`deleteMany` tin nhắn, rồi `deleteOne` hội thoại).

## 3. Kiểm tra chỉ đọc (21/11/2026)

Bằng driver MongoDB của ứng dụng, chỉ dùng `hello`, `buildInfo`, `atlasVersion`, `dbStats`, `find` / `countDocuments` / `aggregate` (đọc). Không lệnh ghi.

| Kiểm tra | Kết quả |
|---|---|
| Cluster | Atlas, MongoDB 8.0.39 enterprise, replica set 3 node (`atlas-…-shard-0`) |
| Loại cluster | **Dùng chung (M0 hoặc Flex)**: namespace trong oplog có tiền tố tenant (`<id>_cat_gpt.…`), và truy vấn oplog bị proxy viết lại ("Error modifying $match value for oplog queries") |
| 2 hội thoại trong `conversations` | 0 (đã mất) |
| Tin nhắn có `conversationId` thuộc 2 hội thoại | 0 |
| Oplog | Đọc được; cửa sổ từ 19/11 15:50 UTC tới thời điểm kiểm (~25 giờ, trượt dần) |
| Lệnh xóa 2 hội thoại trong oplog | 2 mục `d`, 16:47:46.697 và 16:47:46.952 UTC |
| Mục oplog khác chạm tới 2 id | Không có (không insert/update nào trong cửa sổ) |
| Lệnh xóa tin nhắn | 4 mục trong toàn bộ cửa sổ, lúc 15:52–16:33 UTC, **trước** lúc xóa 2 hội thoại; lúc 16:40–17:00 UTC: 0 |
| Nội dung trong oplog | Mục xóa chỉ chứa `_id` → **không dựng lại được nội dung từ oplog** |
| Dữ liệu hiện tại (`cat_gpt`) | 5 collection, 304 bản ghi, 0,09 MB: users 19, sessions 204, conversations 27 (admin 21), messages 54, documents 0 |

**Không kiểm được từ phía TL:** cấu hình backup/snapshot của Atlas (cần quyền Atlas UI hoặc Atlas Admin API; máy này không có Atlas CLI, `.env` không có API key).

### 3.1. Xác minh thêm loại cluster (21/11/2026, chỉ đọc, theo CTO mục D)

| Dấu hiệu (lệnh đọc) | Kết quả | Ý nghĩa |
|---|---|---|
| `hello.tags` | `provider: AWS`, `region: AP_SOUTHEAST_1`, `nodeType: ELECTABLE`, `workloadType: OPERATIONAL` | Không có trường phân biệt gói |
| `serverStatus` | Chỉ trả tập trường rút gọn | Đặc trưng proxy của cluster dùng chung |
| `dbStats` | `fileSize: 0`, `totalFreeStorageSize: 0`, `numExtents: 0` | Đặc trưng proxy dùng chung (cluster riêng trả số thật) |
| Oplog | Namespace có tiền tố tenant; truy vấn bị proxy viết lại | Chắc chắn là **cluster dùng chung** |
| Quyền user ứng dụng | `atlasAdmin` | Có trên mọi gói, không phân biệt |

**Kết luận:** chắc chắn là cluster dùng chung, tức **M0 hoặc Flex**. Từ phía cơ sở dữ liệu **không phân biệt được** M0 với Flex; cần Atlas UI hoặc Admin API. TL không dùng phiên trình duyệt hay tài khoản Atlas của CTO để tự xem.

**Việc CTO cần làm (khoảng 1 phút, chỉ xem):** Atlas → Project → Clusters → `Cluster0`. Thẻ cluster ghi `M0 Sandbox` hoặc `Flex`. Nếu là Flex: tab **Backup** → danh sách snapshot → ghi thời điểm snapshot gần nhất **trước 19/11/2026 16:47 UTC**.

## 4. Backup và khả năng khôi phục

| Nếu cluster là | Backup | Khôi phục 2 hội thoại |
|---|---|---|
| **M0 (Free)** | Không có snapshot | **Không khôi phục được** |
| **Flex** | Snapshot tự động hằng ngày, giữ một số ngày gần nhất | Khả thi nếu còn snapshot **trước 19/11 16:47 UTC** và hai hội thoại đã có trong snapshot (tạo 27/10 và 15/11 nên khả năng cao là có) |

**Việc CTO / chủ tài khoản Atlas cần xem** (Atlas UI → Project → Clusters → cluster `cluster0` → tab **Backup**): loại cluster, có snapshot không, thời điểm snapshot gần nhất trước 19/11 16:47 UTC, thời hạn lưu.

## 5. Rủi ro với dữ liệu hiện tại

- **Không restore đè lên cluster đang chạy.** Restore cả snapshot sẽ ghi đè mọi thay đổi từ thời điểm snapshot tới nay (từ 19/11: tài khoản, phiên đăng nhập, hội thoại kiểm thử và nghiệm thu), và có thể làm sống lại dữ liệu thử đã dọn.
- Oplog đang trượt: mục xóa lúc 16:47 UTC 19/11 sẽ sớm ra khỏi cửa sổ. Bằng chứng ở mục 3 đã ghi lại trong báo cáo này.
- Giá trị dữ liệu mất thấp: 2 bản ghi hội thoại; không có tin nhắn nào bị xóa cùng lúc sự cố.

## 6. Phương án đề xuất (chờ CTO duyệt, TL không tự thực hiện)

| CTO thấy trên Atlas | Phương án | Rủi ro | Công sức |
|---|---|---|---|
| `M0 Sandbox` | **A — Chấp nhận mất**, đóng sự cố; ghi vào báo cáo đồ án nếu 2 hội thoại có trong ảnh chụp | Không | ~0 |
| `Flex`, không có snapshot trước 19/11 16:47 UTC | A | Không | ~0 |
| `Flex`, có snapshot phù hợp, CTO cần 2 hội thoại | **B — Khôi phục chọn lọc**: restore snapshot sang cluster tạm (không đè `Cluster0`) → đọc 2 bản ghi theo `_id` → CTO duyệt → chèn đúng 2 bản ghi → đếm trước/sau → xóa cluster tạm | Thấp nếu không đè cluster thật; có phí cluster tạm | ~1 giờ |
| Bất kỳ | **Không** restore đè `Cluster0` | Mất mọi dữ liệu từ thời điểm snapshot | — |

Khuyến nghị của TL: **A**, trừ khi 2 hội thoại có trong ảnh báo cáo đồ án.

1. **Khuyến nghị: chấp nhận mất**, nếu Atlas là M0, hoặc nếu 2 hội thoại không xuất hiện trong ảnh chụp của báo cáo đồ án.
2. Nếu là Flex, có snapshot phù hợp và CTO cần khôi phục: restore snapshot sang **một cluster/bản tải xuống riêng** (không đè cluster đang chạy) → đọc đúng 2 bản ghi theo `_id` (và tin nhắn theo `conversationId`, nếu có) → CTO duyệt danh sách → chèn lại đúng các bản ghi đó → kiểm đếm trước/sau. Mỗi bước ghi vào báo cáo này.

## 7. Phòng ngừa đã áp dụng

- Quy tắc dọn dữ liệu trong [workflow 9.1](../../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành) (từ 20/11/2026): chỉ xóa theo `_id` / `userId` do chính phiên tạo; không lọc theo tiêu đề/regex; in danh sách id + chủ sở hữu trước khi xóa và dừng nếu có bản ghi lạ; không tạo dữ liệu thử bằng tài khoản thật (kể cả `admin`).
- Áp dụng thực tế ngày 20/11: kiểm tích hợp của TL chỉ dùng tài khoản tạm `tl-smoke-*`; script dọn chặn nếu có bản ghi không thuộc tài khoản tạm. Sau dọn: 0 bản ghi thừa, admin không bị đụng.
- Đề xuất (chưa làm, cần task riêng nếu CTO muốn): xóa mềm hội thoại; bật snapshot (nâng lên Flex hoặc cao hơn) trước khi có người dùng thật.
