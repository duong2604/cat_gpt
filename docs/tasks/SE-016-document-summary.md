# SE-016 — Module 4: tóm tắt tài liệu

Trạng thái: Done
Người phụ trách: Senior Dev · Ưu tiên: **P1** (CTO 18/11/2026 (chỉ thị chuẩn bị Module 4)) · Ước lượng: 1,5 ngày làm việc
Phụ thuộc (gate): [SE-012](SE-012-documents-txt-frontend.md) merge **và** [SE-014](SE-014-rag-qa-backend.md) hoàn thành (dùng chung export Module 3 + cách gọi LLM); kiến trúc TL-008 đã duyệt. **Đạt 20/11/2026** (SE-012 `cd386e5`, SE-014 `124ccee`); thứ tự CTO 19/11: sau SE-015 (Done `3cf1d73`); TL chuyển `Sẵn sàng`
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — 20/11/2026 · bàn giao review — 20/11/2026 · hoàn tất — 20/11/2026
Chốt: 17/11/2026 — Q-M4-4 (job nền); nội dung task chuẩn bị 18/11/2026
SHA cơ sở: `origin/develop` @ `3cf1d73`
PR: https://github.com/duong2604/cat_gpt/pull/32 (head `9679358`, merge `7ff3c62`)

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
**TL 20/11/2026: Đạt sau 3 vòng, đã merge.** [PR #32](https://github.com/duong2604/cat_gpt/pull/32) · SHA đã review `9679358` (code `7bbddda`) · merge vào `develop` @ `7ff3c62`. Vòng 1 Cần sửa: hộp thoại hiện markdown thô. Vòng 2 Cần sửa: tóm tắt bị cắt bởi `max_output_tokens`, sửa bằng prompt, không đổi cấu hình. Chi tiết: [Review vòng 3](#review-vòng-3).

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

### Checklist vòng 2 (sửa theo Review vòng 1)

Commit: `4fbabb8` (hộp thoại dùng `Markdown` của Chat; worker cảnh báo khi lượt LLM bị cắt; ghi chép yêu cầu sửa). Gates: `tsc`, `lint`, `pnpm --filter @cat-gpt/api test` 83/83 đều OK; web `tsc` và `lint` OK. Build web không chạy lại ở vòng này (web dev đang chạy); CI trên PR sẽ kiểm build.

| Yêu cầu | Kết quả | Bằng chứng |
|---|---|---|
| Hộp thoại hiển thị markdown (đậm, danh sách), không còn `**` | Đạt: API trả bản tóm tắt có `**` và `- `; UI hiển thị chữ đậm và gạch đầu dòng đúng | Ảnh: desktop en sáng; desktop vi tối; 375px vi tối |
| 375px không tràn ngang trong hộp thoại | Đạt: `scrollWidth = clientWidth` (374) cả trang và hộp thoại (JS trong iframe 375px) | Đo DOM |
| Desktop + 375px, sáng + tối, vi + en | Đã kiểm: desktop sáng/en, desktop tối/vi, 375 tối/vi. **Chưa kiểm**: desktop sáng/vi, 375 sáng, 375 en, và tối/en | Ảnh đính kèm như trên |
| Cảnh báo khi lượt LLM bị cắt (không bắt buộc) | Đã làm: log `WARN documentId=… job=summarize bản con bị cắt do giới hạn đầu ra (N ký tự)`, chỉ id và số ký tự. Đã kích hoạt trên tài liệu `noi-bo-nghi-phep` | Log API `api-v2` |
| Không đổi prompt, backend, `LLM_MAX_OUTPUT_TOKENS` | Đạt | Diff `4fbabb8` |

**Phát hiện mới (cần TL quyết định):** bản tóm tắt `noi-bo-nghi-phep` (một nhóm, một lần gọi LLM) vẫn bị cắt ở `max_output_tokens` (500) với 1550 ký tự, và hộp thoại dừng giữa câu. Tức là giới hạn đầu ra làm cắt cả tài liệu ngắn, không chỉ bản nhóm. Chưa nâng giới hạn theo yêu cầu.

**Dọn dữ liệu thử của vòng 2:** tài liệu thử `6aff37ce…` tạo bởi `tl-review-se016-a` đã xóa theo id (204), tài khoản đếm lại 0 tài liệu. Hai tài khoản `tl-review-se016-a/b` giữ lại cho TL.

**Giới hạn còn lại (cập nhật):**
- Bản tóm tắt bị cắt bởi `LLM_MAX_OUTPUT_TOKENS` (xem phát hiện trên). Cần quyết định của TL/CTO.
- Map-reduce một lượt; với nhiều nhóm bản gộp có thể vượt `RAG_SUMMARY_GROUP_CHARS`.
- Danh sách tài liệu vẫn trả kèm `summary` (payload lớn hơn).

#### Review vòng 2

TL review vòng 2 SE-016 (`7e7375a`, code `4fbabb8`). Phần markdown và log WARN khi bị cắt: diff **đạt**. Tuy vậy, việc SE phát hiện vẫn khiến **AC1 chưa đạt**: một bản tóm tắt dừng giữa câu thì không dùng được, kể cả với tài liệu ngắn. TL quyết **Cần sửa vòng 2**. Hãy ghi nguyên văn yêu cầu dưới đây vào `#### Review vòng 2` trong task SE-016.

1. **AC1: bản tóm tắt bị cắt bởi `max_output_tokens`** (500 token).
   - Tái hiện: tóm tắt `noi-bo-nghi-phep.txt`, log có WARN, hộp thoại dừng giữa câu.
   - Hướng sửa: **chỉ sửa prompt**, tức `SUMMARY_SYSTEM_PROMPT` và/hoặc `mapPrompt`/`reducePrompt`. Yêu cầu độ dài cụ thể, ví dụ "tối đa khoảng 150–200 từ, kết thúc trọn câu", áp dụng cho cả bản nhóm lẫn bản gộp.
   - Không làm: nâng `LLM_MAX_OUTPUT_TOKENS`, thêm biến cấu hình, đổi `LlmProvider` hay kiến trúc. Nếu chỉnh prompt mà vẫn bị cắt, dừng lại và báo TL số liệu; TL sẽ trình CTO.
   - Kiểm lại trên API thật với 3 tài liệu TL-009: `noi-bo-nghi-phep` (1 nhóm), `wiki-pho` và `wiki-vinh-ha-long` (nhiều nhóm). Cần thấy: **0 dòng WARN "bị cắt"** trong cửa sổ chạy; tóm tắt kết thúc trọn câu và vẫn nêu ý chính. Ghi số ký tự từng bản; dán đoạn cuối mỗi bản (≤ 1 câu).
   - Unit test hiện có phải vẫn xanh.
2. Chụp nốt các ảnh UI còn thiếu: desktop sáng/vi và 375px sáng/en.

Sau khi sửa: cùng PR #32, `### Checklist vòng 3`, chuyển `Chờ Review`, báo SHA mới. Giữ app chạy ở SHA mới. Dọn dữ liệu theo id.

### Checklist vòng 3 (sửa theo Review vòng 2)

Commit: code `7bbddda` (chỉ `document-summary.ts`: prompt; không đổi backend, `LlmProvider`, `LLM_MAX_OUTPUT_TOKENS`). Gate: API `tsc` OK, `lint` OK, `pnpm test` 83/83 OK.

Thay đổi prompt: `SUMMARY_SYSTEM_PROMPT` thêm "Luôn kết thúc bằng câu trọn vẹn, không dừng giữa câu"; `mapPrompt` yêu cầu "tối đa khoảng 100–150 từ, kết thúc trọn câu"; `reducePrompt` yêu cầu "tối đa khoảng 150–200 từ, kết thúc trọn câu". Bản nhóm đặt ngắn hơn để bản gộp còn chỗ trong 500 token.

Kiểm trên API thật (`LLM_PROVIDER=openai`, `gpt-5.4-mini`, `LLM_MAX_OUTPUT_TOKENS=500` giữ nguyên), tài khoản thử `tl-review-se016-a`:

| Tài liệu TL-009 | Số nhóm | Trạng thái | Độ dài | Dòng WARN "bị cắt" | Câu cuối (trích) |
|---|---|---|---|---|---|
| `noi-bo-nghi-phep.txt` | 1 | READY (3 s) | 683 ký tự, ~151 từ | 0 | "…làm việc từ xa tối đa 4 ngày/tháng và phòng Nhân sự là đầu mối hỗ trợ." |
| `wiki-pho.txt` | nhiều | READY (14 s) | 910 ký tự, ~204 từ | 0 | "…tháng 8/2024 phở Hà Nội cùng phở Nam Định được công nhận là Di sản văn hóa phi vật thể quốc gia." |
| `wiki-vinh-ha-long.txt` | nhiều | READY (27 s) | 965 ký tự, ~211 từ | 0 | "…nên đã có nhiều biện pháp bảo tồn được triển khai." |

- Cửa sổ chạy: 0 dòng WARN "bị cắt" trên 11 lần gọi `usage model=` (log `api-v3`).
- Cả ba bản kết thúc trọn câu và vẫn nêu ý chính (tài liệu quy định nghỉ phép; phở; Vịnh Hạ Long).
- `wiki-vinh-ha-long` dài khoảng 211 từ, hơi vượt khung 150–200 từ của bản gộp nhưng vẫn trọn câu; ghi nhận, không ảnh hưởng AC1.

**Ảnh UI còn thiếu (vòng 2) — đã chụp:**
- Desktop sáng/vi: hộp thoại tóm tắt `wiki-vinh-ha-long` (bản mới, kết thúc trọn câu).
- 375px sáng/en: trang Tài liệu (bố cục đúng, không tràn) và hộp thoại "Document summary".
- Đã có từ vòng 2: desktop sáng/en, desktop tối/vi, 375px tối/vi. Chưa kiểm: desktop tối/en và 375px en/tối — không nằm trong yêu cầu vòng 3.

**Dọn dữ liệu theo id:** 3 tài liệu thử vòng 3 (`6aff390f…dcd6a`, `…dcd6c`, `…dcd6e`) do `tl-review-se016-a` tạo đã xóa (204); tài khoản đếm lại 0 tài liệu. Hai tài khoản `tl-review-se016-a/b` giữ lại.

#### Review vòng 3
**Task** — SE-016 · PR https://github.com/duong2604/cat_gpt/pull/32 · SHA đã review `9679358` · vòng 3
**Kết luận** — Đạt. Merge bằng `--match-head-commit 9679358` → `develop` @ `7ff3c62`.
**Checklist** (TL tự kiểm; API chạy `7bbddda`, `LLM_PROVIDER=openai`, chế độ `demo`; tài khoản tạm `tl-review-se016-a/b`)
- [x] AC1 — Đạt. Vòng 1: TL đối chiếu bản tóm tắt với nguồn, đúng ý chính, không thấy ý bịa. Vòng 3: TL chạy lại 3 tài liệu `noi-bo-nghi-phep` (4 đoạn, 1 nhóm), `wiki-pho` (33 đoạn), `wiki-vinh-ha-long` (77 đoạn) → `202` → READY sau 4 / 10 / 14 s; 149 / 212 / 199 từ; cả ba kết thúc trọn câu; log có **0** dòng "bị cắt" trên 11 lần gọi LLM. Diff vòng 3 chỉ sửa prompt (`document-summary.ts`).
- [x] AC2 S1 — Đạt — gọi lại khi READY → `200`; số dòng `usage model=` không tăng (TL đếm 3/3 và 7/7).
- [x] AC3 — Đạt — B → `404` (POST summary, GET tài liệu của A); ẩn danh → `401`. `staff` và trường hợp chưa READY: theo bằng chứng SE + code (`getOwnedOrThrow`, `DOCUMENT_NOT_READY`).
- [x] AC4 — Đạt (bằng chứng SE + đọc code): S2 lưu có điều kiện `deletedAt: null`; FAILED sau `attempts = 2` → `DOCUMENT_SUMMARY_FAILED`; tóm tắt lại sau FAILED → 202 (xóa job FAILED cũ rồi xếp lại).
- [x] UI — Đạt. TL tự kiểm vòng 1: hộp thoại, trạng thái "đang tóm tắt" + polling → READY, 375px không tràn. Vòng 2: dùng component `Markdown` của Chat (TL đọc diff, 1 dòng); ảnh sáng/tối, vi/en, 375px theo bằng chứng SE.
- [x] AC5 — Đạt — tại `9679358`: api test 83/83, `typecheck`/`lint`/`build` exit 0; CI `build` SUCCESS; CLEAN. Có checklist hai vai.
- [x] Dữ liệu thử TL — Đạt — xóa theo id ghi lúc tạo (vòng 1: 3 tài liệu, vòng 3: 3 tài liệu), Qdrant theo `documentId` = 0. Tài khoản tạm: SE xóa.

**Nhận xét không chặn:**
- Danh sách tài liệu trả kèm `summary` (payload lớn hơn).
- Reduce chỉ một lượt (`ponytail:` trong code).
- Độ dài tóm tắt phụ thuộc prompt, `LLM_MAX_OUTPUT_TOKENS` = 500 chung với Chat; log WARN khi bị cắt đã có để theo dõi.

**Dọn nhánh sau merge** — nhánh remote: TL xóa sau khi SE chuyển khỏi nhánh.
**Trạng thái** — Done.

## Phản hồi UI
Hộp thoại "Tóm tắt tài liệu" (vi/en) hiển thị trạng thái và bản tóm tắt dạng markdown; mục menu "Tóm tắt" ở dòng tài liệu READY. Ảnh lưu tại thư mục ảnh chụp của Chrome, không commit vào repo.
