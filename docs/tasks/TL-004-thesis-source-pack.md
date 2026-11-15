# TL-004 — Bộ tài liệu nguồn cho báo cáo đồ án (Markdown)

Trạng thái: Chờ Review (vòng 2, 15/11/2026) — vòng 3 (sau review SE-008) 19/11; vòng 4 (sau tích hợp) 25/11
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 3,5 ngày làm việc, chia 4 mốc (bảng dưới)
Phụ thuộc: [SE-008](SE-008-thesis-implementation-evidence.md) (`03-implementation.md` + bảng bằng chứng); cập nhật trạng thái Module 1–2 sau khi tích hợp PR #3 (SE-002) và PR #4 (SE-007)
Hạn bàn giao review: **19/11/2026** (vòng 2, bộ nguồn trước demo) · cập nhật theo `develop` sau tích hợp: **25/11/2026** (CTO, 15/11/2026) · Hạn hoàn tất: Chờ chốt
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 (vòng 1, vòng 2) · hoàn tất —
Chốt: 15/11/2026 — khách hàng giao: tạo task TL, xây dựng bộ nguồn Markdown trong `docs/thesis/` để AI khác viết báo cáo Word (file Word khách hàng tự tạo sau); chia việc với Senior Dev (SE sở hữu `03-implementation.md` và bảng bằng chứng); thứ tự sau demo PR #3 → PR #4
SHA cơ sở: `origin/develop` @ `6ed0fbc` (15/11/2026)
PR: Không — tài liệu TL tích hợp trực tiếp lên `develop` theo đợt được giao; phần SE qua PR của SE-008

## Mục tiêu
Một bộ Markdown chính xác, truy vết được, đủ để một AI khác viết báo cáo đồ án tốt nghiệp bằng Word mà không phải tự suy đoán: biết đề tài và bố cục chương, biết tính năng nào **đã tích hợp**, **mới kiểm thử trên PR**, **chỉ có demo** hay **thuộc hướng phát triển**, và mỗi nhận định có nguồn (file, PR, commit, ca kiểm thử, ảnh).

## Output
- `docs/thesis/README.md` — điểm vào: phiên bản cơ sở, thứ tự đọc, ánh xạ chương → nguồn, trạng thái module, phần còn thiếu (TL).
- `docs/thesis/01-outline-and-sources.md` — đề tài, mục tiêu, phạm vi, đối tượng, bố cục chương, danh sách nguồn và tài liệu tham khảo (TL).
- `docs/thesis/02-requirements-and-design.md` — yêu cầu, tác nhân, ma trận quyền, kiến trúc, dữ liệu, API, luồng (TL).
- `docs/thesis/03-implementation.md` — hiện thực Module 1–2 ([SE-008](SE-008-thesis-implementation-evidence.md)).
- `docs/thesis/04-validation-and-results.md` — tổng hợp kiểm thử, danh mục hình, hạn chế, hướng phát triển (TL, từ bảng bằng chứng của SE-008).
- `docs/thesis/evidence/` (bảng ca kiểm thử) và `docs/thesis/images/` (ảnh) — SE-008 lập, TL review.

## Phạm vi
- Làm: tài liệu Markdown và ảnh minh họa; đối chiếu nhận định với code, PR, hồ sơ task.
- Không làm: file Word; sửa code; đổi bản demo `34b465d`; sửa file đang nằm trong PR #3/#4 (`docs/design/module-2-chat.md`, `docs/design/access-control.md`, `README.md`, các dòng SE-002…SE-004 của mục lục task) trước khi hai PR được tích hợp.

## Mốc và ước lượng

| Mốc | Nội dung | Ước lượng | Dự kiến | Song song với luồng review Senior Dev |
|---|---|---|---|---|
| M1 Chốt nguồn | Fetch `develop`, ghi SHA; đọc đề cương, báo cáo 27/10, quy định trình bày; bảng trạng thái module; đề cương chương; danh sách thiếu; tạo SE-008 | 0,5 ngày | 15/11 — **xong, vòng 1** | SE-002, SE-007 đã đạt review, chờ tích hợp sau demo |
| M2 Viết nội dung | Hoàn thiện `01`, `02` (kiến trúc, Module 1, luồng Chat có bằng chứng); khung `04` | 1 ngày | 16–17/11 | SE làm SE-008 (16–17/11) |
| M3 Thu thập bằng chứng | Review PR của SE-008, đối chiếu từng nhận định với code; tổng hợp `04` + danh mục hình | 1 ngày | 18–19/11 | SE bàn giao SE-008 18/11; SE bắt đầu SE-003 sau đó |
| M4 Bàn giao | (a) Trước demo: kiểm tra link, ảnh, SHA; bàn giao bộ nguồn trên `develop` — 19/11. (b) Sau tích hợp PR #3 → PR #4 (23–24/11): cập nhật trạng thái Module 1–2 theo `develop` — 25/11 | 0,5 + 0,5 ngày | 19/11; 25/11 | TL merge PR #3, PR #4 (23–24/11) |

## Nguồn yêu cầu
- Yêu cầu khách hàng 15/11/2026 (ba tin nhắn: tạo bộ nguồn; xác nhận SE-007 và thứ tự sau demo; phân công SE/TL) — ghi ở [báo cáo ngày 15/11 vòng 4](../reports/daily/2026-11-15.md#vòng-4--1900).
- Đề cương đồ án, báo cáo 27/10, quy định trình bày của Khoa — ngoài repo, mô tả ở [01 mục 6](../thesis/01-outline-and-sources.md#6-nguồn-sử-dụng).
- Function Spec / Basic Design: [module-1-auth.md](../design/module-1-auth.md), [module-2-chat.md](../design/module-2-chat.md), [access-control.md](../design/access-control.md), [ui-release-standards.md](../design/ui-release-standards.md).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | `README.md` ghi SHA cơ sở, thứ tự đọc, ánh xạ chương → nguồn, trạng thái module, phần còn thiếu | Yêu cầu 15/11 mục 2 | Đọc file |
| AC2 | Bảng module đủ cột Phạm vi theo đề cương / Kết quả đã xác minh / Trạng thái tích hợp / Nguồn / Phần còn thiếu; không có tỷ lệ % hoặc số liệu tải thiếu cách tính | Yêu cầu 15/11 mục 1 | Đọc + đối chiếu `git log origin/develop`, `gh pr view 3/4` |
| AC3 | SE-002, SE-007 ghi đúng mức: **đã kiểm thử trên PR, chưa tích hợp** cho tới khi xác minh trên `develop` | Yêu cầu 15/11 (tin 2 mục 1) | `gh pr view` + mục lục task |
| AC4 | Mọi nhận định trong `02`–`04` có nguồn (file:đường dẫn, PR, commit, ca kiểm thử) và phân biệt **thiết kế dự kiến** / **hiện thực đã kiểm chứng** | Yêu cầu 15/11 mục 2 | Đọc từng mục |
| AC5 | Danh mục hình: chú thích, màn hình, vai trò, SHA, đường dẫn ảnh mở được; ảnh không chứa tài khoản thật hoặc khóa API | Yêu cầu 15/11 mục 2 | Mở từng ảnh; `grep -ri "sk-"` |
| AC6 | Liên kết nội bộ không gãy | Quy ước tài liệu | Script kiểm tra link |
| AC7 | Không chứa thông tin cá nhân ngoài phạm vi đã có trong repo (SĐT, email cá nhân) | Quy tắc bảo mật | `grep` |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| T1 | Bản đề cương nào là bản đã duyệt? Tìm thấy 4 file ngày 09/09/2026; bản mới nhất `5250026_BuiVanDuong_LT_CNTT1_K29.1_Decuong DATN.docx` (16:29) | Dùng bản mới nhất | Chờ khách hàng — trong lúc chờ dùng bản mới nhất làm **nguồn tạm**, ghi rõ trong bộ nguồn (khách hàng, 15/11/2026). **Cập nhật 15/11/2026:** khách hàng chỉ định file nguồn `D:\workspace\5250026_BuiVanDuong_LT_CNTT1_K29.1_Decuong DATN.docx` (sửa 30/09/2026) — dùng làm nguồn chuẩn; file không có căn cứ phê duyệt (ô ký trống) → B1 `CẦN BỔ SUNG` |
| T2 | Bố cục chương: quy định Khoa chỉ bắt buộc phần đầu/cuối, số chương tùy đề tài | 4 chương theo [01 mục 5](../thesis/01-outline-and-sources.md#5-đề-xuất-bố-cục-chương) | **Chốt 15/11/2026 (CTO):** 4 chương |
| T3 | Module 3–4 ghi thế nào trong báo cáo khi chỉ có giao diện demo dữ liệu giả ở nhánh preview? | Ghi là "thiết kế + giao diện minh họa", không ghi đã hiện thực; chi tiết ở hướng phát triển | **Chốt 15/11/2026 (CTO):** thiết kế và giao diện minh họa |

## Kết quả review
- Vòng 1 (`2f003a0`): **CTO duyệt để tiếp tục triển khai** (15/11/2026) — chốt T2, T3; T1 chờ khách hàng.
- Vòng 2 (15/11/2026): đọc hai file khách hàng chỉ định, cập nhật `01`, `02`, `04`, README — [Checklist vòng 2](#checklist-vòng-2). Chờ khách hàng + CTO.
- Vòng 3 (19/11): sau review SE-008 — [kế hoạch](#kế-hoạch-vòng-2) (đánh số lại: review SE-008 thành vòng 3, cập nhật sau tích hợp thành vòng 4).

## Lịch sử review
### Checklist vòng 1
**Task hoặc yêu cầu** — TL-004 · `develop` cơ sở `6ed0fbc` · vòng 1 (bàn giao nhanh: đề cương chương + bảng trạng thái module + danh sách còn thiếu)
**Kết luận** — Mốc M1 xong; `01` và `02` đã có phần đề cương, kiến trúc, Module 1, luồng Chat; `04` mới là khung chờ SE-008.
**Checklist**
- [x] Fetch `origin/develop` @ `6ed0fbc`; PR #3 đầu `d60864a`, PR #4 đầu `e1fda76` (`gh pr list`, 15/11 18:30) — Đạt
- [x] Đọc đề cương (bản 09/09/2026 16:29), báo cáo 27/10, quy định trình bày Khoa CNTT — Đạt — tóm tắt ở [01](../thesis/01-outline-and-sources.md); thông tin liên lạc trong đề cương không chép vào repo
- [x] Bảng trạng thái module 5 cột, 4 mức tích hợp — Đạt — [README mục 3](../thesis/README.md#3-trạng-thái-module-tại-sha-cơ-sở)
- [x] Đề cương chương tạm thời theo quy định Khoa — Đạt — [01 mục 5](../thesis/01-outline-and-sources.md#5-đề-xuất-bố-cục-chương); T2 chờ chốt
- [x] Danh sách còn thiếu — Đạt — [README mục 5](../thesis/README.md#5-phần-còn-thiếu)
- [x] SE-008 tạo, `Sẵn sàng` — [SE-008](SE-008-thesis-implementation-evidence.md)
- [ ] `03` và bảng bằng chứng — chờ SE-008 (hạn bàn giao 18/11)
- [ ] Danh mục hình hoàn chỉnh — chờ SE-008; ảnh tạm hiện có chưa đưa vào repo (độ phân giải 768 px, chụp trên nhánh PR) — xem [04 mục 4](../thesis/04-validation-and-results.md#4-danh-mục-hình)
- [ ] Tài liệu tham khảo bên ngoài — đã liệt kê, 16/17 link trả `200`, trang OpenAI trả `403` cho truy cập tự động; chưa đọc lại nội dung từng trang
- [x] Liên kết nội bộ 590 link, 0 lỗi; không có SĐT/email cá nhân, `sk-…`; merge thử với PR #3, PR #4 và thứ tự #3 → #4 đều sạch — Đạt

**Trạng thái và bước tiếp theo** — Chờ Review; TL tiếp tục M2.

#### Review vòng 1
CTO (15/11/2026), nguyên văn: "CTO duyệt bản nguồn vòng 1 tại `2f003a0` để tiếp tục triển khai. Chốt bố cục 4 chương và cách mô tả Module 3–4 là **thiết kế và giao diện minh họa**. T1 vẫn chờ tôi xác nhận bản đề cương đã duyệt. Trong lúc chờ, tiếp tục dùng bản đang có làm nguồn tạm và ghi rõ trạng thái."
Yêu cầu tiếp: giao SE-008 ngay (bàn giao 18/11, TL review + tổng hợp 19/11); hoàn thiện nguồn Chương 1; review SE-008 theo AC1–AC8; ghi file nguồn sơ đồ và phần cần xuất/vẽ lại; bàn giao 19/11 (link README, SHA, checklist vòng mới, danh sách chỗ AI viết Word để trống); cập nhật theo `develop` 25/11.

### Kế hoạch vòng 2
Đã làm ngày 15/11 (sau review vòng 1): nguồn Chương 1 R1–R35 có tác giả/tổ chức, tiêu đề, ngày/phiên bản, đường dẫn, luận điểm ([01 mục 7](../thesis/01-outline-and-sources.md#7-tài-liệu-tham-khảo-đề-xuất)); khảo sát cá nhân cần bổ sung S1–S5 ([01 mục 7.5](../thesis/01-outline-and-sources.md#75-khảo-sát-cá-nhân--sinh-viên-cần-bổ-sung)); danh mục sơ đồ D1–D11 ([02 mục 9](../thesis/02-requirements-and-design.md#9-sơ-đồ-file-nguồn-hiện-có-và-việc-cần-xuất--vẽ-lại)); T2, T3 ghi vào `01`, `02`, README.

**Review SE-008 (18–19/11)** — TL ghi `#### Review vòng 1` trong [SE-008](SE-008-thesis-implementation-evidence.md), mỗi AC có bằng chứng TL tự kiểm tra:
- AC1, AC2: chọn ≥ 10 dẫn chứng trong `03` (gồm mọi đoạn về phiên, sở hữu hội thoại, SSE/Dừng, provider), `git show <sha>:<file>` đối chiếu tên hàm/lớp và hành vi.
- AC3: đối chiếu từng đoạn gắn nhãn PR #3 / PR #4 với `gh pr view 3/4` (SHA đầu PR) và `git log origin/develop`.
- AC4, AC6: từng ca trong `evidence/test-cases.md` đối chiếu nguồn ghi ở cột Nguồn (hồ sơ SE-001, SE-002, SE-007, TL-003, access-control); ca `THIẾU` chuyển vào danh sách còn thiếu.
- AC5: mở **từng ảnh** dự kiến dùng: đúng màn hình và vai trò trong chú thích; chỉ tài khoản/dữ liệu thử; không key, không email/SĐT thật; SHA chạy khớp phiên bản; kích thước theo yêu cầu.
- AC7: `gh pr diff <số> --name-only` chỉ trong phạm vi. AC8: dữ liệu thử đã dọn, số lượt OpenAI.
- Đạt → merge PR SE-008 vào `develop` (chỉ tài liệu, không đổi bản demo `34b465d`), SE-008 `Done`; Cần sửa → prompt theo workflow mục 7.

**Bàn giao vòng 2 (19/11)** — `### Checklist vòng 2` tại đây: link `docs/thesis/README.md`, SHA `develop`; đủ nguồn theo từng chương; trạng thái module đúng; có bằng chứng kiểm thử; ảnh mở được; danh sách chỗ AI viết Word để trống (`CẦN BỔ SUNG`, S1–S5, G-list, sơ đồ D5–D11).
**Cập nhật 25/11** — sau tích hợp PR #3 → PR #4 và xác minh trên `develop`: đổi nhãn [PR] → đã tích hợp kèm SHA merge trong README, `02`, `03`, `04`; checklist vòng 3.

### Checklist vòng 2
**Task hoặc yêu cầu** — TL-004 · bộ nguồn `docs/thesis/` · `develop` cơ sở `2f003a0` · vòng 2 (yêu cầu khách hàng 15/11/2026: đọc hai file chỉ định, tổng hợp Markdown, kiểm chứng, bàn giao)
**Kết luận** — Bộ nguồn dùng đúng hai file chỉ định; `01`, `02`, README, `04` cập nhật; phần SE-008 (`03`, ca kiểm thử, ảnh) chưa đến hạn nên ghi `CẦN BỔ SUNG` (B8, B9).
**Checklist**
- [x] Đọc **đúng file đề cương** chỉ định `D:\workspace\5250026_BuiVanDuong_LT_CNTT1_K29.1_Decuong DATN.docx` (MD5 `cf7b9248aff07b155bf2cee1f19798ba`, sửa 30/09/2026 18:53) — Đạt — tên đề tài, mục tiêu, phạm vi, kết quả dự kiến lấy từ file này ([01 mục 1–3](../thesis/01-outline-and-sources.md#1-đề-tài)); khác bản 09/09 đã ghi ([sources/de-cuong-datn.md](../thesis/sources/de-cuong-datn.md))
- [x] Căn cứ phê duyệt — **không có trong file** (4 ô ký trống, không chữ ký số/nhận xét; 2 hình trong file là đường kẻ tiêu đề) — ghi B1 `CẦN BỔ SUNG`, người phụ trách: sinh viên
- [x] Đọc **đúng file quy định** `C:\Users\duong\Downloads\Quy dinh va huong dan trinh bay DATN .signed.pdf` (MD5 `c972b9dcac7e3abc30de63f5920a5411`, 5 trang có nội dung, ký số 23/09/2021) — Đạt
- [x] Quy định có dẫn nguồn trang/mục: Q1–Q15 (cấu trúc, định dạng Word, đánh số và tên hình/bảng, trích dẫn "Nguồn: …", danh mục tài liệu tham khảo, file nguồn sơ đồ trên CD, viết tắt, bìa) — Đạt — [01 mục 8](../thesis/01-outline-and-sources.md#8-quy-định-trình-bày-của-khoa-áp-dụng-khi-dựng-word); điểm quy định không nêu (kiểu trích dẫn…) ghi riêng
- [x] Bố cục 4 chương đã chốt phù hợp PDF (số chương tùy đề tài; đủ phần bắt buộc) — Đạt — [01 mục 5](../thesis/01-outline-and-sources.md#5-đề-xuất-bố-cục-chương) kèm bảng quy định áp dụng theo phần
- [x] Bản sao tài liệu cho agent (yêu cầu bổ sung 15/11): bản chép Markdown [sources/](../thesis/sources/README.md); bản gốc `docs/thesis/sources/originals/` bị `.gitignore` chặn vì repo **công khai** và đề cương có SĐT/email — Đạt — `git status --ignored`
- [x] Nội dung theo chương: Mở đầu (01 mục 1–4), Chương 1 (R1–R35 + S1–S5), Chương 2 (`02`), Chương 4 (`04` từ hồ sơ), Kết luận (`04` mục 5–6) — Đạt; Chương 3 và ảnh — **chưa có**, ghi B8/B9 (Senior Dev, 18/11)
- [x] Trạng thái module có bằng chứng, 4 mức, SHA cơ sở; PR #3 @ `d60864a`, PR #4 @ `e1fda76` đều `OPEN`, base `develop`, `MERGEABLE`/`CLEAN` (kiểm tra 18:57 15/11) — Đạt — [README mục 3](../thesis/README.md#3-trạng-thái-module-tại-sha-cơ-sở)
- [x] Mục thiếu ghi `CẦN BỔ SUNG` kèm nội dung và người phụ trách: B1–B12 — Đạt — [README mục 6](../thesis/README.md#6-danh-sách-cần-bổ-sung-cho-người-viết-word)
- [x] Liên kết nội bộ mở được — Đạt — kết quả script ghi trong commit vòng này; sơ đồ D1–D4 (Mermaid) hiển thị trên GitHub, D5–D11 chưa có (B7)
- [ ] Ảnh mở được — **chưa có ảnh trong repo** (B9, SE-008)
- [x] Không có thông tin cá nhân, tài khoản thật, khóa API trong file đưa vào repo — Đạt — `grep` SĐT/email/`sk-`
- Ghi chú: sau khi khách hàng + CTO duyệt bộ nguồn, TL tạo task riêng để AI viết `.docx` từ SHA bộ nguồn đã duyệt, áp dụng Q1–Q15, kèm checklist kiểm tra bản Word.

**Trạng thái và bước tiếp theo** — Chờ Review (khách hàng + CTO); TL review SE-008 18–19/11 (vòng 3), cập nhật sau tích hợp 25/11 (vòng 4).

## Phản hồi UI
Không áp dụng (tài liệu).
