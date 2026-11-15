# Đề cương đồ án tốt nghiệp — bản chép

> **Bản chép để agent và người viết báo cáo tham chiếu.** Chép nguyên văn nội dung file gốc, chỉ **lược thông tin liên lạc** (số điện thoại, email của sinh viên và giảng viên hướng dẫn) vì repo đang công khai. Dấu `•` và cách xuống dòng được chuẩn hóa sang Markdown; câu chữ giữ nguyên.
>
> | Mục | Giá trị |
> |---|---|
> | File gốc (khách hàng chỉ định 15/11/2026) | `D:\workspace\5250026_BuiVanDuong_LT_CNTT1_K29.1_Decuong DATN.docx` |
> | Bản sao gốc trên máy (không commit) | `docs/thesis/sources/originals/` (chỉ trên máy) — xem [README nguồn](README.md) |
> | MD5 | `cf7b9248aff07b155bf2cee1f19798ba` |
> | Thuộc tính file | Tạo 30/09/2026 11:09, sửa lần cuối 30/09/2026 18:53 (giờ VN), 4 trang, Microsoft Word |
> | Căn cứ phê duyệt | **Không có trong file**: 4 ô ký (Trưởng Khoa, Trưởng Bộ môn, GVHD, sinh viên) để trống; không có chữ ký số, nhận xét hay dấu phê duyệt. `CẦN BỔ SUNG` — sinh viên cung cấp căn cứ phê duyệt (bản ký hoặc xác nhận của GVHD/Khoa) |
> | Khác bản 09/09/2026 (OneDrive) | Tên đề tài **bỏ** cụm "sử dụng mô hình ngôn ngữ lớn (LLM)"; ghi chú "Trọng tâm" cho dòng 3–6 của kế hoạch; dòng 8 "đóng gói và kiểm thử" (bỏ chữ "Docker"); Module 5 ghi "Ngoài phạm vi cam kết". Bản này là **nguồn chuẩn** cho bộ tài liệu |

---

TRƯỜNG ĐẠI HỌC GTVT · KHOA CÔNG NGHỆ THÔNG TIN
CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM — Độc lập - Tự do - Hạnh phúc

Hà Nội, ngày 09 tháng 09 năm 2026

## ĐỀ CƯƠNG ĐỒ ÁN TỐT NGHIỆP

- Họ và tên sinh viên: Bùi Văn Dương
- Mã SV: 5250026 · Lớp: CNTT1 · Khóa: K29.1
- Số điện thoại / Email: *[đã lược — thông tin liên lạc]*
- Ngành: Công nghệ thông tin · Hệ: Liên thông
- Giảng viên (cán bộ) hướng dẫn: ThS. Bùi Minh Thảo
- Đơn vị công tác: Bộ môn KHMT và Trí tuệ nhân tạo, Khoa Công nghệ thông tin
- Số điện thoại / Email: *[đã lược — thông tin liên lạc]*

**Tên đề tài:** Xây dựng hệ thống trợ lý AI nội bộ hỗ trợ hội thoại và khai thác thông tin từ tài liệu CAT GPT.

### Nội dung, phạm vi của đề tài

Đề tài xây dựng một nền tảng trợ lý AI nội bộ cho phép nhân viên tương tác với mô hình ngôn ngữ lớn (LLM), quản lý tài liệu cá nhân/nội bộ, tự động tóm tắt và hỏi–đáp dựa trên nội dung tài liệu theo kiến trúc RAG (Retrieval-Augmented Generation). Hệ thống hướng tới việc rút ngắn thời gian tra cứu, khai thác tri thức từ kho tài liệu nội bộ và bảo đảm dữ liệu được xử lý trong phạm vi kiểm soát của tổ chức.

Phạm vi thực hiện – 04 module chính:
- Module 1 – Xác thực & Quản lý người dùng: đăng nhập/đăng xuất, thông tin cá nhân, đổi mật khẩu, quản lý phiên (session); quản trị viên quản lý tài khoản, khóa/mở khóa và phân quyền người dùng.
- Module 2 – Trợ lý hội thoại (AI Chat): tạo và quản lý cuộc hội thoại (đổi tên, xóa), gửi/nhận tin nhắn, phản hồi theo thời gian thực (streaming), lưu trữ lịch sử trò chuyện.
- Module 3 – Quản lý tài liệu: tải lên/tải xuống, xem thông tin (metadata), tìm kiếm, xóa và theo dõi trạng thái xử lý; đường ống xử lý bất đồng bộ gồm bóc tách văn bản → chia đoạn (chunking) → sinh vector (embedding) → lưu vào cơ sở dữ liệu vector.
- Module 4 – Khai thác tài liệu bằng AI (RAG): tóm tắt tài liệu và hỏi–đáp dựa trên nội dung tài liệu kèm trích dẫn nguồn nhằm hạn chế hiện tượng "ảo giác" (hallucination). Đây là module trọng tâm và được tối ưu cho tiếng Việt.

Hướng phát triển (ngoài phạm vi cam kết):
- Module 5 – Dịch tài liệu đa ngôn ngữ, tiến tới giữ nguyên định dạng gốc (ưu tiên DOCX/TXT; giữ định dạng PDF là hướng nghiên cứu mở rộng).

Giới hạn phạm vi:
- Hỗ trợ các định dạng văn bản phổ biến (PDF dạng text, DOCX, TXT); chưa xử lý OCR cho tài liệu ảnh/scan trong phạm vi cam kết. Sản phẩm ở mức nguyên mẫu (prototype) phục vụ minh họa và đánh giá, chưa triển khai ở quy mô sản xuất lớn.

### Công nghệ, công cụ và ngôn ngữ lập trình

Hệ thống được xây dựng theo kiến trúc web hiện đại, đóng gói bằng Docker để thuận tiện triển khai nội bộ (on-premise):
- Ngôn ngữ lập trình: TypeScript.
- Giao diện (Frontend): Next.js (React).
- Máy chủ (Backend): NestJS (Node.js).
- Cơ sở dữ liệu: MongoDB.
- Hàng đợi & bộ nhớ đệm: Redis kết hợp BullMQ (xử lý tác vụ bất đồng bộ).
- Lưu trữ tệp: MinIO (object storage).
- Cơ sở dữ liệu vector: Qdrant.
- Trí tuệ nhân tạo: mô hình ngôn ngữ lớn (LLM) qua API hoặc chạy nội bộ bằng Ollama; mô hình embedding đa ngữ (ví dụ bge-m3 / multilingual-e5 / text-embedding-3) hỗ trợ tốt tiếng Việt.
- Thư viện hỗ trợ RAG: LangChain hoặc LlamaIndex.
- Xác thực & giao tiếp: JWT, REST API, SSE (truyền phản hồi dạng streaming).
- Triển khai & vận hành: Docker, Docker Compose, Nginx (reverse proxy).
- Công cụ phát triển: Git, Visual Studio Code, Postman.

### Các kết quả chính dự kiến đạt được

- Một hệ thống web hoàn chỉnh gồm 04 module (1–4) hoạt động ổn định, có giao diện người dùng trực quan.
- Chức năng trợ lý hội thoại với phản hồi theo thời gian thực (streaming).
- Chức năng quản lý tài liệu kèm đường ống sinh vector (embedding) tự động.
- Chức năng tóm tắt và hỏi–đáp tài liệu theo kiến trúc RAG, có trích dẫn nguồn và được tối ưu cho tiếng Việt.
- Một khung đánh giá (evaluation): bộ câu hỏi–đáp tiếng Việt mẫu cùng các chỉ số đo độ chính xác truy hồi và chất lượng câu trả lời; có so sánh giữa một số mô hình embedding.
- Kiến trúc triển khai bằng Docker, có khả năng vận hành nội bộ (on-premise).
- Sản phẩm bàn giao: mã nguồn, tài liệu hướng dẫn cài đặt/sử dụng và báo cáo đồ án tốt nghiệp.

### Kế hoạch thực hiện đề tài

| STT | Nội dung công việc | Thời gian dự kiến | Ghi chú |
|---|---|---|---|
| 1 | Nghiên cứu tổng quan (LLM, RAG, embedding, cơ sở dữ liệu vector) và khảo sát công nghệ | 21/09/2026-26/09/2026 | |
| 2 | Phân tích yêu cầu, thiết kế kiến trúc hệ thống, cơ sở dữ liệu và API | 27/09/2026-03/10/2026 | |
| 3 | Module 1: Xác thực & quản lý người dùng | 04/10/2026-18/10/2026 | Trọng tâm |
| 4 | Module 2: Trợ lý hội thoại (AI Chat) + streaming | 19/10/2026-01/11/2026 | Trọng tâm |
| 5 | Module 3: Quản lý tài liệu + đường ống xử lý bất đồng bộ | 02/11/2026-15/11/2026 | Trọng tâm |
| 6 | Module 4: RAG – embedding, truy hồi, hỏi–đáp, tóm tắt tài liệu | 16/11/2026–29/11/2026 | Trọng tâm |
| 7 | Tối ưu RAG cho tiếng Việt; xây dựng khung đánh giá và đo kết quả | 30/11/2026-06/12/2026 | Tối ưu |
| 8 | Tích hợp, hoàn thiện giao diện, đóng gói và kiểm thử | 07/12/2026-13/12/2026 | Tối ưu |
| 9 | (Mở rộng) Module 5: Dịch tài liệu | 14/12/2026-31/12/2026 | Ngoài phạm vi cam kết |
| 10 | Viết báo cáo và chuẩn bị bảo vệ | 04/10/2026-31/12/2026 | Thực hiện song song |

| Trưởng Khoa | Trưởng Bộ môn | Giảng viên hướng dẫn | Sinh viên thực hiện |
|---|---|---|---|
| (Ký và ghi rõ họ tên) — *trống trong file* | (Ký và ghi rõ họ tên) — *trống* | (Ký và ghi rõ họ tên) — *trống* | (Ký và ghi rõ họ tên) — *trống* |
