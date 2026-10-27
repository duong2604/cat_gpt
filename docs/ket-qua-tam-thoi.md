# Kết quả tạm thời — Module 2 (thật) + Demo giao diện Module 3, 4

> Ngày: 27/10/2026 · Nhánh: `preview/module-2-4-demo` (không tạo PR vào `develop`)
> Trạng thái: **chờ sinh viên đánh giá**. Sau khi duyệt mới quyết định gộp vào `develop` hay lập kế hoạch làm lại bản go-live.

## 1. Tóm tắt

| Phần | Mức độ | Ghi chú |
|---|---|---|
| Module 2 – Trợ lý hội thoại | **Chạy thật** (backend + frontend, lưu MongoDB) | LLM là bản giả lập (`MockLlmProvider`), chưa nối mô hình thật |
| Module 3 – Quản lý tài liệu | **Chỉ giao diện**, dữ liệu minh họa | Không có API, dữ liệu nằm trong trình duyệt, F5 là mất |
| Module 4 – Hỏi–đáp / tóm tắt tài liệu | **Chỉ giao diện**, dữ liệu minh họa | Câu trả lời soạn sẵn, ghép theo từ khóa |

## 2. Module 2 — đã làm

**Backend** (`apps/api/src/modules/chat`, `apps/api/src/modules/llm`)
- API hội thoại:
  - `GET /conversations`: danh sách, phân trang con trỏ, tìm kiếm.
  - `GET/PATCH/DELETE /conversations/:id`.
  - `GET /conversations/:id/messages`.
- Streaming SSE qua `POST /chat/stream`:
  - Thứ tự sự kiện `meta` → `delta` → `done`, có heartbeat 15 giây.
  - Có `regenerate` và `stop`.
- Tự đặt tiêu đề hội thoại từ 50 ký tự đầu của câu hỏi.
- Ngữ cảnh gửi cho LLM gồm system prompt và 20 tin nhắn gần nhất.
- Câu trả lời được lưu một lần khi xong, có trạng thái COMPLETED / STOPPED / ERROR. Nếu người dùng ngắt kết nối giữa chừng, phần đã trả lời vẫn được lưu.
- Giới hạn 20 tin nhắn/phút mỗi người dùng.
- Mỗi hội thoại chỉ chạy một stream tại một thời điểm.
- `LlmProvider` là lớp trừu tượng. Khi có LLM thật, chỉ cần thêm provider mới.

**Frontend** (`apps/web/src/features/chat`)
- Màn hình chào có câu hỏi gợi ý.
- Hiển thị dần câu trả lời, nút dừng, tạo lại, sao chép.
- Markdown hỗ trợ bảng (GFM) và tô màu code.
- Danh sách hội thoại nhóm theo thời gian, có tìm kiếm, cuộn để tải thêm, đổi tên, xóa.
- Mobile: danh sách hội thoại mở dạng Sheet. Hỗ trợ vi/en, dark mode.

**Kiểm thử**
- Kịch bản API đầu–cuối với Atlas thật đã đạt. Kịch bản bao gồm:
  - Stream, lịch sử, dừng, tạo lại, lỗi.
  - Validate, 404, đổi tên, tìm kiếm, phân trang, xóa, 429.
- Ngắt kết nối giữa chừng: câu trả lời được lưu ở trạng thái STOPPED.
- Duyệt UI 14 bước bằng trình duyệt headless: đạt.
- `typecheck` và `lint` cho api và web: đạt.

## 3. Demo Module 3 — Quản lý tài liệu (`/documents`)

- 8 tài liệu mẫu và thống kê tổng / sẵn sàng / đang xử lý / lỗi. Có tìm kiếm và lọc theo trạng thái.
- Tải lên bằng kéo thả:
  - Chỉ nhận PDF, DOCX, TXT, tối đa 20MB mỗi tệp.
  - Sau khi tải lên, pipeline giả chạy 4 bước: bóc tách → chia đoạn → sinh vector → lưu chỉ mục.
  - Tệp có chữ "scan" trong tên sẽ lỗi ở bước bóc tách, để minh họa PDF dạng ảnh.
- Trang chi tiết tài liệu hiển thị tiến trình xử lý.
- Mã nguồn: `apps/web/src/features/documents/`. Dữ liệu nằm ở `fake-data.ts`.

## 4. Demo Module 4 — Hỏi–đáp và tóm tắt (`/ask`, menu tài liệu)

- Hiện lần lượt các bước RAG: tìm kiếm → tìm thấy N đoạn từ M tài liệu → tổng hợp câu trả lời.
- Câu trả lời có trích dẫn `[n]`. Bấm vào sẽ tới thẻ nguồn, ghi tài liệu, trang, đoạn trích và độ liên quan.
- Câu hỏi không có trong tài liệu, hoặc nằm ngoài phạm vi đã chọn, được trả lời "không tìm thấy thông tin".
- Có thể chọn phạm vi tra cứu là những tài liệu nào.
- Từ màn hình Tài liệu:
  - "Tóm tắt bằng AI": hai chế độ ngắn gọn / chi tiết.
  - "Hỏi đáp tài liệu này": mở `/ask?docs=<id>`.
- 7 chủ đề hỏi được: làm việc từ xa, nghỉ phép, mua sắm thiết bị, VPN, nhân viên mới, bảo mật, họp giao ban.
- Mã nguồn: `apps/web/src/features/ask/`. Dữ liệu nằm ở `fake-knowledge.ts`. Khi làm bản thật, thay file này bằng API.

**Kịch bản demo gợi ý:**
1. Bấm câu gợi ý "làm việc từ xa", rồi bấm số trích dẫn để xem nguồn.
2. Hỏi "Công ty có chính sách hỗ trợ gửi xe không?" để thấy hệ thống từ chối trả lời.
3. Thu hẹp phạm vi xuống còn 1 tài liệu, hỏi về nghỉ phép: hệ thống trả lời không tìm thấy.
4. Vào Tài liệu, chọn "Tóm tắt bằng AI", rồi "Hỏi đáp tài liệu này".

Duyệt UI 8 bước bằng trình duyệt headless: đạt.

## 5. Giới hạn đã biết

- Câu trả lời ở Module 2 là văn bản mẫu từ LLM giả lập. Gõ `/error` vào câu hỏi để thử luồng lỗi.
- Bộ đếm giới hạn tần suất và danh sách stream đang chạy nằm trong bộ nhớ. Khi chạy nhiều instance cần chuyển sang Redis.
- Demo 3/4:
  - Tài liệu tải lên trong lúc demo không hỏi–đáp được và chỉ có bản tóm tắt chung chung.
  - Nội dung câu trả lời luôn là tiếng Việt, kể cả khi đổi giao diện sang tiếng Anh.

## 6. Việc chờ quyết định

- [ ] Đánh giá bản demo Module 3 và Module 4 (luồng sử dụng, bố cục).
- [ ] Module 2: gộp vào `develop` hay chỉnh sửa thêm.
- [ ] Chọn LLM thật (nhà cung cấp, mô hình) cho Module 2 và 4.
- [ ] Lập kế hoạch chi tiết bản go-live cho Module 3 (MinIO, Redis queue, Qdrant) và Module 4.
