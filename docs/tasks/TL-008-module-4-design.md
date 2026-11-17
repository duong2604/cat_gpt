# TL-008 — Thiết kế Module 4: truy hồi, hỏi đáp có trích dẫn, tóm tắt

Trạng thái: Chờ Review — CTO duyệt kiến trúc có điều kiện 17/11/2026 (review vòng 6), chốt Q-M4-1…5; còn AC4 (payload Qdrant thật, chờ SE-011)
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 1 ngày làm việc
Phụ thuộc: [TL-007](TL-007-module-3-design.md) — Done 17/11/2026. Nên viết song song [SE-011](SE-011-documents-txt-backend.md) để đối chiếu payload Qdrant thật; **chặn** SE-014…SE-016
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu 17/11/2026 · bàn giao review 17/11/2026 (vòng 1) · hoàn tất —
Chốt: 16/11/2026 — CTO vòng 2: Module 4 dùng lại Chat UI/SSE nhưng tách nghiệp vụ truy hồi/ngữ cảnh trong `RagService` (hoặc tương đương đơn giản); không chốt ngưỡng điểm trước khi có đánh giá; làm rõ xử lý câu hỏi thiếu căn cứ và xác minh trích dẫn
SHA cơ sở: `origin/develop` @ `ef2a029` (code `783a8a3`)
PR: Không — tài liệu TL

## Mục tiêu
Bản FS/BD Module 4 đủ để Senior Dev làm hỏi đáp có trích dẫn và tóm tắt mà không tự quyết luồng truy hồi, cách xử lý thiếu căn cứ, mô hình trích dẫn và quyền.

## Output
- [docs/design/module-4-rag.md](../design/module-4-rag.md).

## Phạm vi
- Làm: FS theo đề cương Module 4 (tóm tắt; hỏi–đáp dựa trên tài liệu kèm trích dẫn; tối ưu tiếng Việt); BD gồm:
  - `RagService` (module `rag`): kiểm quyền `documentIds` (chỉ tài liệu `READY` của người gọi), truy hồi Qdrant lọc `userId` + `documentIds`, dựng ngữ cảnh + prompt. `ChatService` chỉ gọi `RagService` khi hội thoại có `documentIds`; SSE, Dừng, Tạo lại, lịch sử, Chat UI giữ nguyên.
  - Dữ liệu: `conversations.documentIds?` (cố định khi tạo); `messages.citations?` `[{ n, documentId, documentName, chunkIndex, page?, quote }]`; cờ `insufficientEvidence`, `ungrounded`; trích dẫn trả trong sự kiện SSE `done` có sẵn (không thêm sự kiện mới).
  - Thiếu căn cứ: chặn cứng khi truy hồi 0 đoạn (câu cố định, không gọi LLM); prompt bắt buộc trích `[n]` và câu từ chối cố định; `RAG_MIN_SCORE` để trống (tắt) tới khi có kết quả đánh giá ([TL-009](TL-009-rag-evaluation-dataset.md)); top-k qua `.env`.
  - Xác minh trích dẫn: tách `[n]` sau khi stream xong, chỉ giữ `n` thuộc tập đoạn đã truy hồi; `quote`/tên/trang lấy từ payload Qdrant (không lấy chữ do model sinh); câu trả lời không phải câu từ chối mà không có trích dẫn hợp lệ → `ungrounded` + cảnh báo trên UI.
  - Tóm tắt: `POST /documents/:id/summary` → job nền trên queue `documents` (map-reduce đơn giản trên các đoạn), lưu kết quả vào bản ghi tài liệu; tài liệu thử công khai.
  - Kịch bản kiểm thử bằng service thật (Qdrant, OpenAI) + tiêu chí của SE-014…SE-016.
- Không làm: code; khung đánh giá (TL-009, SE-017); chia sẻ tài liệu giữa người dùng.

## Nguồn yêu cầu
- Đề cương Module 4 ([bản chép](../thesis/sources/de-cuong-datn.md)); CTO vòng 2 mục 4–5 (16/11/2026); [module-3-documents.md](../design/module-3-documents.md) mục 4.3 (payload Qdrant).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Mỗi FR Module 4 trong đề cương có API, màn hình, trạng thái | Đề cương | Đối chiếu |
| AC2 | Luồng thiếu căn cứ và xác minh trích dẫn có quy tắc kiểm chứng được, không phụ thuộc ngưỡng chưa đo | CTO vòng 2 mục 5 | Đọc mục tương ứng |
| AC3 | Quyền: không truy hồi được tài liệu người khác / chưa `READY` | CS-1, M3-2 | Kịch bản kiểm thử |
| AC4 | Đối chiếu payload Qdrant thật của SE-011 | Thiết kế M3 | Truy vấn Qdrant |
| AC5 | CTO/khách hàng duyệt | Workflow | Review vòng 1 |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q-M4-1…5 | Lối vào giao diện; số tài liệu tối đa; tài liệu cố định khi tạo hội thoại; tóm tắt chạy nền; câu hỏi nối tiếp không viết lại — xem [thiết kế mục 12](../design/module-4-rag.md#12-quyết-định-cto-chốt-17112026-review-vòng-6) | Theo đề xuất TL | **CTO chốt 17/11/2026:** Q-M4-1 chỉ lối vào từ trang Tài liệu; Q-M4-2…5 theo đề xuất — [thiết kế mục 12](../design/module-4-rag.md#12-quyết-định-cto-chốt-17112026-review-vòng-6) |

### Tóm tắt quyết định cho CTO (17/11/2026, tối)
> **Kết quả:** CTO chốt 17/11/2026 (review vòng 6). Q-M4-1 chọn **một** lối vào (trang Tài liệu); Q-M4-2…5 theo đề xuất. Phần dưới giữ làm hồ sơ.

Không quyết định nào trong 5 điểm chặn SE-011. Lát TXT chỉ tạo đoạn + vector, còn Module 4 chỉ đọc. Nếu CTO đồng ý, có thể **tạm chốt ngay Q-M4-2…5** theo đề xuất; mỗi điểm vẫn đổi được về sau qua biến môi trường hoặc một task nhỏ. **Q-M4-1** chỉ cần chốt trước SE-015.

**Q-M4-1 — Lối vào giao diện hỏi tài liệu**
- **Đề xuất mặc định:** Có hai lối vào, cùng mở một hộp thoại chọn tài liệu:
  - nút "Hỏi tài liệu" ở trang Tài liệu, chọn sẵn tài liệu đó;
  - tùy chọn "Hỏi theo tài liệu" khi tạo hội thoại mới.
- **Ưu điểm:** Đúng hai ngữ cảnh người dùng thường gặp, và dùng lại toàn bộ Chat UI (M4-1).
- **Nhược điểm:** Có hai điểm vào phải kiểm thử. Phương án gọn hơn là chỉ giữ nút ở trang Tài liệu: bớt khoảng 0,3n, nhưng người dùng đang ở Chat sẽ không thấy chức năng.
- **Ảnh hưởng scope/tiến độ:** Chỉ ảnh hưởng SE-015 (ước lượng 2n). API không đổi.
- **Tạm chốt không ảnh hưởng SE-011:** Có. Hạn chót chốt là khi SE-015 chuyển `Sẵn sàng` (sau SE-014).

**Q-M4-2 — Số tài liệu tối đa mỗi hội thoại: 5 (`RAG_MAX_DOCUMENTS`)**
- **Ưu điểm:** Giới hạn kích thước bộ lọc Qdrant và độ dài ngữ cảnh, đủ cho kịch bản demo (1–3 tài liệu). Đổi bằng biến môi trường, không cần sửa code.
- **Nhược điểm:** Người dùng muốn hỏi trên cả kho tài liệu sẽ không làm được. Đó là phạm vi khác (tìm kiếm toàn kho), chưa có trong đề cương.
- **Ảnh hưởng:** Không ảnh hưởng tiến độ.
- **Tạm chốt:** Có.

**Q-M4-3 — Tài liệu cố định khi tạo hội thoại**
- **Ưu điểm:** Các lượt trong một hội thoại không trộn nguồn, trích dẫn cũ luôn khớp. Không cần API thêm/bớt tài liệu.
- **Nhược điểm:** Muốn đổi tài liệu phải tạo hội thoại mới.
- **Ảnh hưởng:** Bỏ đi khoảng 1n so với phương án cho sửa danh sách (thêm API, giao diện, kiểm thử trích dẫn lịch sử).
- **Tạm chốt:** Có.

**Q-M4-4 — Tóm tắt chạy nền (job + polling)**
- **Ưu điểm:** Tài liệu dài cần nhiều lượt gọi LLM (gộp nhóm 12.000 ký tự), nên chờ trong một request dễ quá thời gian. Dùng lại BullMQ và cơ chế polling của Module 3. Kết quả được lưu và không sinh lại.
- **Nhược điểm:** Thêm một trạng thái `summaryStatus`. Người dùng không thấy chữ hiện dần.
- **Ảnh hưởng:** SE-016 giữ nguyên 1,5n, nhưng phụ thuộc hàng đợi của SE-011. Lý do thêm để SE-011 làm đúng retry/idempotency.
- **Tạm chốt:** Có.

**Q-M4-5 — Câu hỏi nối tiếp chỉ truy hồi theo câu mới nhất**
- **Ưu điểm:** Không tốn thêm một lượt LLM mỗi câu hỏi, và dễ giải thích trong đồ án.
- **Nhược điểm:** Câu hỏi kiểu "còn điều 5 thì sao?" có thể truy hồi kém.
- **Ảnh hưởng:** Bản đầu không tốn thêm việc. Nếu TL-009/SE-017 cho thấy kém, thêm bước viết lại câu hỏi (khoảng 0,5n).
- **Tạm chốt:** Có. Sẽ đo lại khi có TL-009.

**Cần CTO trả lời:**
1. Đồng ý tạm chốt Q-M4-2…5 theo đề xuất? (có/không)
2. Q-M4-1 chọn hai lối vào hay chỉ trang Tài liệu?
3. Duyệt TL-008 khi AC4 còn NOT VERIFIED? Nếu duyệt, SE-014 vẫn chỉ chuyển `Sẵn sàng` sau khi SE-011 merge và AC4 đạt.

## Kết quả review
Vòng 1 bàn giao 17/11/2026. **CTO review vòng 6 (17/11/2026): APPROVED WITH CONDITIONS** — chấp thuận kiến trúc để chuẩn bị Module 4; chốt Q-M4-1…5. Điều kiện: AC4 giữ NOT VERIFIED tới khi đối chiếu payload Qdrant thật của SE-011; chưa đóng TL-008. SE-014 → `Sẵn sàng` chỉ khi SE-011 merge **và** AC4 đạt; SE-016 sau SE-012 merge; SE-015 sau SE-014.

## Lịch sử review
### Checklist vòng 1
**Task hoặc yêu cầu** — TL-008 · [module-4-rag.md](../design/module-4-rag.md) · cơ sở `ef2a029` · vòng 1
**Kết luận** — Thiết kế đủ cho SE-014…SE-016: điểm nối với `ChatService.streamAnswer` (đọc code thật), dữ liệu, API, truy hồi theo quyền, thiếu căn cứ không cần ngưỡng, xác minh trích dẫn, tóm tắt chạy nền, 13 ca kiểm thử service thật.
**Checklist**
- [x] AC1 — 8 FR (đề cương: tóm tắt, hỏi–đáp kèm trích dẫn, tối ưu tiếng Việt, khung đánh giá) gắn task — [mục 2](../design/module-4-rag.md#2-chức-năng-function-spec)
- [x] AC2 — thiếu căn cứ: chặn cứng khi 0 đoạn / tài liệu không còn hợp lệ (không gọi LLM); câu từ chối cố định nhận diện bằng so khớp chuỗi; `RAG_MIN_SCORE` tắt mặc định; trích dẫn chỉ lấy từ payload Qdrant, `[n]` ngoài khoảng bị bỏ, không nguồn hợp lệ → `ungrounded` — [mục 6](../design/module-4-rag.md#6-truy-hồi-thiếu-căn-cứ-xác-minh-trích-dẫn)
- [x] AC3 — kiểm Mongo (`userId`, `READY`, chưa xóa) + lọc Qdrant `userId` + `documentId`; `404` đồng nhất; R4–R6 — [mục 5, 11](../design/module-4-rag.md#11-kiểm-thử-bắt-buộc-service-thật)
- [ ] AC4 — đối chiếu payload Qdrant **thật** của SE-011: NOT VERIFIED (SE-011 chưa có code) — kiểm khi SE-011 bàn giao; thiết kế dựa trên payload đã chốt ở [Module 3 mục 4.3](../design/module-3-documents.md#43-qdrant)
- [x] AC5 — CTO duyệt kiến trúc có điều kiện 17/11/2026 (review vòng 6); chốt Q-M4-1…5. **Nguồn:** chỉ thị CTO review vòng 6

**Trạng thái và bước tiếp theo** — Chờ Review.

## Phản hồi UI
Không áp dụng (tài liệu).
