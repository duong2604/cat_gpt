# Outline báo cáo — Baseline V1.0 (đã duyệt)

Outline do Project Owner phê duyệt ([DEC-001](decisions.md#quyết-định-đã-phê-duyệt), [DEC-015](decisions.md#quyết-định-đã-phê-duyệt)). **Không tự ý thay đổi** cấu trúc chương, mục hoặc phạm vi; mọi thay đổi phải qua quyết định mới trong [decisions.md](decisions.md). Outline này thay thế bố cục 4 chương ngày 15/11/2026 ở [docs/thesis/01 mục 5](../thesis/01-outline-and-sources.md#5-đề-xuất-bố-cục-chương) về định hướng soạn thảo; bản cũ giữ làm tham khảo.

Số trang là định hướng, không phải chỉ tiêu phải viết đủ bằng mọi giá. Mục nào phụ thuộc chức năng chưa hiện thực thì viết theo nhãn trạng thái thực tế ([format-standard mục 4](format-standard.md#4-nhãn-trạng-thái-hiện-thực)).

## PHẦN ĐẦU BÁO CÁO — ~7 trang · [TH-004](tasks/TH-004.md)

- Trang bìa.
- Trang bìa phụ.
- Lời cảm ơn.
- Mục lục.
- Danh mục các từ viết tắt.
- Danh mục bảng biểu.
- Danh mục hình ảnh.

## MỞ ĐẦU — ~2 trang · [TH-004](tasks/TH-004.md)

1. Lý do chọn đề tài.
2. Mục tiêu của đề tài.
3. Đối tượng và phạm vi nghiên cứu.
4. Phương pháp nghiên cứu.
5. Cấu trúc báo cáo.

## CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI VÀ CƠ SỞ LÝ THUYẾT — ~12 trang

**1.1. Tổng quan bài toán** · [TH-005](tasks/TH-005.md)
- 1.1.1. Thực trạng khai thác thông tin từ tài liệu nội bộ.
- 1.1.2. Những hạn chế của phương pháp tra cứu truyền thống.
- 1.1.3. Nhu cầu ứng dụng trợ lý trí tuệ nhân tạo.

**1.2. Khảo sát các hệ thống và giải pháp liên quan** · [TH-005](tasks/TH-005.md)
- 1.2.1. Các hệ thống trợ lý AI hiện nay.
- 1.2.2. Các giải pháp hỏi đáp dựa trên tài liệu.
- 1.2.3. So sánh và định hướng xây dựng CAT_GPT.

**1.3. Tổng quan về mô hình ngôn ngữ lớn (LLM)** · [TH-005](tasks/TH-005.md)
- 1.3.1. Khái niệm mô hình ngôn ngữ lớn.
- 1.3.2. Nguyên lý hoạt động của mô hình ngôn ngữ lớn.
- 1.3.3. Token và cửa sổ ngữ cảnh.
- 1.3.4. Hạn chế của mô hình ngôn ngữ lớn và hiện tượng ảo giác.

**1.4. Biểu diễn và truy xuất thông tin bằng vector** · [TH-006](tasks/TH-006.md)
- 1.4.1. Biểu diễn văn bản bằng embedding.
- 1.4.2. Phương pháp chia đoạn văn bản (chunking).
- 1.4.3. Độ tương đồng giữa các vector.
- 1.4.4. Cơ sở dữ liệu vector và tìm kiếm ngữ nghĩa.

**1.5. Kiến trúc Retrieval-Augmented Generation (RAG)** · [TH-006](tasks/TH-006.md)
- 1.5.1. Khái niệm và nguyên lý hoạt động.
- 1.5.2. Quy trình tiếp nhận và lập chỉ mục tài liệu.
- 1.5.3. Quy trình truy hồi và sinh câu trả lời.
- 1.5.4. Ưu điểm và hạn chế của RAG.
- 1.5.5. Những thách thức khi áp dụng RAG cho tiếng Việt.

**1.6. Công nghệ và công cụ sử dụng** · [TH-007](tasks/TH-007.md)
- 1.6.1. Ngôn ngữ TypeScript.
- 1.6.2. Công nghệ phát triển giao diện Next.js.
- 1.6.3. Framework phát triển máy chủ NestJS.
- 1.6.4. Hệ quản trị cơ sở dữ liệu và lưu trữ.
- 1.6.5. Công nghệ xử lý tác vụ bất đồng bộ.
- 1.6.6. Công nghệ tích hợp mô hình AI.
- 1.6.7. Công nghệ đóng gói và triển khai hệ thống.

**1.7. Kết luận chương** · [TH-007](tasks/TH-007.md)

## CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG — ~22 trang

**2.1. Phát biểu bài toán** · [TH-008](tasks/TH-008.md)
- 2.1.1. Mô tả bài toán.
- 2.1.2. Mục tiêu xây dựng hệ thống.
- 2.1.3. Phạm vi và giới hạn của hệ thống.

**2.2. Phân tích yêu cầu hệ thống** · [TH-008](tasks/TH-008.md)
- 2.2.1. Xác định các tác nhân.
- 2.2.2. Yêu cầu chức năng.
- 2.2.3. Yêu cầu phi chức năng.
- 2.2.4. Phân quyền và phạm vi truy cập dữ liệu.

**2.3. Phân tích biểu đồ ca sử dụng (Use Case)** · [TH-009](tasks/TH-009.md)
- 2.3.1. Biểu đồ Use Case tổng quát.
- 2.3.2. Use Case xác thực và quản lý người dùng.
- 2.3.3. Use Case trợ lý hội thoại.
- 2.3.4. Use Case quản lý tài liệu.
- 2.3.5. Use Case khai thác tài liệu bằng AI.
- 2.3.6. Đặc tả các Use Case tiêu biểu.

**2.4. Phân tích các luồng xử lý nghiệp vụ** · [TH-010](tasks/TH-010.md)
- 2.4.1. Luồng xác thực người dùng.
- 2.4.2. Luồng gửi và nhận tin nhắn AI.
- 2.4.3. Luồng tải lên và xử lý tài liệu.
- 2.4.4. Luồng hỏi đáp dựa trên tài liệu.
- 2.4.5. Luồng tóm tắt tài liệu.

**2.5. Thiết kế kiến trúc hệ thống** · [TH-011](tasks/TH-011.md)
- 2.5.1. Kiến trúc tổng thể.
- 2.5.2. Kiến trúc ứng dụng phía người dùng.
- 2.5.3. Kiến trúc ứng dụng phía máy chủ.
- 2.5.4. Thiết kế các module và mối quan hệ.
- 2.5.5. Thiết kế giao tiếp giữa các thành phần.

**2.6. Thiết kế cơ sở dữ liệu và lưu trữ** · [TH-011](tasks/TH-011.md)
- 2.6.1. Mô hình dữ liệu tổng thể.
- 2.6.2. Thiết kế dữ liệu người dùng và phiên đăng nhập.
- 2.6.3. Thiết kế dữ liệu hội thoại và tin nhắn.
- 2.6.4. Thiết kế dữ liệu tài liệu.
- 2.6.5. Thiết kế lưu trữ vector.
- 2.6.6. Thiết kế lưu trữ tệp.

**2.7. Thiết kế hệ thống khai thác tài liệu bằng RAG** · [TH-012](tasks/TH-012.md)
- 2.7.1. Kiến trúc phân hệ RAG.
- 2.7.2. Thiết kế đường ống xử lý tài liệu.
- 2.7.3. Thiết kế cơ chế truy hồi thông tin.
- 2.7.4. Thiết kế cơ chế xây dựng ngữ cảnh và sinh câu trả lời.
- 2.7.5. Thiết kế cơ chế trích dẫn nguồn.
- 2.7.6. Thiết kế cơ chế kiểm soát phạm vi truy xuất.

**2.8. Thiết kế bảo mật hệ thống** · [TH-013](tasks/TH-013.md)
- 2.8.1. Cơ chế xác thực và quản lý phiên.
- 2.8.2. Cơ chế phân quyền người dùng.
- 2.8.3. Kiểm soát truy cập tài liệu và hội thoại.

**2.9. Thiết kế triển khai hệ thống** · [TH-013](tasks/TH-013.md)

**2.10. Kết luận chương** · [TH-013](tasks/TH-013.md)

## CHƯƠNG 3. XÂY DỰNG HỆ THỐNG CAT_GPT — ~18 trang

**3.1. Môi trường phát triển và tổ chức mã nguồn** · [TH-014](tasks/TH-014.md)
- 3.1.1. Môi trường và công cụ phát triển.
- 3.1.2. Cấu trúc mã nguồn dự án.
- 3.1.3. Tổ chức các thành phần và thư viện dùng chung.

**3.2. Xây dựng module xác thực và quản lý người dùng** · [TH-014](tasks/TH-014.md)
- 3.2.1. Chức năng đăng nhập và đăng xuất.
- 3.2.2. Chức năng quản lý thông tin cá nhân.
- 3.2.3. Chức năng quản lý phiên đăng nhập.
- 3.2.4. Chức năng quản trị và phân quyền người dùng.

**3.3. Xây dựng module trợ lý hội thoại** · [TH-015](tasks/TH-015.md)
- 3.3.1. Tích hợp mô hình ngôn ngữ lớn.
- 3.3.2. Quản lý cuộc hội thoại và lịch sử tin nhắn.
- 3.3.3. Xử lý phản hồi theo thời gian thực (streaming).
- 3.3.4. Hiển thị và tương tác với câu trả lời AI.

**3.4. Xây dựng module quản lý tài liệu** · [TH-016](tasks/TH-016.md)
- 3.4.1. Tải lên và lưu trữ tài liệu.
- 3.4.2. Quản lý thông tin và trạng thái tài liệu.
- 3.4.3. Xử lý tài liệu bất đồng bộ.
- 3.4.4. Trích xuất, chia đoạn và vector hóa văn bản.

**3.5. Xây dựng module khai thác tài liệu bằng AI** · [TH-017](tasks/TH-017.md)
- 3.5.1. Hiện thực quy trình truy hồi thông tin.
- 3.5.2. Chức năng hỏi đáp dựa trên tài liệu.
- 3.5.3. Chức năng trích dẫn nguồn.
- 3.5.4. Chức năng lựa chọn phạm vi tài liệu.
- 3.5.5. Chức năng tóm tắt tài liệu.
- 3.5.6. Xử lý trường hợp không đủ thông tin trả lời.

**3.6. Đóng gói và triển khai ứng dụng** · [TH-017](tasks/TH-017.md)
- 3.6.1. Cấu hình môi trường triển khai.
- 3.6.2. Đóng gói các dịch vụ.
- 3.6.3. Kết quả triển khai và vận hành.

**3.7. Kết luận chương** · [TH-017](tasks/TH-017.md)

## CHƯƠNG 4. KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG — ~10 trang

**4.1. Mục tiêu và phương pháp kiểm thử** · [TH-018](tasks/TH-018.md)
- 4.1.1. Mục tiêu kiểm thử.
- 4.1.2. Môi trường kiểm thử.
- 4.1.3. Phương pháp và phạm vi kiểm thử.

**4.2. Kiểm thử chức năng** · [TH-018](tasks/TH-018.md)
- 4.2.1. Kiểm thử module xác thực và quản lý người dùng.
- 4.2.2. Kiểm thử module trợ lý hội thoại.
- 4.2.3. Kiểm thử module quản lý tài liệu.
- 4.2.4. Kiểm thử module khai thác tài liệu bằng AI.

**4.3. Kiểm thử bảo mật và phân quyền** · [TH-019](tasks/TH-019.md)
- 4.3.1. Kiểm thử xác thực và phiên đăng nhập.
- 4.3.2. Kiểm thử quyền truy cập chức năng.
- 4.3.3. Kiểm thử cách ly dữ liệu giữa người dùng.

**4.4. Thực nghiệm và đánh giá hệ thống RAG** · [TH-020](tasks/TH-020.md)
- 4.4.1. Xây dựng bộ dữ liệu và câu hỏi thực nghiệm tiếng Việt.
- 4.4.2. Xác định phương pháp và tiêu chí đánh giá.
- 4.4.3. Đánh giá chất lượng truy hồi thông tin.
- 4.4.4. Đánh giá chất lượng câu trả lời và trích dẫn nguồn.
- 4.4.5. So sánh kết quả giữa các mô hình embedding.
- 4.4.6. Phân tích kết quả thực nghiệm.

**4.5. Đánh giá kết quả đạt được** · [TH-021](tasks/TH-021.md)
- 4.5.1. Mức độ đáp ứng yêu cầu của đề tài.
- 4.5.2. Ưu điểm của hệ thống.
- 4.5.3. Những hạn chế còn tồn tại.

**4.6. Kết luận chương** · [TH-021](tasks/TH-021.md)

## KẾT LUẬN VÀ KIẾN NGHỊ — ~2 trang · [TH-022](tasks/TH-022.md)

1. Kết quả đạt được.
2. Hạn chế của đề tài.
3. Hướng phát triển.

## DANH MỤC TÀI LIỆU THAM KHẢO — ~2 trang · [TH-022](tasks/TH-022.md)

## PHỤ LỤC — nếu cần, không tính vào 75 trang · [TH-022](tasks/TH-022.md)

- Đặc tả API chi tiết.
- Bảng kiểm thử đầy đủ.
- Hướng dẫn cài đặt và sử dụng.
- Cấu hình triển khai.
- Nội dung kỹ thuật bổ sung.

## Phân bổ trang theo task

| Phần | Trang | Task (trang) |
|---|---|---|
| Phần đầu | 7 | TH-004 (7) |
| Mở đầu | 2 | TH-004 (2) |
| Chương 1 | 12 | TH-005 (5) · TH-006 (4,5) · TH-007 (2,5) |
| Chương 2 | 22 | TH-008 (4) · TH-009 (4) · TH-010 (4) · TH-011 (5) · TH-012 (3) · TH-013 (2) |
| Chương 3 | 18 | TH-014 (4,5) · TH-015 (4) · TH-016 (4) · TH-017 (5,5) |
| Chương 4 | 10 | TH-018 (3,5) · TH-019 (1,5) · TH-020 (3,5) · TH-021 (1,5) |
| Kết luận và kiến nghị | 2 | TH-022 (2) |
| Tài liệu tham khảo | 2 | TH-022 (2) |
| **Tổng** | **75** | Phụ lục ngoài tổng |

Mức trang từng task là định hướng; lệch quá ±25 % chỉ là ngưỡng cảnh báo để review (TC-W7), ưu tiên chất lượng hơn số trang. Nếu tổng dự kiến có nguy cơ ra ngoài khoảng 60–80 trang thì báo trong báo cáo thực hiện để Project Owner điều chỉnh; không tự cắt hoặc thêm mục.
