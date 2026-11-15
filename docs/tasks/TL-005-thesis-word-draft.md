# TL-005 — Dựng bản Word nháp báo cáo đồ án từ bộ nguồn đã duyệt

Trạng thái: Sẵn sàng
Người phụ trách: TL · Thực hiện: **phiên AI viết Word riêng** (prompt ở cuối file), TL review · Ưu tiên: P1 · Ước lượng: 2 ngày làm việc (nháp) + 0,5 ngày (cập nhật 25/11)
Phụ thuộc: [TL-004](TL-004-thesis-source-pack.md) vòng 3 đã duyệt (khách hàng, 15/11/2026). Cập nhật 25/11 phụ thuộc tích hợp PR #3 → PR #4 (23–24/11) và TL-004 vòng 4
Hạn bàn giao review: bản nháp — Chờ chốt (đề xuất 18/11/2026); bản cập nhật — **25/11/2026** (khách hàng, 15/11/2026) · Hạn hoàn tất: Chờ chốt
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 15/11/2026 — khách hàng duyệt bộ nguồn vòng 3 tại `da66569` để dựng bản Word nháp; theo bố cục 4 chương và quy định Q1–Q15; dẫn trực tiếp tới PDF quy định
**SHA nguồn (cố định cho bản nháp): `origin/develop` @ `da66569`** (bộ nguồn khách hàng duyệt). Commit tạo TL-005 chỉ **thêm** `docs/thesis/diagrams/*.mmd` (tách nguyên văn các khối Mermaid của `02`, `03` tại `da66569`) và hồ sơ task; nội dung `docs/thesis/*.md`, `evidence/`, `images/`, `sources/` giữ nguyên — kiểm bằng `git diff --quiet da66569 <SHA làm việc> -- docs/thesis ':!docs/thesis/diagrams'`. Không dùng nội dung `develop` mới hơn cho bản nháp
PR: <ghi khi bàn giao>

## Mục tiêu
Một file `.docx` nháp hoàn chỉnh về cấu trúc và định dạng theo quy định Khoa, nội dung lấy **chỉ** từ bộ nguồn `docs/thesis/` tại `da66569`, mô tả đúng trạng thái tại SHA đó; mục sinh viên chưa cung cấp để nhãn `CẦN BỔ SUNG`.

## Output
- `docs/thesis/word/bao-cao-datn-nhap-da66569.docx` (lần 2: `…-<sha nguồn mới>.docx`, giữ file cũ tới khi bản mới được duyệt).
- `docs/thesis/word/bao-cao-datn-nhap-da66569.pdf` — bản render để kiểm bố cục (xuất từ Microsoft Word có trên máy; không có LibreOffice).
- `docs/thesis/diagrams/` — file nguồn sơ đồ (`.mmd`, đã có D1–D4, D9) + ảnh xuất (`.svg` hoặc `.png`) dùng trong Word; sơ đồ vẽ mới theo mục "Sơ đồ" dưới đây.
- PR `docs/thesis-word` → `develop`, checklist vòng 1 trong file này. **Không** đưa file Word vào repo nếu có thông tin liên lạc cá nhân.

## Nguồn bắt buộc (tại `da66569`)
| Nguồn | Dùng cho |
|---|---|
| [docs/thesis/README.md](../thesis/README.md) | Trạng thái module, ánh xạ chương → nguồn, danh sách `CẦN BỔ SUNG` B1–B13 (mục 6) |
| [01-outline-and-sources.md](../thesis/01-outline-and-sources.md) | Tên đề tài, mục tiêu, phạm vi (Mở đầu); bố cục chương (mục 5); tài liệu tham khảo R1–R35 (mục 7); quy định Q1–Q15 (mục 8) |
| [02-requirements-and-design.md](../thesis/02-requirements-and-design.md) | Chương 2; danh mục sơ đồ (mục 9) |
| [03-implementation.md](../thesis/03-implementation.md) | Chương 3 |
| [04-validation-and-results.md](../thesis/04-validation-and-results.md), [evidence/test-cases.md](../thesis/evidence/test-cases.md), [images/](../thesis/images/) | Chương 4, danh mục hình, Kết luận |
| [sources/de-cuong-datn.md](../thesis/sources/de-cuong-datn.md) | Bìa, Mở đầu (tên đề tài nguyên văn) |
| **PDF quy định trình bày (bản gốc)** — `C:\Users\duong\Downloads\Quy dinh va huong dan trinh bay DATN .signed.pdf`; bản sao: `D:\workspace\buggysoft\cat_gpt-tl\docs\thesis\sources\originals\quy-dinh-trinh-bay-datn.signed.pdf` (MD5 `c972b9dcac7e3abc30de63f5920a5411`); bản chép theo trang: [sources/quy-dinh-trinh-bay-datn.md](../thesis/sources/quy-dinh-trinh-bay-datn.md) | Đối chiếu Q1–Q15 khi dựng style, bìa (tr. 4–5), ví dụ bảng/hình (tr. 2–3) |

## Trạng thái phải mô tả đúng (tại `da66569`)
| Phần | Cách viết trong bản nháp |
|---|---|
| Module 1 — xác thực, phiên, hồ sơ, quản trị | **Đã tích hợp** (PR #1) |
| Module 2 — Chat, streaming SSE, Dừng/Tạo lại | **Đã tích hợp, câu trả lời là văn bản mẫu** (`MockLlmProvider`, PR #2) |
| Ảnh đại diện chỉ chính chủ xem được | **Đã kiểm thử trên PR #3 (`d60864a`), chưa tích hợp tại phiên bản này** |
| Trả lời bằng OpenAI thật, giới hạn 1.000 token, nhãn "bị cắt" | **Đã kiểm thử trên PR #4 (`e1fda76`), chưa tích hợp tại phiên bản này** |
| Module 3–4 | **Thiết kế và giao diện minh họa** (dữ liệu giả ở nhánh preview) — không viết là đã hiện thực |
| Đánh giá RAG, Docker/Nginx, Module 5 | Hướng phát triển |
| Chương 4 | Chỉ dùng ca kiểm thử có nguồn trong `04` mục 3 (TC-M1-01…12, TC-M2-01…11), giữ mã ca; không thêm số liệu (không %, không số tải) |

## Quy tắc dựng Word (Q1–Q15 — [01 mục 8](../thesis/01-outline-and-sources.md#8-quy-định-trình-bày-của-khoa-áp-dụng-khi-dựng-word), PDF ở trên)
- Thứ tự phần: Bìa (Q15, tr. 4) → Bìa phụ (tr. 5) → Lời cảm ơn → Mục lục (**bắt buộc**, tự sinh từ Heading) → Danh mục từ viết tắt → Danh mục bảng → Danh mục hình → Mở đầu → Chương 1–4 → Kết luận và kiến nghị → Danh mục tài liệu tham khảo → Phụ lục (Q1, tr. 1 §1).
- Trang A4; lề trên 2,5 cm, dưới 2,5 cm, trái 3 cm, phải 2 cm; số trang giữa, phía trên (Q3, tr. 1–2 §2.1).
- Style: Heading 1 — Times New Roman 18 pt đậm, căn giữa, Before 0/After 12, mỗi chương sang trang mới; Heading 2 — 16 pt đậm, trái, 6/6; Heading 3 — 14 pt đậm, trái, 6/6, chỉ khi có ≥ 2 tiểu mục; Normal — 13 pt, căn đều, thụt dòng đầu 1 cm, giãn dòng 1,2 (Q4–Q7, tr. 2 §2.2–2.3).
- Hình/bảng đánh số theo chương (Hình 4.1, Bảng 2.1); **tên bảng phía trên, tên hình phía dưới**; hình/bảng từ nguồn ngoài ghi "Nguồn: …" và có trong danh mục tài liệu tham khảo (Q8–Q10, tr. 2–3 §2.4). Dùng chú thích Word (Caption) để sinh danh mục hình/bảng.
- Danh mục tài liệu tham khảo: **chỉ** tài liệu được trích dẫn trong bài (Q11); kiểu trích dẫn IEEE `[n]` theo thứ tự xuất hiện (quy định không nêu kiểu — đã ghi ở 01 mục 8).
- Viết tắt: lần đầu viết đầy đủ kèm viết tắt trong ngoặc; danh mục xếp ABC (Q13).
- Văn phong báo cáo, tiếng Việt; không chép nguyên văn bảng Markdown nội bộ (mã task, đường dẫn file) vào thân bài khi không cần — đường dẫn mã nguồn đưa vào Phụ lục hoặc chú thích ngắn.

## `CẦN BỔ SUNG` — dạng và vị trí
Chèn đúng chuỗi `[CẦN BỔ SUNG: B<n> — <nội dung>]` (tô vàng) tại vị trí: B1 căn cứ phê duyệt đề cương (Mở đầu); B2 Lời cảm ơn; B3 năm trên bìa; B4–B5 khảo sát hiện trạng, so sánh giải pháp, tiêu chí chọn công nghệ/LLM (Mở đầu, 1.1, 1.2, 1.4); B6 so sánh embedding (chỉ như kế hoạch); B7 sơ đồ use case (mục "Sơ đồ"); B11 số liệu tải/unit test Module 1–2 (Chương 4); B12 danh mục viết tắt (nếu chưa lập đủ); B13 ảnh thay sau tích hợp. Liệt kê toàn bộ chỗ đã chèn trong checklist bàn giao.

## Ảnh (Chương 4 — [04 mục 4](../thesis/04-validation-and-results.md#4-danh-mục-hình))
| Ảnh | Dùng trong bản nháp | Sau tích hợp (25/11) |
|---|---|---|
| H1-01…H1-06, H2-01…H2-03 (`develop`, 1536 px) | Dùng chính thức — Hình 4.1–4.9 | Giữ |
| H1-07 (768 px), H1-08 (238 × 432), H2-05 (768 px) — chụp trên PR #3/#4 | **Tạm dùng** — Hình 4.10–4.12, chú thích ghi "(phiên bản thử nghiệm trên PR #n)"; đánh dấu B13 | **Thay** bằng ảnh ≥ 1280 px chụp trên `develop` sau khi xác minh (TL-004 vòng 4) |
| H2-04 (OpenAI stream) | **Không dùng** (tiêu đề lỗi mã hóa) | Thay bằng ảnh mới nếu có |
| Nhãn "Đã dừng" | Chưa có ảnh — không chèn, ghi B13 | Chụp mới (stream OpenAI đủ lâu để bấm Dừng) |

## Sơ đồ — đối chiếu B7 với checklist TL-004 vòng 3 và Q12
Q12 (QĐ tr. 2 §2.4): hình thiết kế vẽ bằng phần mềm thiết kế, **file hình vẽ nộp trên CD**, không sao chép. Mermaid là công cụ vẽ sơ đồ dạng mã; file `.mmd` là file nguồn mở lại và sửa được. **Đề xuất của TL:** chấp nhận `.mmd` + ảnh xuất làm file nguồn nộp kèm; nếu GVHD yêu cầu công cụ khác thì vẽ lại (T1 dưới đây).

| Mã | Sơ đồ | File nguồn (tách nguyên văn từ `da66569`) | Kết luận |
|---|---|---|---|
| D1 | Kiến trúc tổng thể | `docs/thesis/diagrams/D1-kien-truc-tong-the.mmd` (tách từ 02 mục 4) | **Có file nguồn** — cần **xuất** SVG/PNG |
| D2 | ERD | `docs/thesis/diagrams/D2-erd.mmd` | Có file nguồn — cần xuất |
| D3 | Tuần tự đăng nhập/gia hạn phiên | `docs/thesis/diagrams/D3-tuan-tu-dang-nhap.mmd` | Có file nguồn — cần xuất |
| D4 | Tuần tự gửi tin nhắn + streaming | `docs/thesis/diagrams/D4-tuan-tu-gui-tin-nhan.mmd` | Có file nguồn — cần xuất |
| D9 | Cấu trúc module | `docs/thesis/diagrams/D9-cau-truc-module.mmd` (tách từ 03 mục 1) | Có file nguồn — cần xuất |
| D5 | Dừng giữa chừng | Chưa có (văn bản 02 mục 7.3) | **Vẽ mới** bằng Mermaid (sequence) trong TL-005 |
| D6 | Trạng thái tin nhắn trợ lý | Chưa có (02 mục 7.4) | **Vẽ mới** bằng Mermaid (`stateDiagram`); tại `da66569` chỉ `COMPLETED`/`STOPPED`/`ERROR` đã tích hợp, `TRUNCATED` ghi "[PR #4]" |
| D10 | Kiến trúc dự kiến Module 3–4 | Chưa có (02 mục 8) | **Vẽ mới** bằng Mermaid, chú thích "thiết kế dự kiến" |
| D7, D8 | Use case tổng quát; use case phân rã Module 1, 2 | Chưa có (02 mục 2.1, 3) | **Cần vẽ bằng công cụ UML** (Mermaid không có ký hiệu use case chuẩn) — `CẦN BỔ SUNG` B7, sinh viên; bản nháp để khung chú thích + B7 |
| D11 | Triển khai Docker | — | Không đưa vào bản nháp (hướng phát triển) |

Xuất ảnh: Mermaid CLI (`@mermaid-js/mermaid-cli`) cần cài gói và trình duyệt headless — **phải được người dùng cho phép** trước khi chạy; nếu không, người dùng xuất bằng https://mermaid.live (dán nội dung `.mmd` → tải SVG/PNG) và đặt cùng tên file trong `docs/thesis/diagrams/`. Không chèn sơ đồ vào Word khi chưa có ảnh xuất — để khung + ghi chú.

## Checklist nghiệm thu (checklist bàn giao Word)
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| W1 | **Nội dung đúng nguồn:** mọi nhận định lấy từ bộ nguồn tại `da66569`; trạng thái module đúng bảng "Trạng thái phải mô tả đúng"; Chương 4 chỉ dùng ca có mã; không thêm số liệu không có nguồn | Đối chiếu từng chương với file nguồn; ghi lệch nếu có |
| W2 | **Trang bìa và cấu trúc:** bìa + bìa phụ theo QĐ tr. 4–5 (tên đề tài nguyên văn đề cương 30/09/2026); đủ và đúng thứ tự phần Q1 | So với PDF trang 1, 4, 5 |
| W3 | **Mục lục** tự sinh từ Heading 1–3, cập nhật được; số trang khớp | Mở Word, Update field; so số trang |
| W4 | **Định dạng:** A4, lề, số trang giữa-trên; Heading 1–3, Normal đúng Q3–Q7; chương mới sang trang | Kiểm style trong Word; kiểm trên PDF render |
| W5 | **Đánh số hình/bảng** theo chương, liên tục, không trùng; danh mục hình/bảng tự sinh | Caption + danh mục |
| W6 | **Chú thích:** tên bảng trên, tên hình dưới; hình nguồn ngoài có "Nguồn: …"; ảnh tạm ghi rõ phiên bản PR | Rà từng hình/bảng |
| W7 | **Trích dẫn:** mỗi `[n]` trong bài có mục tương ứng; mỗi mục trong danh mục đều được trích (Q11); kiểu IEEE thống nhất | Đếm, đối chiếu hai chiều |
| W8 | **Danh mục tài liệu tham khảo** chỉ gồm R đã dùng, đủ tác giả/tổ chức, tiêu đề, năm/phiên bản, URL, ngày truy cập | Đối chiếu 01 mục 7 |
| W9 | **File nguồn sơ đồ:** mỗi sơ đồ trong Word có file `.mmd` (hoặc file công cụ khác) + ảnh xuất trong `docs/thesis/diagrams/`; D7, D8 để B7 | Liệt kê sơ đồ ↔ file |
| W10 | **`CẦN BỔ SUNG`:** liệt kê đủ vị trí và mã B; không tự viết thay sinh viên | Tìm chuỗi `CẦN BỔ SUNG` |
| W11 | **Kiểm tra bố cục sau render:** xuất PDF bằng Microsoft Word (`ExportAsFixedFormat`), mở PDF xem: không vỡ font tiếng Việt, ảnh không tràn lề, bảng không cắt cột, tên hình/bảng không tách trang, mục lục hiện số trang; ghi số trang và trang đã xem | Ảnh chụp/trang PDF |
| W12 | **An toàn dữ liệu:** không SĐT/email cá nhân, mật khẩu, khóa API trong `.docx`/PDF; chỉ tài khoản thử trong ảnh | Tìm chuỗi trong `.docx` (unzip `word/document.xml`) |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| T1 | File Mermaid `.mmd` + ảnh xuất có được coi là "file hình vẽ bằng phần mềm thiết kế" (Q12) không? | Có; nếu GVHD yêu cầu công cụ khác thì vẽ lại | Chờ khách hàng/GVHD |
| T2 | Đặt file Word trong repo công khai (`docs/thesis/word/`)? | Có, vì chỉ chứa thông tin đã có trong repo (tên, MSV, lớp); không có liên lạc cá nhân | Chờ khách hàng |

## Kết quả review
Chưa có.

## Lịch sử review
Chưa có. Bàn giao bản nháp: `### Checklist vòng 1` (W1–W12, kèm SHA nguồn `da66569`, đường dẫn `.docx`/PDF, danh sách `CẦN BỔ SUNG`), trạng thái `Chờ Review`. Cập nhật 25/11: `### Checklist vòng 2` với SHA nguồn mới (TL-004 vòng 4), ảnh đã thay.

## Phản hồi UI
Không áp dụng (tài liệu).

## Prompt cho phiên AI viết Word
```
Bạn dựng bản Word nháp báo cáo đồ án CAT GPT theo docs/tasks/TL-005-thesis-word-draft.md. Làm trong một worktree riêng (không dùng D:\workspace\buggysoft\cat_gpt hay cat_gpt-tl):
  git fetch origin; git -C D:\workspace\buggysoft\cat_gpt-tl worktree add ..\cat_gpt-word -b docs/thesis-word origin/develop
  Ghi SHA làm việc; kiểm: git diff --quiet da66569 HEAD -- docs/thesis ":!docs/thesis/diagrams" (phải không khác; có khác thì dừng, báo TL).
1. Đọc TL-005, rồi docs/thesis/README.md và 01–04, evidence, sources tại da66569. Đối chiếu quy định với PDF gốc: C:\Users\duong\Downloads\Quy dinh va huong dan trinh bay DATN .signed.pdf.
2. Viết .docx (dùng skill docx nếu có; style Word thật cho Heading 1–3, Normal, Caption; mục lục, danh mục hình/bảng là field tự sinh). Chỉ dùng nội dung nguồn; trạng thái module theo bảng trong TL-005; chèn [CẦN BỔ SUNG: B<n> — …] ở mọi chỗ thiếu.
3. Sơ đồ: dùng file .mmd trong docs/thesis/diagrams/; vẽ thêm D5, D6, D10 bằng Mermaid. Xuất ảnh cần cài công cụ → hỏi người dùng trước; không được thì để khung + ghi chú.
4. Xuất PDF bằng Microsoft Word, xem từng trang theo W11. Chạy checklist W1–W12.
5. Bàn giao: PR docs/thesis-word → develop (chỉ docs/thesis/word/**, docs/thesis/diagrams/**, file TL-005, dòng TL-005 mục lục), ghi "### Checklist vòng 1" vào TL-005, trạng thái Chờ Review. Không merge, không sửa file nguồn 01–04.
```
