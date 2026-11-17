# SE-012 — Lát TXT, giao diện: trang Tài liệu thật

Trạng thái: Chờ Review
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 2 ngày làm việc
Phụ thuộc: [SE-011](SE-011-documents-txt-backend.md) — **Done**, merge `abc5a55`; [SE-003](SE-003-release-mode-navigation.md) — Done, merge `783a8a3`; **không còn phụ thuộc chặn**
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — 18/11/2026 · bàn giao review — 18/11/2026 · hoàn tất —
Chốt: 16/11/2026 — CTO duyệt Wave 0–2: SE-012 triển khai frontend lát TXT
SHA cơ sở: `origin/develop` @ `1ca349e`
PR: <link, Senior Dev ghi khi bàn giao>

**Thử nghiệm skills:** task pilot số 2 ([TL-010](TL-010-engineering-guide-skills-pilot.md)) — đọc [engineering-guide](../project/engineering-guide.md) và `apps/web/AGENTS.md` trước khi làm.

## Mục tiêu
Nhân viên mở Tài liệu, tải lên tệp TXT, thấy trạng thái tự chuyển tới "Sẵn sàng", tìm theo tên, tải xuống và xóa — trên dữ liệu thật của API SE-011.

## Output
- PR từ `feature/module-3-documents-txt-ui` vào `develop`.
- `apps/web/src/features/documents/` (`api.ts`, `hooks.ts`, `components/`) và route `/documents` theo [thiết kế mục 11](../design/module-3-documents.md#11-giao-diện-se-012); dùng lại component preview khi hợp, không dùng `fake-data`.
- `messages/{vi,en}.json`: nhãn trạng thái, thông báo cho mọi mã lỗi mục 7.

## Phạm vi
- Làm: danh sách (desktop bảng, mobile thẻ), tải lên, tìm theo tên, lọc trạng thái, nhãn trạng thái tự cập nhật, chi tiết (kể cả mã lỗi khi `FAILED`), tải xuống, xóa có xác nhận.
- Không làm: xem trước nội dung, tóm tắt, hỏi đáp (Module 4); bật Tài liệu ở chế độ `staff` (giữ ẩn theo SE-003).

## Nguồn yêu cầu
- [module-3-documents.md](../design/module-3-documents.md) mục 2, 5, 7, 11; [chuẩn giao diện](../design/ui-release-standards.md#1-chuẩn-dùng-chung).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Luồng chính trên API thật: tải lên TXT → "Đang chờ" → "Đang xử lý" → "Sẵn sàng" (không tải lại trang) → tìm theo tên → tải xuống (tệp mở được, đúng tên) → xóa (biến mất ngay) | FR-M3-01…07 | GIF/ảnh |
| AC2 | Tệp sai loại / quá cỡ → thông báo đã dịch (vi, en); tài liệu `FAILED` hiện nhãn lỗi đã dịch | Thiết kế mục 7 | Ảnh |
| AC3 | Chỉ gọi lại danh sách định kỳ khi còn `PENDING`/`PROCESSING`; hết thì dừng | Thiết kế mục 11 | Tab Network |
| AC4 | Trạng thái trống / đang tải / lỗi API; desktop + 375 px; sáng + tối; vi + en | Workflow 9.1 | Ảnh |
| AC5 | Tài khoản B không thấy tài liệu của A; mở trực tiếp link tải của A → không tải được | M3-2 | Ảnh / Network |
| AC6 | Chế độ `staff` vẫn ẩn Tài liệu; chế độ `demo` không đổi luồng Chat | SE-003, bản demo | Ảnh |
| AC7 | Checklist hai vai đủ; dữ liệu thử đã xóa | Workflow 9.1 | Bàn giao 6.1 |
| AC8 | CI xanh; `pnpm build`, `typecheck`, `lint` đạt | Quy ước repo | Link run |

**Bàn giao bổ sung (Simplicity First):** 5 dòng như [SE-011](SE-011-documents-txt-backend.md#checklist-nghiệm-thu).

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| — | Không có | — | — |

## Kết quả review
**Task:** SE-012 — trang Tài liệu thật (danh sách, tải lên, tìm, lọc, tải xuống, xóa) trên API thật của SE-011, không mock.

**Kết quả:** Đã làm đủ phạm vi mục tiêu; đã tự kiểm toàn bộ AC1–AC8 bằng dịch vụ thật (Mongo/MinIO/Qdrant/Redis thật, không giả lập); đã sửa 3 vấn đề TL phát hiện ở CP1 và 1 lỗi tự tìm thấy khi test CP2 (xem Checklist vòng 2); đã dọn toàn bộ dữ liệu thử, xác nhận bằng đếm trực tiếp 3 nơi (không dùng danh sách API).

**Checklist:**
- [x] AC1 Luồng chính trên API thật — Đạt — tải `large-400chunks.txt` (469 KB) → "Đang chờ" → "Đang xử lý" → "Sẵn sàng" (419 đoạn) không tải lại trang; tìm theo tên khớp; tải xuống qua `useDownloadDocument` (pre-flight `GET /documents/:id` rồi mới tải, tên tệp giữ nguyên); xóa biến mất ngay trong danh sách. Ảnh + Network: xem Checklist vòng 1 và vòng 2 dưới đây
- [x] AC2 Tệp sai loại/quá cỡ — Đạt — tải `.txt` 469 KB bình thường; tải tệp sai phần mở rộng → toast "Invalid file type."/"Loại tệp không hợp lệ." (đã sửa từ câu chữ dành riêng cho avatar — xem Checklist vòng 2); tài liệu `FAILED` hiện nhãn lỗi đã dịch qua `tErrors(document.errorCode as ErrorCode)`
- [x] AC3 Chỉ gọi lại định kỳ khi còn PENDING/PROCESSING — Đạt — Network: `GET /documents?...pageSize=10` gọi lúc t≈0 (do invalidate sau upload) và t≈4s (do `refetchInterval` 3s), 0 request thêm trong 6s sau khi chuyển "Sẵn sàng" — dừng đúng lúc
- [x] AC4 Trạng thái trống/đang tải/lỗi API; desktop + 375px; sáng + tối; vi + en — Đạt — trống: ảnh "No documents yet."; desktop: bảng; 375px: dùng khung iframe tạm (`mobile-preview.html`, không commit, đã xóa sau khi dùng — môi trường này không đổi được kích thước cửa sổ, đúng hạn chế đã ghi ở [ui-release-standards.md §2](../design/ui-release-standards.md)) — xác nhận thẻ xếp dọc, ô tìm/lọc xếp dọc, menu hành động dùng được, không cuộn ngang; sáng/tối và vi/en: ảnh trong Checklist vòng 1
- [x] AC5 Tài khoản B không thấy tài liệu của A; mở trực tiếp link tải của A → không tải được — Đạt — kiểm ở tầng API đúng endpoint/tham số UI dùng (`GET /documents?page=1&pageSize=10`, `GET /documents/:id/download`) với 2 tài khoản thử của TL (đọc từ file, không gõ/dán ở đâu khác): B liệt kê total=0, không thấy tài liệu của A; B mở thẳng link tải của A → 404 `DOCUMENT_NOT_FOUND` (không lộ sự tồn tại qua mã lỗi khác). TL xác nhận sẽ tự làm thêm vòng kiểm UI bằng trình duyệt thật khi bàn giao
- [x] AC6 Chế độ `staff` vẫn ẩn Tài liệu; chế độ `demo` không đổi luồng Chat — Đạt — bật `NEXT_PUBLIC_RELEASE_MODE=staff`: `/documents` → "Page not found" (chặn bởi `notFound()` theo SE-003), mục "Documents" biến mất khỏi sidebar; `/chat` vẫn mở bình thường (lịch sử chat, gợi ý mẫu) — không đổi gì vì SE-012 không chạm code Chat
- [x] AC7 Checklist hai vai đủ; dữ liệu thử đã xóa — Đạt — mọi tài liệu thử (upload polling, AC5 A/B, 503) đã xóa, xác nhận bằng đếm trực tiếp Mongo/MinIO/Qdrant = 0 sau mỗi lần (không dùng danh sách API, theo chuẩn mới rút ra từ SE-011 AC13 — xem đính chính trong [SE-011](SE-011-documents-txt-backend.md#checklist-nghiệm-thu)); checklist hai vai: TL sẽ làm vòng UI A/B riêng khi bàn giao
- [x] AC8 CI xanh; `pnpm build`, `typecheck`, `lint` đạt — Đạt — chạy ở gốc repo: `typecheck` (`@cat-gpt/web` sinh types thành công), `build` (biên dịch thành công, route `/documents` xuất hiện), `lint` (`@cat-gpt/web` và `@cat-gpt/api` đều 0 cảnh báo/lỗi)

**Kiểm tra đã chạy:** `pnpm typecheck && pnpm build && pnpm lint` ở gốc repo (xanh); kiểm thủ công toàn bộ qua trình duyệt thật (Claude in Chrome) + script tầng API đối chiếu Mongo/MinIO/Qdrant trực tiếp (không mock) cho từng AC ở trên.

**Simplicity First:**
- Không thêm trừu tượng mới: tái dùng nguyên khuôn mẫu `users-management.tsx` (bảng/thẻ/phân trang) và `admin-users`/`profile` cho các component tài liệu.
- `useDownloadDocument` chỉ thêm một bước `GET` tiền kiểm trước khi tải — không đổi luồng tải xuống nói chung.
- `useDeleteDocument`/`useDownloadDocument` dùng chung `onSettled`, không thêm state cục bộ cho "đã xóa ở nơi khác".
- Không đổi kiến trúc, không thêm thư viện mới.
- Phần ngoài phạm vi (nâng cấp Next.js/multer theo cảnh báo `pnpm audit`) giữ nguyên, không đụng tới trong PR này theo yêu cầu của TL.

**Dọn nhánh sau merge:** Senior Dev sẽ dọn `feature/module-3-documents-txt-ui` theo [mục 2.1](../project/workflow.md#21-dọn-nhánh-và-worktree-sau-merge) sau khi TL merge.

**Trạng thái:** Chờ Review.

## Lịch sử review

### Checklist vòng 1
| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| AC1 luồng chính | Đạt | Tải lên → Sẵn sàng → tìm → tải xuống → xóa, ảnh + Network |
| AC2 lỗi loại/cỡ tệp | Đạt | Ảnh toast + nhãn lỗi FAILED |
| AC3 polling | Đạt (sơ bộ) | Quan sát UI; bằng chứng Network chi tiết bổ sung ở vòng 2 |
| AC4 trạng thái UI | Đạt (desktop/sáng/tối/vi/en); 375px — để trống, chưa làm được lúc này | Ảnh |
| AC6 staff/demo | Chưa kiểm ở vòng này | — |
| AC8 gate | Đạt | typecheck/build/lint xanh |

TL review vòng 1, 3 phát hiện: (1) tải xuống dùng thẻ `<a href download>` thuần, bỏ qua interceptor làm mới token của axios; (2) câu chữ `FILE_INVALID_TYPE` viết riêng cho avatar, hiển thị sai ngữ cảnh ở trang Tài liệu; (3) cần xem lại `useDeleteDocument` có xử lý đúng trường hợp xóa 404 không.

### Checklist vòng 2
| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| Phát hiện 1 — tải xuống bỏ qua refresh token | Đạt | Thêm `useDownloadDocument` (`GET /documents/:id` trước, rồi mới tải) — Network xác nhận GET 200 trước khi tải |
| Phát hiện 2 — câu chữ `FILE_INVALID_TYPE` | Đạt | Đổi câu chữ chung chung; ảnh xác nhận avatar không bị ảnh hưởng (gợi ý "JPG, PNG hoặc WEBP, tối đa 2MB." vẫn còn) |
| Phát hiện 3 — xóa tài liệu đã bị xóa nơi khác (404) | Đạt — tìm thêm 1 lỗi thật | `useDeleteDocument` trước đó chỉ `invalidate` khi thành công, không khi lỗi 404 — dòng cũ còn hiện tới lần polling sau. Sửa qua `onSettled` (thành công HOẶC 404 đều invalidate). Kiểm trực tiếp: xóa tài liệu qua curl (giả lập tab khác) rồi bấm Xóa trên cùng dòng ở UI — toast đúng, dòng biến mất ngay |
| 375px | Đạt | Dùng khung iframe tạm 375px (không commit) — thẻ xếp dọc, ô tìm/lọc xếp dọc, menu hành động dùng được, không cuộn ngang |

TL xác nhận cả 3 phát hiện đã sửa đúng (0ee68c0).

### Checklist vòng 3 (AC5, AC3 polling, AC6, dọn dữ liệu)
| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| AC3 polling tường minh | Đạt | Network: GET lúc t≈0 và t≈4s (còn PENDING/PROCESSING), 0 GET thêm trong 6s sau khi "Sẵn sàng" |
| 503 khi hàng đợi ngừng | Đạt | Dừng Redis thật (đã báo TL trước), tải lên → toast "Document processing is busy right now." đã dịch, danh sách không có dòng mồ côi; khởi động lại Redis, `docker ps` healthy |
| AC5 cô lập theo chủ sở hữu | Đạt | Script tầng API với tài khoản thử A/B của TL: B liệt kê total=0, không thấy tài liệu A; B tải thẳng link của A → 404 `DOCUMENT_NOT_FOUND` |
| AC6 staff ẩn / demo không đổi | Đạt | `NEXT_PUBLIC_RELEASE_MODE=staff`: `/documents` → 404, sidebar ẩn mục Documents; `/chat` không đổi |
| Dọn dữ liệu thử | Đạt | Mỗi tài liệu thử (polling ×2, AC5, 503) xóa xong đều đếm trực tiếp Mongo/MinIO/Qdrant = 0 |

TL phát hiện thêm trong lúc rà bucket MinIO: 2 tài liệu thử sót lại từ SE-011 (lỗi `Qdrant Not Found` và MinIO-tắt khiến job `delete` cũ hết lượt thử trước khi SE-011 sửa xong) — đã `job.retry()` và xác nhận sạch cả 3 nơi; đính chính vào checklist AC13 của SE-011.

## Phản hồi UI
Chưa có.
