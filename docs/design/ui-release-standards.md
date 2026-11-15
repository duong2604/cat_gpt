# Chuẩn giao diện và tiêu chí phát hành

> Trạng thái: **Chờ Review** (TL soạn qua [TL-003](../tasks/TL-003-access-ui-release-audit.md), 15/11/2026). Đối chiếu `develop` @ `06a5a83`. Áp dụng cho mọi task có giao diện từ sau demo 20/11/2026; review UI của TL dùng mục 1–2 làm tiêu chí.
> Phân quyền: [access-control.md](access-control.md).

## 1. Chuẩn dùng chung

| Hạng mục | Chuẩn | Hiện trạng `develop` | Việc cần làm |
|---|---|---|---|
| **Font tiếng Việt** | Một font sans có đủ dấu tiếng Việt, nạp bằng `next/font` (subset `vietnamese` + `latin`, `display: swap`), gán vào `--font-sans`; dự phòng `system-ui`. Đề xuất **Be Vietnam Pro** (400/500/600). Kiểm tra dấu chồng (ặ, ỗ, ữ) ở tiêu đề và nút không bị cắt | Chỉ dùng chồng font hệ thống (`ui-sans-serif, system-ui, "Segoe UI", …`) — hiển thị khác nhau theo máy | [SE-004](../tasks/SE-004-ui-consistency.md) |
| **Theme** | Sáng/tối theo hệ thống (`defaultTheme="system"`), đổi được ở thanh trên. Chỉ dùng token màu trong `globals.css` (`bg-background`, `text-muted-foreground`, `bg-primary`…), không mã màu cứng. Trạng thái: lỗi = `destructive`, thành công = toast `success` | Đúng chuẩn; demo hiện tối vì máy dùng chế độ tối | Kiểm tra cả hai theme mỗi lần review UI |
| **Khoảng cách và bố cục** | Thang Tailwind 4px. Trang thường: `max-w-6xl`, lề `p-4 md:p-6 lg:p-8`. Trang tự quản bố cục (hiện chỉ `/chat`) khai báo trong `FULL_BLEED_ROUTES`. Breakpoint chính `md` (768px); mobile tối thiểu 360px, không cuộn ngang toàn trang | Đúng chuẩn; bảng quản trị người dùng trên 375px cuộn ngang trong khung bảng, cột thao tác "…" bị che | SE-004 |
| **Component** | Chỉ dùng `src/components/ui` (shadcn): `Button`, `Input`/`Field`, `Select`, `Table`, `Tabs`, `Dialog`, `AlertDialog` (mọi thao tác xóa/khóa), `Sheet` (danh sách trên mobile), `Empty` (trạng thái trống), `Skeleton`/`Spinner` (tải), `Alert` (lỗi trong form), toast `sonner` (kết quả thao tác). Không tạo component trùng chức năng | Đúng chuẩn | — |
| **Nội dung thông báo** | Tiếng Việt có dấu, xưng hô trung tính, câu ngắn. Thành công: "Đã <động từ> <đối tượng>." (ví dụ "Đã đổi tên cuộc trò chuyện."). Lỗi: nêu chuyện gì xảy ra + cách xử lý, không hiện mã kỹ thuật; mọi mã lỗi API có khóa `errors.<CODE>` ở cả `vi.json` và `en.json`. Xác nhận xóa: nêu hậu quả ("…bị xóa vĩnh viễn"). Không hứa tính năng chưa có | Phần lớn đúng; Hồ sơ ghi "Thông tin hiển thị với đồng nghiệp trong hệ thống" nhưng chưa có màn hình đồng nghiệp ([CS-4](access-control.md#4-chính-sách-cần-khách-hàng--cto-chốt)) | SE-004 |
| **Song ngữ** | Mọi chuỗi qua `next-intl`; thêm khóa mới phải có ở cả `vi` và `en` (typecheck bắt thiếu khóa) | Đúng chuẩn | — |

## 2. Kiểm tra trạng thái giao diện (15/11/2026, `06a5a83`)

Desktop 1536×695; mobile = trang nhúng trong khung rộng 375px (viewport 372px) vì không đổi được kích thước cửa sổ trình duyệt.

| Màn hình | Trống | Đang tải | Lỗi | Thành công | Mobile |
|---|---|---|---|---|---|
| Đăng nhập | — | Nút bị khóa khi gửi (code `login-form.tsx`) | Đạt — "Email hoặc mật khẩu không đúng." (ảnh) | Đạt — vào `/chat` | Chưa kiểm tra |
| Chat — danh sách | Đạt — "Chưa có cuộc trò chuyện nào." (NV1) | Skeleton (code `conversation-list.tsx`) | — | Đạt — toast đổi tên/xóa (SE-001) | Đạt — `Sheet`, không cuộn ngang (SE-001, TL-003) |
| Chat — khung | Đạt — lời chào + 4 gợi ý | Đạt — "…" rồi chữ chạy dần | Đạt — "Không tìm thấy cuộc trò chuyện" + nút "Cuộc trò chuyện mới" (id người khác, id sai); nhãn lỗi `/error` (SE-001) | Đạt — gửi, dừng, tạo lại | Đạt — lời chào và gợi ý xếp dọc, không cuộn ngang |
| Hồ sơ › Thông tin | — | Spinner khi lưu (code) | Validation theo trường (code) | Toast (code) | Đạt — không cuộn ngang |
| Hồ sơ › Phiên đăng nhập | — | — | — | Đạt — liệt kê thiết bị, "Thiết bị này", "Đăng xuất tất cả thiết bị khác" (ảnh) | Chưa kiểm tra |
| Quản trị người dùng | Chưa kiểm tra (luôn có ít nhất admin) | Skeleton (code) | Đạt — người không phải admin thấy "Không có quyền truy cập" | Đạt — danh sách, nhãn vai trò/trạng thái, "Bạn" ở dòng của mình | **Chưa đạt** — cột thao tác bị che, phải cuộn ngang trong bảng |
| Tài liệu | Trang giữ chỗ "Đang phát triển" | — | — | — | — |

Ghi chú: biểu tượng "N" góc phải dưới là công cụ của Next ở chế độ `pnpm dev`, không có ở bản build; trên mobile nó đè nút Gửi khi chạy dev.

## 3. Chế độ phát hành và tính năng hiển thị

Hai chế độ, chọn bằng biến môi trường khi chạy (đề xuất `RELEASE_MODE=demo|staff`, mặc định `demo` để không đổi bản demo đã chốt):

| Tính năng | `demo` (bản 20/11) | `staff` (thử nội bộ) | Căn cứ |
|---|---|---|---|
| Đăng nhập, Hồ sơ, Phiên đăng nhập | Hiện | Hiện | Đã hoàn thành |
| Quản trị người dùng | Chỉ `ADMIN` | Chỉ `ADMIN` | Đã đúng (access-control mục 2) |
| Chat | Hiện, câu trả lời mẫu | **Ẩn** cho tới khi có AI thật — chờ [CS-6](access-control.md#4-chính-sách-cần-khách-hàng--cto-chốt) | Không để nhân viên dùng câu trả lời giả |
| Tài liệu (giữ chỗ "Đang phát triển") | Hiện như hiện tại | **Ẩn** khỏi thanh bên; mở trực tiếp → trang 404 | Chưa sẵn sàng |
| Swagger `/api/v1/docs` | Bật | **Tắt** | KT-2 |

## 4. Tiêu chí chuẩn bị cho 500 nhân sự

Giả định để đặt ngưỡng (TL đề xuất, chờ chốt [CS-5](access-control.md#4-chính-sách-cần-khách-hàng--cto-chốt)): 500 tài khoản; giờ cao điểm 20% trực tuyến (100 người); 10% gửi Chat trong cùng một phút → **thiết kế cho 100 luồng Chat streaming đồng thời** và 200 lần đăng nhập trong 5 phút đầu giờ, phần lớn chung một IP công ty.

Cột **Trước thử nội bộ**: **Bắt buộc** = chưa đạt thì không mở cho nhân viên; **Sau** = làm trong giai đoạn thử.

| # | Tiêu chí | Ngưỡng / cách kiểm tra | Trước thử nội bộ | Hiện trạng |
|---|---|---|---|---|
| R-1 | Phân quyền | Mọi dòng XM ở [access-control](access-control.md#2-ma-trận-vai-trò--màn-hình--thao-tác--dữ-liệu--khi-thiếu-quyền) chạy lại đạt; KT-1, KT-2 đã sửa; CS-1…CS-4 đã chốt | **Bắt buộc** | KT-1, KT-2 mở (SE-002, SE-003) |
| R-2 | Chế độ `staff` | Tính năng chưa sẵn sàng bị ẩn theo mục 3 | **Bắt buộc** | SE-003 |
| R-3 | Đăng nhập đồng loạt | 200 đăng nhập/5 phút từ **một IP** không bị `429`; giới hạn chống dò mật khẩu chuyển sang theo **tài khoản** (ví dụ 5 lần sai/15 phút/email) | **Bắt buộc** | Chưa đạt — 5 lần/phút/IP (KT-3) |
| R-4 | Chat streaming đồng thời | Kịch bản tải: 100 người, mỗi người gửi 1 tin/30 giây trong 10 phút. Đạt khi: không lỗi 5xx do máy chủ, sự kiện `delta` đầu tiên p95 ≤ 2 s (đo riêng phần LLM), API thường p95 ≤ 300 ms. Giới hạn 20 tin/phút/người và nút Dừng đúng khi chạy **nhiều instance** (lưu chung, ví dụ Redis) | **Bắt buộc** (kịch bản và ngưỡng); nhiều instance: Sau nếu chạy 1 instance chịu được tải | Chưa đo; giới hạn và stream trong bộ nhớ một tiến trình (KT-4) |
| R-5 | Tỷ lệ lỗi | 5xx < 1% số request trong kịch bản R-4; lỗi LLM hiển thị nhãn lỗi và tạo lại được (đã có) | **Bắt buộc** | Phần giao diện đạt (SE-001 AC8) |
| R-6 | Hạn mức AI | Có hạn mức theo người/ngày và tổng theo tháng; chạm hạn mức → thông báo đã dịch, không lỗi 5xx; theo dõi chi phí theo ngày | **Bắt buộc** khi bật AI thật | Chưa có AI thật (D2 = không, Q4 chưa chọn) |
| R-7 | Theo dõi sự cố | Log có mã request và `userId` (không ghi nội dung tin nhắn hay mật khẩu); `GET /health` được giám sát mỗi phút; cảnh báo khi 5xx > 1% trong 5 phút hoặc LLM lỗi liên tục; có người trực và kênh báo lỗi cho nhân viên | **Bắt buộc**: health + log + kênh báo lỗi. Cảnh báo tự động: Sau | Có `/health`; chưa có giám sát |
| R-8 | Sao lưu | MongoDB sao lưu hằng ngày, đã thử khôi phục một lần | **Bắt buộc** | Chưa kiểm tra (Atlas M0 không có sao lưu tự động) |
| R-9 | Giao diện | Mục 1–2 đạt trên desktop và mobile, cả hai theme | Sau (trừ lỗi chặn thao tác) | SE-004 |

Task cho R-3…R-8 tạo sau khi chốt CS-5 (hạ tầng, quy mô) và Q4 (nhà cung cấp AI).
