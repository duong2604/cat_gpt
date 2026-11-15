# Chuẩn giao diện và tiêu chí phát hành

> Trạng thái: **Đã duyệt** (khách hàng, 15/11/2026 — gồm font Be Vietnam Pro, chế độ `staff` ẩn Chat mẫu, Swagger theo môi trường). Lập qua [TL-003](../tasks/TL-003-access-ui-release-audit.md). Đối chiếu `develop` @ `06a5a83`. Áp dụng cho mọi task có giao diện từ sau demo 20/11/2026; review UI của TL dùng mục 1–2 làm tiêu chí.
> Phân quyền: [access-control.md](access-control.md).

## 1. Chuẩn dùng chung

| Hạng mục | Chuẩn | Hiện trạng `develop` | Việc cần làm |
|---|---|---|---|
| **Font tiếng Việt** | Một font sans có đủ dấu tiếng Việt, nạp bằng `next/font` (subset `vietnamese` + `latin`, `display: swap`), gán vào `--font-sans`; dự phòng `system-ui`. **Be Vietnam Pro** (400/500/600) — **đã duyệt**. Kiểm tra dấu chồng (ặ, ỗ, ữ) ở tiêu đề và nút không bị cắt | Chỉ dùng chồng font hệ thống (`ui-sans-serif, system-ui, "Segoe UI", …`) — hiển thị khác nhau theo máy | [SE-004](../tasks/SE-004-ui-consistency.md): chuẩn hóa các màn đang dùng trước (Đăng nhập, Chat, Hồ sơ, Quản trị người dùng) |
| **Theme** | Sáng/tối theo hệ thống (`defaultTheme="system"`), đổi được ở thanh trên. Chỉ dùng token màu trong `globals.css` (`bg-background`, `text-muted-foreground`, `bg-primary`…), không mã màu cứng. Trạng thái: lỗi = `destructive`, thành công = toast `success` | Đúng chuẩn; demo hiện tối vì máy dùng chế độ tối | Kiểm tra cả hai theme mỗi lần review UI |
| **Khoảng cách và bố cục** | Thang Tailwind 4px. Trang thường: `max-w-6xl`, lề `p-4 md:p-6 lg:p-8`. Trang tự quản bố cục (hiện chỉ `/chat`) khai báo trong `FULL_BLEED_ROUTES`. Breakpoint chính `md` (768px); mobile tối thiểu 360px, không cuộn ngang toàn trang | Đúng chuẩn; bảng quản trị người dùng trên 375px cuộn ngang trong khung bảng, cột thao tác "…" bị che | SE-004 |
| **Component** | Chỉ dùng `src/components/ui` (shadcn): `Button`, `Input`/`Field`, `Select`, `Table`, `Tabs`, `Dialog`, `AlertDialog` (mọi thao tác xóa/khóa), `Sheet` (danh sách trên mobile), `Empty` (trạng thái trống), `Skeleton`/`Spinner` (tải), `Alert` (lỗi trong form), toast `sonner` (kết quả thao tác). Không tạo component trùng chức năng | Đúng chuẩn | — |
| **Nội dung thông báo** | Tiếng Việt có dấu, xưng hô trung tính, câu ngắn. Thành công: "Đã <động từ> <đối tượng>." (ví dụ "Đã đổi tên cuộc trò chuyện."). Lỗi: nêu chuyện gì xảy ra + cách xử lý, không hiện mã kỹ thuật; mọi mã lỗi API có khóa `errors.<CODE>` ở cả `vi.json` và `en.json`. Xác nhận xóa: nêu hậu quả ("…bị xóa vĩnh viễn"). Không hứa tính năng chưa có | Phần lớn đúng; Hồ sơ ghi "Thông tin hiển thị với đồng nghiệp trong hệ thống" — trái [CS-4](access-control.md#4-chính-sách-đã-chốt) (nhân viên chỉ xem hồ sơ của mình) | SE-004 |
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
| Quản trị người dùng | Chỉ `ADMIN`; không hiện SĐT, ảnh (CS-4) | Như `demo` | access-control mục 4 |
| Chat | Hiện, câu trả lời mẫu | **Ẩn** khi còn phản hồi mẫu: không có trên thanh bên, `/chat` → 404, API `chat/*` và `conversations/*` → 404 | [CS-6](access-control.md#4-chính-sách-đã-chốt) — đã chốt |
| Tài liệu (giữ chỗ "Đang phát triển") | Hiện như hiện tại | **Ẩn** khỏi thanh bên; mở trực tiếp → trang 404 | Chưa sẵn sàng |
| Swagger `/api/v1/docs` | Theo `SWAGGER_ENABLED` (bật ở máy dev/demo) | Theo `SWAGGER_ENABLED` của môi trường, **mặc định tắt** | CS-6, KT-2 |

## 4. Tiêu chí chuẩn bị cho 500 nhân sự

Giả định để đặt ngưỡng (TL đề xuất; quy mô 500 nhân sự đã duyệt, hạ tầng chưa chốt — [CS-5](access-control.md#4-chính-sách-đã-chốt)): 500 tài khoản; giờ cao điểm 20% trực tuyến (100 người); 10% gửi Chat trong cùng một phút → **thiết kế cho 100 luồng Chat streaming đồng thời** và 200 lần đăng nhập trong 5 phút đầu giờ, phần lớn chung một IP công ty.

Cột **Trước thử nội bộ**: **Bắt buộc** = chưa đạt thì không mở cho nhân viên; **Sau** = làm trong giai đoạn thử.

| # | Tiêu chí | Ngưỡng / cách kiểm tra | Trước thử nội bộ | Hiện trạng |
|---|---|---|---|---|
| R-1 | Phân quyền | Mọi dòng XM ở [access-control](access-control.md#2-ma-trận-vai-trò--màn-hình--thao-tác--dữ-liệu--khi-thiếu-quyền) chạy lại đạt; KT-1, KT-2 đã sửa; hành vi đúng CS-1…CS-4 | **Bắt buộc** | CS đã chốt 15/11; còn SE-002, SE-003, SE-006 |
| R-2 | Chế độ `staff` | Tính năng chưa sẵn sàng bị ẩn theo mục 3 | **Bắt buộc** | SE-003 |
| R-3 | Đăng nhập và thao tác đồng loạt từ một IP | Kịch bản [SE-005](../tasks/SE-005-login-limit-shared-ip.md#kịch-bản-kiểm-chứng): 200 tài khoản hợp lệ đăng nhập trong 5 phút rồi thao tác 5 phút, cùng một IP, 20 luồng song song: **0% `429`**, `5xx` < 1%, đăng nhập p95 ≤ 1 s. Chống dò mật khẩu vẫn chạy: một email sai 5 lần → lần 6 `429`, email khác cùng IP không bị ảnh hưởng | **Bắt buộc** | Chưa đạt — 5 lần/phút/IP cho đăng nhập, 120 request/phút/IP cho mọi API (KT-3) → SE-005 |
| R-4 | Chat streaming đồng thời | Kịch bản tải: 100 người, mỗi người gửi 1 tin/30 giây trong 10 phút. Đạt khi: không lỗi 5xx do máy chủ, sự kiện `delta` đầu tiên p95 ≤ 2 s (đo riêng phần LLM), API thường p95 ≤ 300 ms. Giới hạn 20 tin/phút/người và nút Dừng đúng khi chạy **nhiều instance** (lưu chung, ví dụ Redis) | **Bắt buộc** (kịch bản và ngưỡng); nhiều instance: Sau nếu chạy 1 instance chịu được tải | Chưa đo; giới hạn và stream trong bộ nhớ một tiến trình (KT-4) |
| R-5 | Tỷ lệ lỗi | 5xx < 1% số request trong kịch bản R-4; lỗi LLM hiển thị nhãn lỗi và tạo lại được (đã có) | **Bắt buộc** | Phần giao diện đạt (SE-001 AC8) |
| R-6 | Hạn mức AI | Có hạn mức theo người/ngày và tổng theo tháng; chạm hạn mức → thông báo đã dịch, không lỗi 5xx; theo dõi chi phí theo ngày | **Bắt buộc** khi bật AI thật | Chưa có AI thật (D2 = không, Q4 chưa chọn) |
| R-7 | Theo dõi sự cố | Log có mã request và `userId` (không ghi nội dung tin nhắn hay mật khẩu); `GET /health` được giám sát mỗi phút; cảnh báo khi 5xx > 1% trong 5 phút hoặc LLM lỗi liên tục; có người trực và kênh báo lỗi cho nhân viên | **Bắt buộc**: health + log + kênh báo lỗi. Cảnh báo tự động: Sau | Có `/health`; chưa có giám sát |
| R-8 | Sao lưu | MongoDB sao lưu hằng ngày, đã thử khôi phục một lần | **Bắt buộc** | Chưa kiểm tra (Atlas M0 không có sao lưu tự động) |
| R-9 | Giao diện | Mục 1–2 đạt trên desktop và mobile, cả hai theme | Sau (trừ lỗi chặn thao tác) | SE-004 |
| R-10 | Khôi phục tài khoản admin | [Quy trình khôi phục riêng](access-control.md#41-quy-trình-khôi-phục-tài-khoản-admin-đề-xuất--chờ-duyệt) đã duyệt (R1), có người phê duyệt và người thực hiện được chỉ định, lệnh `admin:recover` ghi nhật ký, **đã diễn tập một lần** có biên bản | **Bắt buộc** | [SE-006](../tasks/SE-006-account-admin-rules.md); quy trình chờ duyệt |

Đã có task: R-3 → SE-005; R-1, R-10 → SE-002, SE-003, SE-006. Task cho R-4…R-8 tạo sau khi chốt hạ tầng (CS-5) và Q4 (nhà cung cấp AI).
