# SE-016 — Module 4: tóm tắt tài liệu

Trạng thái: Cần sửa
Người phụ trách: Senior Dev · Ưu tiên: **P1** (CTO 18/11/2026 (chỉ thị chuẩn bị Module 4)) · Ước lượng: 1,5 ngày làm việc
Phụ thuộc (gate): [SE-012](SE-012-documents-txt-frontend.md) merge **và** [SE-014](SE-014-rag-qa-backend.md) hoàn thành (dùng chung export Module 3 + cách gọi LLM); kiến trúc TL-008 đã duyệt
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — 20/11/2026 · bàn giao review — 20/11/2026 ·
Chốt: 17/11/2026 — Q-M4-4 (job nền); nội dung task chuẩn bị 18/11/2026
SHA cơ sở: `origin/develop` @ `3cf1d73`
PR: <link>

## Mục tiêu
Người dùng bấm "Tóm tắt" ở một tài liệu `READY` của mình và nhận bản tóm tắt tiếng Việt dựa trên toàn bộ nội dung; bản tóm tắt được lưu để mở lại không phải sinh lại.

## Phạm vi
- **Làm:**
  - `POST /documents/:id/summary`: `202` khi tạo job, `200` khi đã có bản lưu.
  - Job `summarize-<id>` trên **queue `documents` có sẵn** (không tạo queue mới), `attempts = 2`.
  - `VectorStoreService.scroll(documentId)`, sắp theo `chunkIndex`.
  - Map-reduce đơn giản: nhóm ≤ `RAG_SUMMARY_GROUP_CHARS` → tóm tắt nhóm → một lượt gộp. Dùng `LlmProvider` có sẵn (đọc hết stream, không stream ra client).
  - Trường `summary*`; `DOCUMENT_SUMMARY_FAILED`; polling `summaryStatus`; nút + hộp thoại ở trang Tài liệu.
  - Theo [module-4-rag.md mục 8](../design/module-4-rag.md#8-tóm-tắt-se-016); kiểm thử S1–S2.
- **Không làm:** tóm tắt nhiều tài liệu một lúc; chỉnh độ dài tùy ý; stream tóm tắt ra client.

## Checkpoint
| CP | Nội dung | Bằng chứng tối thiểu |
|---|---|---|
| CP1 | API + `summaryStatus` (`PENDING/READY/FAILED`), schema `summary*`, `DocumentDto`; tài liệu người khác `404`, chưa `READY` `400 DOCUMENT_NOT_READY` | `curl` |
| CP2 | Job `summarize-<id>`: `scroll` Qdrant → nhóm → map-reduce → `READY`; `attempts = 2`; lỗi cuối → `FAILED DOCUMENT_SUMMARY_FAILED` | Log job + bản ghi Mongo |
| CP3 | Lưu `summary`, `summaryModel`, `summarizedAt`; polling; nút/hộp thoại ở trang Tài liệu; vi/en; 375 px | Ảnh/GIF |
| CP4 | S1 (gọi lại → `200`, **không có dòng usage mới**); S2 (xóa khi đang tóm tắt → không lưu, dọn như Module 3 — update có điều kiện `deletedAt: null`); retry; đọc lại trên service thật | Bảng kết quả |

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Tài liệu thử công khai (một nhóm và ≥ 2 nhóm) → tóm tắt tiếng Việt nêu đúng ý chính (TL đối chiếu nguồn) | Ảnh + đối chiếu |
| AC2 | S1: mở lại → trả bản đã lưu, không gọi LLM lần hai | Log usage |
| AC3 | Tài liệu người khác → `404`; chưa `READY` → `400` đã dịch; `staff` → ẩn/`404` | `curl` |
| AC4 | S2 + lỗi LLM → `FAILED` đúng mã sau 2 lượt; Tóm tắt lại được sau `FAILED` | Bảng kết quả |
| AC5 | Checklist hai vai; CI xanh | Bàn giao 6.1 |

## Ước lượng (TL đánh giá lại 18/11/2026)
1,5 ngày, giữ nguyên. Queue/worker BullMQ, polling trạng thái và `LlmProvider` đã có; phần mới là `scroll`, job tóm tắt và hộp thoại.

## Kết quả review
Chưa có.

## Lịch sử review

### Checklist vòng 1 (bàn giao CP1–CP4)

Commit theo checkpoint: CP1 `8413486` (API + summaryStatus), CP2 `b3099c7` (job summarize, map-reduce, lưu), CP3 `aad15a6` (hộp thoại tóm tắt, polling), CP4 = commit tài liệu này (bằng chứng). Dịch vụ thật: Mongo Atlas, Redis/MinIO/Qdrant (compose local), OpenAI `gpt-5.4-mini` + `text-embedding-3-small`, `LLM_PROVIDER=openai`, chế độ `demo`.

| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| AC1 tóm tắt tiếng Việt, nhiều nhóm | Đạt: `wiki-vinh-ha-long.txt` (69 KB) → 5 nhóm map + 1 lượt reduce (6 lần LLM), `READY` sau 25 s, `summaryModel=gpt-5.4-mini`; nội dung tiếng Việt nêu đúng các ý chính. Hai lần map kết thúc `max_output_tokens` (bản tóm tắt nhóm bị cắt) — xem giới hạn | Log `usage model=` ×6; GET tài liệu; ảnh hộp thoại |
| AC2 S1: mở lại → không gọi LLM | Đạt: gọi lại khi đã `READY` → `200`, số dòng `usage model=` mới = **0** | Đếm dòng log trước/sau |
| AC3 quyền và trạng thái | Đạt: `se016-b` tóm tắt tài liệu của `se016-a` → `404 DOCUMENT_NOT_FOUND`; chưa đăng nhập → `401`; tài liệu chưa `READY` (tải lên rồi gửi ngay) → `400 DOCUMENT_NOT_READY`; `staff` → `POST /summary` và `GET /documents` đều `404` | curl trên API thật; API restart `RELEASE_MODE=staff` rồi trả lại `demo` |
| AC4 S2 xóa khi đang tóm tắt; lỗi → FAILED; tóm tắt lại được | Đạt: S2 — xóa tài liệu 4 s sau khi xếp job → log `không lưu tóm tắt: đã bị xóa trong lúc xử lý`, không bản tóm tắt nào được lưu. FAILED — tài liệu READY không có đoạn Qdrant → sau các lượt thử `summaryStatus=FAILED`, `DOCUMENT_SUMMARY_FAILED` (log `job=summarize`); gọi lại → `202`, xếp job mới | Log WARN; kiểm Mongo |
| AC5 M1–M3, Chat/RAG không hồi quy | Đạt: chat thường `meta → delta → done`, COMPLETED, không citations; hỏi tài liệu COMPLETED với citations; tải lên TXT → READY, danh sách, tải xuống (2764 ký tự), xóa `204` | Script smoke trên API thật |
| AC6 checklist hai vai; CI | Checklist bên dưới; CI xem trên PR | — |

**Giao diện:** menu tài liệu có "Tóm tắt" (bật khi `READY`); hộp thoại hiện trạng thái đang tóm tắt (tiếng Việt), đã có bản lưu (không gọi lại LLM), FAILED kèm nút "Thử lại"; tự làm mới mỗi 3 giây khi `PENDING`. Đã kiểm vi (đang tóm tắt, bản tóm tắt, FAILED) và en (bản tóm tắt). Không kiểm dark mode và 375 px cho hộp thoại này.

**Kiểm tra đã chạy:** `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm build` ✅ · `pnpm --filter @cat-gpt/api test` 83/83 ✅ (79 cũ + 4 mới, `document-summary.spec.ts`) · `pnpm env:check` ✅

**Checklist hai vai** (workflow 9.1):
- [x] Quyền: ca được phép — chủ tài liệu tóm tắt (202/200). Ca bị từ chối — chưa đăng nhập `401`; người khác `404`; staff `404`
- [x] Đường dẫn trực tiếp / màn không có quyền: staff ẩn Tài liệu (`/documents` → "Không tìm thấy trang") và endpoint tóm tắt `404`
- [x] Trạng thái đang tóm tắt / thành công / lỗi: có ảnh (vi và en); trạng thái trống không áp dụng
- [ ] Desktop + 375px, sáng + tối cho hộp thoại tóm tắt — chưa kiểm (ghi giới hạn)
- [x] Chế độ `demo` / `staff`: đã kiểm (bảng AC3)
- [x] Ma trận quyền: không đổi — endpoint mới `POST /documents/:id/summary` nằm dưới `DocumentsHiddenGuard` và đăng nhập bắt buộc như các route tài liệu khác
- [x] Dữ liệu thử đã dọn: tài khoản `se016-a/b` (2) và sessions (12), tài liệu thử (4 + 1 của admin), hội thoại (3) đã xóa; Mongo = 0, Qdrant point = 0, MinIO object = 0

**Sự cố khi dọn (ghi nhận):** 3 hội thoại của hai tài khoản thử bị xóa theo `userId` của chính hai tài khoản đó (đã in danh sách trước khi xóa), không theo `_id` ghi lúc tạo, vì id của chúng không được ghi lại khi tạo. Chỉ ảnh hưởng dữ liệu của hai tài khoản thử do phiên này tạo.

**Giới hạn còn lại:**
- Map-reduce một lượt: nếu số nhóm lớn, bản gộp có thể vượt `RAG_SUMMARY_GROUP_CHARS` (ghi trong `document-summary.ts`).
- `LLM_MAX_OUTPUT_TOKENS` giới hạn đầu ra: các bản tóm tắt nhóm có thể bị cắt (`max_output_tokens`); chưa đo chất lượng trên nhiều tài liệu. Đề xuất TL quyết định có nâng giới hạn cho job tóm tắt không.
- Hộp thoại tóm tắt chưa kiểm dark mode và 375 px.
- Tóm tắt lưu trong MongoDB cùng bản ghi tài liệu, nên danh sách tài liệu trả kèm nội dung tóm tắt (payload lớn hơn); chưa tối ưu.
- Không tóm tắt nhiều tài liệu một lúc (đúng phạm vi).

#### Review vòng 1

**Yêu cầu sửa lại — SE-016** (review vòng 1, SHA đã review `2d39e9d`). TL chuyển `Cần sửa`. Hãy chép nguyên văn khối này vào "Lịch sử review" của SE-016 dưới mục `#### Review vòng 1`, đổi trạng thái task thành `Cần sửa`.

Phần TL đã kiểm đạt, không cần làm lại:
- Gates: typecheck/lint/build xanh, api test 83/83, CI xanh.
- API thật với tl-review-se016-a/b:
  - Một nhóm (`noi-bo-nghi-phep`): 202 → READY 5 s.
  - Nhiều nhóm (`wiki-pho`, 33 đoạn): READY 12 s.
  - Nội dung đúng ý chính; TL đã đối chiếu với nguồn.
  - S1: gọi lại → 200, không có dòng usage mới.
  - B → 404; ẩn danh → 401.
- UI: trạng thái "đang tóm tắt" + polling → READY ở 375px không tràn.

1. **AC1 / CP3 chưa đạt: hộp thoại tóm tắt hiển thị markdown thô.**
   - Tái hiện: `/documents` → menu "Tóm tắt" của `noi-bo-nghi-phep.txt` hoặc `wiki-vinh-ha-long.txt` → nội dung hiện nguyên `**Phạm vi áp dụng:**`, `**14 ngày/năm**`, `- ` … vì `summary-dialog.tsx:60` render `<p className="whitespace-pre-wrap">{current.summary}</p>`.
   - Mong đợi: tóm tắt hiển thị đúng định dạng (đậm, danh sách), không còn ký tự `**`. Cách đơn giản nhất: dùng lại component `Markdown` có sẵn (`features/chat/components/markdown.tsx`), không thêm thư viện. Không đổi prompt hay backend.
   - Kiểm lại: ảnh hộp thoại với một bản có danh sách/đậm, ở desktop + 375px, sáng + tối, vi + en (vòng 1 còn thiếu tối/375px cho hộp thoại).

Không bắt buộc, ghi vào giới hạn còn lại nếu không làm:
- `complete()` không bắt `onFinish('max_output_tokens')`, nên bản nhóm/gộp bị cắt vẫn được lưu READY. Đề xuất ghi log cảnh báo (chỉ số, không nội dung). Không tự nâng `LLM_MAX_OUTPUT_TOKENS`.
- Danh sách tài liệu trả kèm `summary`.

Sau khi sửa: cập nhật cùng PR #32, thêm `### Checklist vòng 2`, chuyển `Chờ Review` và báo TL SHA mới. Giữ app chạy ở SHA mới để TL kiểm lại UI. Dữ liệu thử của TL đã xóa theo id (3 tài liệu, Qdrant = 0). Hai tài khoản tl-review-se016-a/b giữ lại cho vòng 2.

## Phản hồi UI
Hộp thoại "Tóm tắt tài liệu" (vi/en) hiển thị trạng thái và bản tóm tắt; mục menu "Tóm tắt" ở dòng tài liệu READY. Ảnh lưu tại thư mục ảnh chụp của Chrome, không commit vào repo.
