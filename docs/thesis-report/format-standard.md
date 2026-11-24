# Quy định trình bày và tiêu chuẩn chất lượng

Phân biệt hai loại:
- **[TRƯỜNG]** — quy định bắt buộc trong PDF *Quy định và hướng dẫn trình bày ĐATN* của Khoa CNTT ([SRC-001](source-register.md#1-nguồn-đầu-vào)). Bản chép theo trang, mã Q1–Q15: [docs/thesis/01 mục 8](../thesis/01-outline-and-sources.md#8-quy-định-trình-bày-của-khoa-áp-dụng-khi-dựng-word). Thesis Agent chưa tự đọc PDF gốc; TH-003 đối chiếu lại trước khi dựng style.
- **[DỰ ÁN]** — quy ước bổ sung do Project Owner duyệt hoặc đề xuất; **không phải** quy định của trường.

## 1. Trang giấy, văn bản, heading — [TRƯỜNG]

| Hạng mục | Quy định | Mã |
|---|---|---|
| Khổ giấy | A4, 210 × 297 mm | Q3 |
| Lề | Trên 2,5 cm · Dưới 2,5 cm · Trái 3 cm · Phải 2 cm | Q3 |
| Số trang | Chính giữa, phía trên đầu trang | Q3 |
| Chương | Mỗi chương bắt đầu trang mới | Q4 |
| Normal | Times New Roman (Unicode) 13 pt · căn đều hai bên · thụt dòng đầu 1 cm · giãn dòng 1,2 lines · mọi đoạn văn dùng cùng một style | Q7 |
| Heading 1 | TNR 18 pt, đậm, căn giữa, Before 0 pt, After 12 pt, đánh số theo chương | Q4 |
| Heading 2 | TNR 16 pt, đậm, căn trái, không thụt, Before/After 6 pt, số dạng 1.1, 2.1 | Q5 |
| Heading 3 | TNR 14 pt, đậm, căn trái, không thụt, Before/After 6 pt, số dạng 1.1.1; **chỉ chia tiểu mục khi có hơn một tiểu mục** | Q6 |
| Bìa, bìa phụ | Theo mẫu chính thức của trường (PDF tr. 4–5) | Q15 |

## 2. Bảng, hình, phương trình, danh mục — [TRƯỜNG]

- Đánh số theo chương: Hình 2.1, Bảng 2.1, phương trình (2.1) (Q8).
- Tên bảng **phía trên** bảng; tên hình **phía dưới** hình; đặt gần đoạn nhắc tới lần đầu (Q9).
- Hình/bảng lấy từ nguồn ngoài ghi "Nguồn: …", nguồn đó có trong danh mục tài liệu tham khảo (Q10).
- Hình thiết kế vẽ bằng phần mềm thiết kế, **nộp kèm file nguồn**; cấm dùng hình thiết kế sao chép từ tài liệu khác (Q12).
- Mục lục bắt buộc; danh mục từ viết tắt xếp ABC, danh mục bảng, danh mục hình (Q1, Q13).
- Viết tắt: chỉ cho thuật ngữ dùng nhiều lần; lần đầu viết đầy đủ kèm viết tắt trong ngoặc (Q13).
- Danh mục tài liệu tham khảo chỉ chứa nguồn thực sự được trích dẫn/sử dụng (Q11).
- Phụ lục: nội dung minh họa, bổ sung (Q14).

## 3. Quy ước dự án — [DỰ ÁN]

| Quy ước | Nội dung | Căn cứ |
|---|---|---|
| Trích dẫn | IEEE dạng số [1], [2], … theo thứ tự xuất hiện; danh mục TLTK định dạng IEEE. **Không phải quy định bắt buộc của trường** (bản chép PDF không quy định kiểu trích dẫn) | [DEC-010](decisions.md#quyết-định-đã-phê-duyệt) |
| Mục lục, danh mục | Sinh tự động bằng field Word (TOC, Table of Figures); caption dùng tính năng Caption có số chương | DEC-005, DEC-006 |
| Sơ đồ | Tự xây dựng; file nguồn chỉnh sửa được lưu `docs/thesis-report/diagrams/`, ảnh xuất rõ nét lưu local. Công cụ chính thức chốt trước TH-009 ([OPEN-007](decisions.md#vấn-đề-còn-mở)); ứng viên: PlantUML / Mermaid / draw.io | [DEC-018](decisions.md#quyết-định-đã-phê-duyệt) |
| Ảnh giao diện | Chụp từ hệ thống thật tại Report Baseline; không chứa khóa API, mật khẩu, dữ liệu cá nhân thật; không tạo ảnh giả cho chức năng chưa xong | Chỉ thị V1.0 mục 13 |
| Mã nguồn trong bài | Chỉ trích đoạn ngắn khi cần minh họa; định dạng chốt ở TH-003 | [OPEN-004](decisions.md#vấn-đề-còn-mở) |
| Thuật ngữ | Thuật ngữ tiếng Anh phổ biến giữ nguyên, lần đầu kèm giải thích tiếng Việt | — |

Chưa xác định — đối chiếu PDF gốc và chốt ở **TH-003**: cách đánh số trang phần đầu (La Mã hay Ả Rập, trang nào không đánh số), định dạng chi tiết bìa, style caption (cỡ chữ, căn lề), style bảng và đoạn mã ([OPEN-004](decisions.md#vấn-đề-còn-mở)).

## 4. Nhãn trạng thái hiện thực

Mọi mô tả chức năng trong báo cáo và trong báo cáo audit phải gắn được một nhãn:

| Nhãn | Nghĩa | Cách viết trong báo cáo |
|---|---|---|
| `VERIFIED_IMPLEMENTED` | Có code tại Report Baseline và có minh chứng kiểm thử | Mô tả như đã hiện thực, dẫn kiểm thử ở Chương 4 |
| `IMPLEMENTED_UNVERIFIED` | Có code, chưa đủ minh chứng | Mô tả hiện thực, nói rõ mức kiểm thử còn hạn chế |
| `MOCK_ONLY` | Chỉ dữ liệu/phản hồi giả lập | Không trình bày như chức năng thật; nói rõ là giả lập |
| `IN_PROGRESS` | Đang phát triển | Không mô tả như kết quả |
| `DESIGN_ONLY` | Mới có thiết kế | Chỉ ở Chương 2 hoặc hướng phát triển |
| `NOT_IMPLEMENTED` | Chưa triển khai | Hạn chế / hướng phát triển |
| `OUT_OF_SCOPE` | Ngoài phạm vi | Chỉ nhắc ở phạm vi và hướng phát triển |

## 5. Tiêu chuẩn nội dung

- Tiếng Việt học thuật, tự nhiên, mạch lạc; thuật ngữ chính xác; không quảng cáo; không viết dài để tăng trang; không biến phần công nghệ thành hướng dẫn cài đặt.
- Vai trò chương: Ch.1 lý thuyết và lý do chọn giải pháp · Ch.2 yêu cầu và thiết kế · Ch.3 quá trình hiện thực và sản phẩm · Ch.4 chứng minh bằng kiểm thử, thực nghiệm. Hạn chế lặp nội dung giữa các chương.
- Không biến kế hoạch, mock hoặc giao diện demo thành kết quả thật. Không tạo số liệu kiểm thử, kết quả thực nghiệm, độ chính xác, hiệu năng giả. Không tạo tài liệu tham khảo, DOI, URL không tồn tại.
- Chỗ chưa có nguồn: để `[CẦN BỔ SUNG: <mã> — <nội dung>]` trong Word và ghi vào báo cáo thực hiện; không tự điền.
- Thông tin cá nhân đầy đủ trên bìa chỉ nằm trong file Word local.

## 6. Sơ đồ dự kiến

Use Case · Sequence · Activity · System Architecture · Data Model · RAG Pipeline · Deployment. Số lượng theo thiết kế thực tế và giới hạn trang; mỗi sơ đồ phải khớp code/thiết kế tại Report Baseline.
