# SE-015 — Module 4, giao diện: hỏi tài liệu và hiển thị trích dẫn

Trạng thái: Chờ Review
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 2 ngày làm việc
Phụ thuộc (gate): [SE-014](SE-014-rag-qa-backend.md) merge **và** [SE-012](SE-012-documents-txt-frontend.md) merge (cả hai chặn); kiến trúc TL-008 đã duyệt. **Đạt 19/11/2026** (SE-014 → `124ccee`, SE-012 → `cd386e5`); TL chuyển `Sẵn sàng`
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — 19/11/2026 · bàn giao review — 19/11/2026 · hoàn tất —
Chốt: 17/11/2026 — Q-M4-1 (chỉ lối vào trang Tài liệu), Q-M4-3; nội dung task chuẩn bị 18/11/2026
SHA cơ sở: `origin/develop` @ `605fd5e`
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

### Checklist vòng 1 (bàn giao CP1–CP5)

Commit theo checkpoint: CP1 `130bf71` (nút Hỏi tài liệu), CP2 `62555d7` (hộp thoại chọn, `?documents=`), CP3 `e4e0c8f` (trích dẫn bấm được, thanh tài liệu đầu hội thoại), CP4 `da52fad` (nhãn không đủ căn cứ/chưa có nguồn, sửa tràn ngang 375px), CP5 = commit tài liệu này. Gate local: typecheck, lint, build (web + api), `pnpm test` 79/79, `pnpm env:check` OK.

| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| AC1 luồng chính: Tài liệu → Hỏi tài liệu → hỏi → hiện dần → bấm `[n]` thấy đúng đoạn | Đạt: nhãn 4 mở popover "Source 4" — tài liệu `wiki-vinh-ha-long.txt`, đoạn trích từ payload. Lưu ý: câu trả lời nêu năm 1994 nhưng đoạn trích không có năm này (xem giới hạn) | Ảnh trình duyệt (phiên 19/11); `citations` khớp API |
| AC2 câu ngoài tài liệu → thiếu căn cứ, không nhãn nguồn; `ungrounded` → cảnh báo | Đạt cho thiếu căn cứ: "Không đủ căn cứ trong tài liệu đã chọn", không nhãn. `ungrounded` **chưa tái hiện trên UI** (code có, chưa có tin nào để kiểm) | Ảnh "Not enough evidence…" |
| AC3 chỉ tài liệu READY của mình; tối đa 5 | Đạt: dialog chỉ liệt kê READY của người dùng; chọn 5/5 OK, chọn thứ 6 bị chặn với thông báo "Một hội thoại hỏi tối đa 5 tài liệu". Cô lập 2 tài khoản qua API: A thấy 2, B thấy 1, giao nhau 0, truy cập chéo 404, ẩn danh 401 | Ảnh dialog 5/5 + toast; đếm API |
| AC4 trống/tải/lỗi; desktop + 375px; sáng/tối; vi/en; `staff` | Đạt một phần: tải ("Đang tải tài liệu..."), không tải được ("Không tải được tài liệu"), dialog trống chưa chụp. 375px kiểm bằng iframe 375px trong trang (không phải viewport thật). Sáng + vi, tối + en đã chụp. `staff` ẩn đúng | Ảnh trình duyệt |
| AC5 Chat thường không hồi quy | Đạt: chat thường không có thanh tài liệu/nhãn; gửi tin gợi ý thành công; SSE hiện như cũ | Ảnh + gửi tin trên UI |
| AC6 checklist hai vai; CI xanh | Checklist bên dưới; CI xem trên PR | — |

**Chế độ `staff`** (API `RELEASE_MODE=staff`, web `NEXT_PUBLIC_RELEASE_MODE=staff`): sidebar không còn "Tài liệu"; `/documents` → trang "Không tìm thấy trang"; `/chat?documents=<id>` hiện "Không tải được tài liệu" (API trả 404 chung, không lộ tài liệu); gửi tin bị chặn (hội thoại không được tạo — danh sách không đổi). Toast lỗi không chụp được trong cửa sổ chụp.

**Kiểm tra đã chạy:** `pnpm typecheck`, `pnpm lint`, `pnpm build` đều exit 0; `pnpm --filter @cat-gpt/api test` 79/79; `pnpm env:check` OK; `pnpm --filter @cat-gpt/web` typecheck/lint sạch sau mỗi CP.

**Checklist hai vai** (workflow 9.1):
- [x] Quyền: ca được phép — admin hỏi tài liệu của admin (UI, 200/SSE). Ca bị từ chối — chưa đăng nhập `401` (`/documents`, `POST /chat/stream`); người khác `404` (`GET /documents/:id`, hỏi tài liệu chéo A↔B, `POST /chat/stream` với tài liệu người khác)
- [x] Đường dẫn trực tiếp tới màn không có quyền: `/documents` ở `staff` → "Không tìm thấy trang"
- [x] Trạng thái trống / tải / lỗi / thành công: tải, không tải được, thành công có ảnh; dialog trống chưa chụp (ghi giới hạn)
- [x] Desktop + 375px, sáng + tối, vi + en: có ảnh (375px qua iframe; tối/en và sáng/vi đều đã chụp)
- [x] Chế độ `demo` / `staff`: đã kiểm cả hai (bảng trên)
- [x] Ma trận quyền: không đổi — không có endpoint mới; hỏi tài liệu dùng `POST /chat/stream` sẵn có; quyền tài liệu theo CS-1/M3-2
- [x] Dữ liệu thử đã dọn: Mongo `documents`/`users`/`conversations` của tài khoản thử = 0; tài liệu thử của admin (6) = 0; Qdrant point = 0; MinIO object = 0. Lưu ý: đã xóa nhầm 2 hội thoại không thuộc phiên này (xem giới hạn)

**Giới hạn còn lại:**
- Hội thoại `6af97fa9…` (15/11) và `6ae0bae8…` (27/10) bị xóa nhầm do lọc theo tiêu đề quá rộng; không khôi phục được từ phía ứng dụng.
- Câu trả lời "1994" (Vịnh Hạ Long) có trích dẫn [4] nhưng đoạn trích nói về hồ sơ năm 1993: trích dẫn chỉ hỗ trợ một phần câu trả lời. Đây là chất lượng sinh câu trả lời, để SE-017 đo; không sửa trong SE-015.
- `ungrounded` và nhãn mờ (`[n]` không có trong citations) chưa tái hiện trên UI; code đã có.
- `DOCUMENT_NOT_READY` chưa kiểm trên UI (đã có ở API từ SE-014).
- Không ghi GIF luồng chính; bằng chứng là ảnh chụp.
- Chất lượng `[n]` trong lịch sử (lượt trước) và q01 vẫn thuộc SE-017.

## Phản hồi UI
Có ảnh trình duyệt trong phiên bàn giao (ảnh lưu tại thư mục ảnh chụp của Chrome, không commit vào repo). Giao diện: nút ở menu Tài liệu; hộp thoại "Hỏi tài liệu" (vi/en); Chat có thanh "Tài liệu:" đầu hội thoại; nhãn `[n]` bấm được; câu từ chối có nhãn "Không đủ căn cứ trong tài liệu đã chọn".
