# Module 2 — Trợ lý hội thoại (AI Chat)

> Trạng thái: 📝 Đang chốt yêu cầu (24/10/2026) · Chưa code
> Phạm vi theo đề cương: tạo và quản lý cuộc hội thoại (đổi tên, xóa), gửi/nhận tin nhắn, phản hồi theo thời gian thực (streaming), lưu trữ lịch sử trò chuyện.
> Kế hoạch: 19/10 – 01/11/2026 · Nhánh dự kiến: `feature/module-2-chat` (tách từ `develop` sau khi merge Module 1)

## 1. Bối cảnh

Hiện chưa đăng ký hay thiết lập LLM nào. Theo nguyên tắc chung, module này vẫn dựng đầy đủ giao diện và backend, kèm **đầu chờ AI** (mock); việc tích hợp LLM thật làm sau.

## 2. Hướng triển khai đề xuất (chưa xác nhận)

| Phần | Nội dung |
|---|---|
| Backend | Collection `conversations` và `messages`. API tạo, liệt kê, đổi tên, xóa hội thoại; lấy lịch sử tin nhắn; gửi tin nhắn và nhận phản hồi streaming qua **SSE** |
| Đầu chờ AI | Interface `LlmProvider` kèm `MockLlmProvider` trả lời từng chữ có độ trễ. Khi có LLM thật chỉ cần thêm một provider (Ollama / API) và đổi biến môi trường |
| Frontend | Giao diện kiểu ChatGPT: danh sách hội thoại bên trái (nhóm theo thời gian), khung chat, ô nhập; hiển thị chữ chạy dần khi đang stream; nút dừng; đổi tên, xóa hội thoại |

## 3. Câu hỏi đang chờ sinh viên trả lời

| # | Câu hỏi | Gợi ý của Claude |
|---|---|---|
| 1 | Mock trả lời kiểu gì: lặp lại câu hỏi, hay chọn ngẫu nhiên câu trả lời mẫu tiếng Việt có markdown? | Câu trả lời mẫu có markdown (demo đẹp hơn) |
| 2 | Sau này dùng LLM nào: Ollama local hay API (OpenAI / Gemini / Claude…)? | Chưa cần chốt. Thiết kế interface theo định dạng chat chuẩn kiểu OpenAI (Ollama cũng hỗ trợ) |
| 3 | Tính năng thêm ngoài phần bắt buộc | Có: dừng, tạo lại câu trả lời cuối, sao chép, tìm kiếm hội thoại. Để sau: sửa tin nhắn đã gửi |
| 4 | Tiêu đề hội thoại | Lấy khoảng 50 ký tự đầu của tin nhắn đầu tiên; chừa sẵn chỗ để AI tự đặt tên khi có LLM thật |
| 5 | Xóa hội thoại: xóa hẳn hay xóa mềm? | Xóa hẳn cả hội thoại lẫn tin nhắn |
| 6 | Streaming bằng `POST` trả `text/event-stream`, FE đọc bằng `fetch` (riêng endpoint này không dùng axios) | Đồng ý (`EventSource` chỉ hỗ trợ GET; axios không đọc stream tốt trên trình duyệt) |
| 7 | Hiển thị markdown: thêm `react-markdown` + `remark-gfm` + thư viện tô màu code (`shiki` / `rehype-highlight`)? | **Cần xác nhận vì là thư viện mới** |
| 8 | Ngữ cảnh gửi cho AI | 20 tin nhắn gần nhất |
| 9 | Giới hạn | Tin nhắn tối đa 4.000 ký tự; 20 tin nhắn/phút/người |
| 10 | Chọn model và system prompt | System prompt cố định trong `.env`; dropdown chọn model để khi có LLM thật mới làm |
| 11 | Tạo PR Module 1 ngay? | — |

## 4. Quyết định đã chốt

*(Chưa có — sẽ cập nhật sau khi sinh viên trả lời.)*

## 5. Công việc đã thực hiện

- 24/10/2026: Lập kế hoạch và gửi bộ câu hỏi chốt yêu cầu.
