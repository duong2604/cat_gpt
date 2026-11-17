# SE-015 — Module 4, giao diện: hỏi tài liệu và hiển thị trích dẫn

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 2 ngày làm việc
Phụ thuộc (gate): [SE-014](SE-014-rag-qa-backend.md) merge **và** [SE-012](SE-012-documents-txt-frontend.md) merge (cả hai chặn); kiến trúc TL-008 đã duyệt
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 17/11/2026 — Q-M4-1 (chỉ lối vào trang Tài liệu), Q-M4-3; nội dung task chuẩn bị 18/11/2026
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link>

## Mục tiêu
Từ trang Tài liệu (nút "Hỏi tài liệu", chọn sẵn tài liệu đó — Q-M4-1, CTO chốt 17/11/2026), người dùng chọn tài liệu `READY`, hỏi và thấy câu trả lời hiện dần kèm nhãn trích dẫn bấm được để xem đoạn nguồn; thấy rõ khi tài liệu không đủ căn cứ.

## Phạm vi
- **Làm:**
  - Nút "Hỏi tài liệu" ở trang Tài liệu → hộp thoại chọn tài liệu (chọn sẵn tài liệu đó, chỉ `READY`, tối đa 5) → tạo hội thoại với `documentIds`.
  - **Dùng lại khung Chat** (SSE, Dừng, Tạo lại, lịch sử).
  - Nhãn `[n]` → xem tên tài liệu, trang (nếu có), đoạn trích.
  - Câu từ chối (`insufficientEvidence`) và cảnh báo `ungrounded`; vi/en; desktop + 375 px; sáng/tối.
- **Không làm:**
  - Chat UI mới.
  - Lối vào từ màn tạo hội thoại Chat (Q-M4-1).
  - Thêm/bớt tài liệu sau khi tạo (Q-M4-3).
  - Tóm tắt (SE-016); xem trước toàn văn tài liệu.

## Checkpoint
| CP | Nội dung | Bằng chứng tối thiểu |
|---|---|---|
| CP1 | Nút "Hỏi tài liệu" ở dòng tài liệu `READY` (ẩn/khóa với trạng thái khác) | Ảnh |
| CP2 | Hộp thoại chọn: chỉ `READY` của mình, chọn sẵn tài liệu nguồn, tối đa 5 (chặn chọn thứ 6, có thông báo) | Ảnh + `curl` danh sách |
| CP3 | Mở Chat với hội thoại có tài liệu; dùng lại SSE; nhãn `[n]` → popover nguồn; nhãn không có trong `citations` làm mờ; danh sách tài liệu của hội thoại hiển thị ở đầu hội thoại | GIF luồng chính |
| CP4 | Câu từ chối, `ungrounded`, đang tải/lỗi (`DOCUMENT_NOT_READY`, `DOCUMENT_NOT_FOUND`); vi/en; desktop + 375 px; sáng/tối | Ảnh |
| CP5 | Hồi quy Chat thường; 2 tài khoản không thấy tài liệu của nhau; chế độ `staff` ẩn nút (bảng tính năng SE-003); CI | Bàn giao 6.1 |

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Luồng chính: Tài liệu → "Hỏi tài liệu" → hỏi → câu trả lời hiện dần → bấm `[n]` thấy đúng đoạn nguồn (khớp `citations` của API) | GIF |
| AC2 | Câu hỏi ngoài tài liệu → thông báo thiếu căn cứ, không có nhãn nguồn; `ungrounded` → cảnh báo "Câu trả lời chưa có nguồn kiểm chứng" | Ảnh |
| AC3 | Chỉ liệt kê tài liệu `READY` của chính người dùng; tối đa 5 | Ảnh 2 tài khoản |
| AC4 | Trạng thái trống/tải/lỗi; desktop + 375 px; sáng/tối; vi/en; `staff` theo bảng tính năng | Ảnh |
| AC5 | Chat thường không hồi quy (gửi, Dừng, Tạo lại, lịch sử) | GIF |
| AC6 | Checklist hai vai; CI xanh | Bàn giao 6.1 |

## Ước lượng (TL đánh giá lại 18/11/2026)
2 ngày, giữ nguyên. Khung Chat, SSE và trang Tài liệu (SE-012) đã có; phần mới là hộp thoại chọn tài liệu, popover trích dẫn và các trạng thái.

## Kết quả review
Chưa có.

## Lịch sử review

## Phản hồi UI
Chưa có.
