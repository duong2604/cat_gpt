# SE-015 — Module 4, giao diện: hỏi tài liệu và hiển thị trích dẫn

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 2 ngày làm việc
Phụ thuộc: [TL-008](TL-008-module-4-design.md) duyệt (chặn); [SE-014](SE-014-rag-qa-backend.md) merge (chặn); [SE-012](SE-012-documents-txt-frontend.md) merge (trang Tài liệu)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: — (chờ TL-008 duyệt)
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link>

## Mục tiêu
Từ trang Tài liệu (nút "Hỏi tài liệu", chọn sẵn tài liệu đó — Q-M4-1, CTO chốt 17/11/2026), người dùng chọn tài liệu `READY`, hỏi và thấy câu trả lời hiện dần kèm nhãn trích dẫn bấm được để xem đoạn nguồn; thấy rõ khi tài liệu không đủ căn cứ.

## Phạm vi (sơ bộ — chốt theo TL-008)
- Làm: nút "Hỏi tài liệu" ở trang Tài liệu → hộp thoại chọn tài liệu (chọn sẵn tài liệu đó, tối đa 5) → tạo hội thoại; dùng lại khung Chat (SSE, Dừng, Tạo lại); nhãn trích dẫn → xem đoạn nguồn; hiển thị câu từ chối và cảnh báo `ungrounded`; vi/en; desktop + 375 px.
- Không làm: lối vào từ màn tạo hội thoại Chat (Q-M4-1); tóm tắt (SE-016); xem trước toàn văn tài liệu; thêm/bớt tài liệu sau khi tạo hội thoại (Q-M4-3).

## Checklist nghiệm thu (sơ bộ)
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Luồng chính: chọn tài liệu → hỏi → câu trả lời hiện dần → bấm trích dẫn thấy đúng đoạn nguồn | GIF |
| AC2 | Câu hỏi ngoài tài liệu → thông báo thiếu căn cứ, không có nhãn nguồn | Ảnh |
| AC3 | Chỉ liệt kê tài liệu `READY` của chính người dùng | Ảnh 2 tài khoản |
| AC4 | Trạng thái trống/tải/lỗi; desktop + 375 px; sáng/tối; vi/en; chế độ `staff` theo bảng tính năng | Ảnh |
| AC5 | Checklist hai vai; CI xanh | Bàn giao 6.1 |

## Kết quả review
Chưa có.

## Lịch sử review

## Phản hồi UI
Chưa có.
