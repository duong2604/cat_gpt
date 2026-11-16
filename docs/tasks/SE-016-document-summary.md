# SE-016 — Module 4: tóm tắt tài liệu

Trạng thái: Nháp
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 1,5 ngày làm việc
Phụ thuộc: [TL-008](TL-008-module-4-design.md) duyệt (chặn); [SE-012](SE-012-documents-txt-frontend.md) merge (chặn); làm sau [SE-014](SE-014-rag-qa-backend.md) (dùng chung cách gọi LLM)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: — (chờ TL-008 duyệt)
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link>

## Mục tiêu
Người dùng bấm "Tóm tắt" ở một tài liệu `READY` của mình và nhận bản tóm tắt tiếng Việt dựa trên toàn bộ nội dung; bản tóm tắt được lưu để mở lại không phải sinh lại.

## Phạm vi (sơ bộ — chốt theo TL-008)
- Làm: `POST /documents/:id/summary` → job nền `summarize-<id>` trên queue `documents` (map-reduce đơn giản trên các đoạn đọc từ Qdrant); `summaryStatus` + polling; lưu tóm tắt vào bản ghi tài liệu; nút và hộp thoại Tóm tắt ở trang Tài liệu — theo [module-4-rag.md mục 8](../design/module-4-rag.md#8-tóm-tắt-se-016); kiểm thử S1–S2.
- Không làm: tóm tắt nhiều tài liệu một lúc; chỉnh độ dài tùy ý.

## Checklist nghiệm thu (sơ bộ)
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Tài liệu thử công khai → tóm tắt tiếng Việt, nêu đúng các ý chính (TL đối chiếu nguồn) | Ảnh + đối chiếu |
| AC2 | Mở lại → trả bản đã lưu, không gọi LLM lần hai | Log usage |
| AC3 | Tài liệu người khác / chưa `READY` → `404` / lỗi đã dịch | `curl` |
| AC4 | Checklist hai vai; CI xanh | Bàn giao 6.1 |

## Kết quả review
Chưa có.

## Lịch sử review

## Phản hồi UI
Chưa có.
