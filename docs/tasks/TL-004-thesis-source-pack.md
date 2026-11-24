# TL-004 — Bộ tài liệu nguồn cho báo cáo đồ án (Markdown)

Trạng thái: Chờ Review — **24/11/2026: bộ nguồn bàn giao cho workflow báo cáo TH (Thesis Roadmap V1.1, Project Owner) — TL dừng mở rộng bộ nguồn; chưa nghiệm thu** — [bản ghi bàn giao](#bàn-giao-sang-thesis-roadmap-v11-24112026). Vòng 5 bàn giao 17/11/2026 (chế độ phát hành, thiết kế Module 3–4, ảnh Chat OpenAI ≥ 1280 px); còn ảnh đại diện (B13 phần còn lại). Vòng 3 **khách hàng duyệt** 15/11/2026 tại `da66569`
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 3,5 ngày làm việc, chia 4 mốc (bảng dưới)
Phụ thuộc: [SE-008](SE-008-thesis-implementation-evidence.md) (`03-implementation.md` + bảng bằng chứng); cập nhật trạng thái Module 1–2 sau khi tích hợp PR #3 (SE-002) và PR #4 (SE-007)
Hạn bàn giao review: **19/11/2026** (vòng 2, bộ nguồn trước demo) · cập nhật theo `develop` sau tích hợp: **25/11/2026** (CTO, 15/11/2026) · Hạn hoàn tất: Chờ chốt
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 (vòng 1, 2, 3), 16/11/2026 (vòng 4), 17/11/2026 (vòng 5) · hoàn tất —
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
- SE-008 vòng 1 (PR #5 @ `bbfd59f`): TL review **Cần sửa** 15/11 — [Review SE-008 vòng 1](#review-se-008-vòng-1-tl).
- SE-008 vòng 2 (`44bfbad`): TL **Đạt**, merge PR #5 → `8732458`, SE-008 `Done` 15/11.
- Vòng 3 (15/11/2026, sớm so với hạn 19/11): đủ nguồn 4 chương, `04` tổng hợp từ SE-008 — [Checklist vòng 3](#checklist-vòng-3). **Khách hàng duyệt tại `da66569`** để dựng Word nháp — [Review vòng 3](#review-vòng-3) → [TL-005](TL-005-thesis-word-draft.md).
- Vòng 4 (16/11/2026, sớm so với 25/11 — PR #3/#4 tích hợp sớm theo yêu cầu khách hàng): bộ Markdown cập nhật theo `develop` @ `d6832e0` — [Checklist vòng 4](#checklist-vòng-4). Chờ khách hàng + CTO; B13 còn mở. TL-005 dùng SHA nguồn mới nếu khách hàng đồng ý.
- (Kế hoạch ban đầu) Vòng 3 (19/11): sau review SE-008 — [kế hoạch](#kế-hoạch-vòng-2) (đánh số lại: review SE-008 thành vòng 3, cập nhật sau tích hợp thành vòng 4).
- Vòng 5 (17/11/2026): thêm chế độ `demo`/`staff` (PR #6 → `783a8a3`), dẫn thiết kế Module 3–4, chụp lại ảnh Chat OpenAI trên `develop` (B13 phần Chat) — [Checklist vòng 5](#checklist-vòng-5). Chờ khách hàng + CTO.

- **Bàn giao 24/11/2026** (Project Owner, Thesis Roadmap V1.1): bộ nguồn tại `c34410b` chuyển cho workflow TH, kiểm chứng ở TH-002; TL dừng mở rộng; **chưa nghiệm thu** — [bản ghi bàn giao](#bàn-giao-sang-thesis-roadmap-v11-24112026).

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

#### Review SE-008 vòng 1 (TL)
**Task** — SE-008 · PR https://github.com/duong2604/cat_gpt/pull/5 · SHA đã review `bbfd59f` (đầu PR thực tế; checklist SE ghi `9c21c18` vì commit `bbfd59f` chỉ ghi bàn giao) · `MERGEABLE`/`CLEAN` · vòng 1
**Kết luận** — **Cần sửa.** Phạm vi đúng, `03` đầy đủ và phần lớn nhận định khớp code; bảng ca kiểm thử đủ cột. Phải sửa 1 lỗi bảo mật, 2 nhận định sai trong `03`, 1 ca ghi quá bằng chứng, chú thích ảnh và 1 liên kết gãy.
**Checklist** (TL tự kiểm tra trên worktree TL, `git show`/`git grep` tại `bbfd59f`, `origin/fix/avatar-requires-login` @ `d60864a`, `origin/feature/openai-provider` @ `e1fda76`)
- [ ] AC1 `03` đủ Module 1–2, Web–API–DB, các quyết định — nội dung đạt; **2 nhận định sai** (AC2)
- [ ] AC2 Dẫn chứng khớp code — đối chiếu hơn 30 dẫn chứng (guard toàn cục `app.module.ts:35-37`; `DUMMY_PASSWORD_HASH`, `signAccessToken`; `rotate`, `REFRESH_REUSE_GRACE_MS`, `findActive`, `revokeAllForUser(userId, exceptSessionId)`; `randomBytes(32)`/`hashSecret`; `assertNotSelf`, `assertNotLastActiveAdmin`, `countActiveAdmins`; `setStatus` thu hồi phiên khi `BLOCKED`; `USER_SAME_PASSWORD`, `detectImageType`, `AVATAR_MAX_SIZE_BYTES`, `storage.delete`; `randomUUID`, chặn path traversal; `useStaticAssets` `dotfiles:'deny'`, `maxAge:'7d'`; `refreshPromise`/`refreshSession`, `recoverFromUnauthorized`; `inFlight`, `assertNotStreaming` → `CHAT_STREAM_IN_PROGRESS`, `assertRateLimit`/`sendLog`, chú thích `ponytail`, `makeTitle`, `recentMessages`, `deleteMessage`; `split(/(\s+)/)`, 20–40 ms; PR #3: `FilesController`, `findById`, `getAbsolutePath`, `Cache-Control: private, no-store` + `cacheControl:false`, `AdminUserDto`, `toAdminDto`, `AdminUserResponse`; PR #4: `store:false`, `LlmError`, `ponytail`, `aborted` → `STOPPED` trước `TRUNCATED`) — các dẫn chứng còn lại khớp, **2 sai**:
  - §1: "`apps/web/src/proxy.ts` rewrite `/api/*`" — sai: rewrite nằm ở `apps/web/next.config.ts` (`rewrites()` → `${API_INTERNAL_URL}/api/:path*`); `proxy.ts` chỉ đọc cookie `cat_session` để điều hướng (đúng như §2.1 đã viết).
  - §3.3: mock `/error` "ném lỗi giữa chừng (ở khoảng 40% nội dung)" — sai: `mock-llm.provider.ts` ném lỗi khi đã phát **20 đoạn** (`emitted === 20`), không theo tỷ lệ.
- [x] AC3 Phân biệt `develop` / PR #3 / PR #4 — Đạt — bảng đầu `03` + nhãn tại chỗ; SHA PR khớp `gh pr view`
- [ ] AC4 Bảng ca kiểm thử — đủ 8 cột, 23 ca, đủ nhóm yêu cầu; **TC-M1-02 ghi quá bằng chứng**: "thời gian phản hồi như nhau" — `module-1-auth §7` và TL-003 không đo thời gian; bằng chứng hiện có là code (M1-08: luôn chạy `verifyPassword` với `DUMMY_PASSWORD_HASH`). Ghi đúng mức: "kiểm qua code; chưa đo thời gian phản hồi"
- [ ] AC5 Ảnh và dữ liệu — mở đủ 13 ảnh: đúng màn hình, vai trò, chỉ tài khoản thử; **chưa đạt**:
  - **Bảo mật:** `evidence/test-cases.md` dòng 5 ghi **mật khẩu của tài khoản thử** `se008.a@` dạng chữ thường — repo công khai. Xóa khỏi file; admin **đặt lại mật khẩu** `se008.a@` (giữ `BLOCKED`) để mật khẩu đã lộ trong lịch sử commit vô hiệu; ghi vào checklist
  - `m1-05`: chú thích "không cột ảnh… cột ảnh cũng chưa có trên `develop`" — sai: `users-management.tsx` trên `develop` hiện `UserAvatar` (ảnh hoặc chữ cái đầu) ở cột Người dùng (ảnh chụp đúng là thấy chữ cái đầu); PR #3 mới bỏ
  - `m2-01`: chú thích "câu trả lời markdown (bảng so sánh)" — ảnh hiện danh sách đánh số + dòng "Đây là câu trả lời mẫu…"; "sau khi tải lại" không thấy được trong ảnh → chú thích theo đúng nội dung nhìn thấy
  - `m1-08`: ghi "768px" — thực tế 238 × 432 (mobile)
  - `m2-04`: thanh bên có tiêu đề hội thoại lỗi mã hóa ("H◆y giải thích…", rác từ lần thử curl) → đánh dấu **không dùng trong báo cáo** (hoặc cắt bỏ thanh bên); TL chụp lại sau tích hợp PR #4
  - Đạt: kích thước ≤ 392 KB; 9 ảnh `develop` 1536 × 695; không có `sk-`, SĐT, email cá nhân
- [x] AC6 Mục thiếu ghi `THIẾU — <lý do>` — Đạt (TC-M2-02 ảnh "Đã dừng"; mobile 375 px). TL nhận chụp lại sau tích hợp (B10)
- [ ] AC6/liên kết — **1 liên kết gãy**: `test-cases.md` → `../../tasks/SE-002-avatar-requires-login.md#checklist-vòng-1` (checklist vòng 1 SE-002 chỉ có trên PR #3) → trỏ `https://github.com/duong2604/cat_gpt/blob/d60864a/docs/tasks/SE-002-avatar-requires-login.md#checklist-vòng-1`. Kiểm: 687 link, 1 lỗi
- [x] AC7 Phạm vi — Đạt — `gh pr view 5`: 17 file, đúng danh sách cho phép
- [x] AC8 Dữ liệu thử đã khóa/xóa, không gọi OpenAI — Đạt theo bàn giao; bổ sung việc đặt lại mật khẩu ở AC5
- [x] `.env.example` local — **TL chấp nhận** cách xử lý: bản sửa là nháp cũ (`LLM_PROVIDER=openai`, key trống — khớp điều TL ghi nhận trước đó), đã bị `.env.example` của PR #4 thay thế; Senior Dev stash rồi bỏ, không có giá trị thật. Không cần khôi phục
**Trạng thái và bước tiếp theo** — Cần sửa → Senior Dev sửa trong cùng PR #5, chép mục review này vào "Lịch sử review" của SE-008 (`#### Review vòng 1 (TL)`), thêm `### Checklist vòng 2`, chuyển `Chờ Review`. Chưa nhận SE-003 cho tới khi bàn giao vòng 2 (ước lượng sửa 0,25 ngày; hạn 18/11 không đổi).

### Checklist vòng 3
**Task hoặc yêu cầu** — TL-004 · bộ nguồn [docs/thesis/README.md](../thesis/README.md) · `develop` sau merge PR #5 `8732458` (SHA bàn giao: commit vòng này, ghi trong tin gửi khách hàng + CTO) · vòng 3
**Kết luận** — Bộ nguồn đủ cho Mở đầu, Chương 1–4, Kết luận; mục còn thiếu đều có mã `CẦN BỔ SUNG` (B1–B7, B10–B13) kèm người phụ trách. Sẵn sàng để khách hàng + CTO duyệt làm nguồn cho AI viết Word, với lưu ý trạng thái SE-002/SE-007 sẽ đổi sau tích hợp (vòng 4, 25/11).
**Checklist**
- [x] Hai file nguồn đúng file khách hàng chỉ định (đề cương MD5 `cf7b9248…`, quy định PDF MD5 `c972b9dc…`); bản chép trong [sources/](../thesis/sources/README.md) — Đạt (giữ từ vòng 2)
- [x] Quy định trình bày có dẫn trang/mục (Q1–Q15) và bảng quy định theo từng phần — Đạt — [01 mục 5, 8](../thesis/01-outline-and-sources.md#8-quy-định-trình-bày-của-khoa-áp-dụng-khi-dựng-word)
- [x] Nguồn theo chương — Đạt: Mở đầu ([01 mục 1–4](../thesis/01-outline-and-sources.md)); Chương 1 (R1–R35; khảo sát cá nhân B4–B6); Chương 2 ([02](../thesis/02-requirements-and-design.md)); Chương 3 ([03](../thesis/03-implementation.md), SE-008); Chương 4 ([04](../thesis/04-validation-and-results.md) mục 3–4, 23 ca từ [evidence](../thesis/evidence/test-cases.md)); Kết luận ([04](../thesis/04-validation-and-results.md) mục 5–6)
- [x] `03` và bằng chứng do SE lập đã review 2 vòng, đối chiếu code — Đạt — [SE-008](SE-008-thesis-implementation-evidence.md#review-vòng-2-tl)
- [x] Trạng thái module có bằng chứng, 4 mức; PR #3 `d60864a`, PR #4 `e1fda76` vẫn mở, chưa tích hợp; các ca PR ghi riêng ở 04 mục 3.3 — Đạt
- [x] Mỗi kết quả kiểm thử có mã ca, vai trò, kết quả, phiên bản (SHA), nguồn; mỗi hình có chú thích, màn hình, vai trò, SHA, đường dẫn — Đạt — 04 mục 3–4
- [x] Ảnh mở được: 13 ảnh trong `docs/thesis/images/`, TL đã mở từng ảnh; 12 ảnh có đề xuất số Hình 4.1–4.12, `m2-04` không dùng; 3 ảnh PR dùng tạm, chụp lại sau tích hợp (B13) — Đạt có ghi chú
- [x] Sơ đồ: D1–D4 (Mermaid trong `02`), D9 (Mermaid trong `03`) hiển thị được; D5–D8, D10 cần vẽ mới (B7); D11 tùy chọn — Đạt có ghi chú
- [x] Liên kết nội bộ — Đạt — script kiểm tra: 0 lỗi (số liệu trong commit vòng này)
- [x] Không có SĐT/email cá nhân, mật khẩu, khóa API trong file đưa vào repo — Đạt — `grep`; bản gốc nguồn chỉ ở `sources/originals/` (`.gitignore`)
- [ ] B1 căn cứ phê duyệt đề cương; B2–B7 do sinh viên — chưa có (không chặn duyệt bộ nguồn)
- Sau khi khách hàng + CTO duyệt: TL tạo task riêng để AI viết `.docx` từ SHA bộ nguồn đã duyệt, áp dụng Q1–Q15, kèm checklist kiểm tra bản Word.

**Trạng thái và bước tiếp theo** — Chờ Review (khách hàng + CTO). Vòng 4 (25/11): sau tích hợp PR #3 → PR #4 và xác minh trên `develop`, đổi nhãn [PR] → đã tích hợp kèm SHA merge; chụp lại ảnh B13.

#### Review vòng 3
Khách hàng (15/11/2026), nguyên văn: "Tôi duyệt bộ nguồn vòng 3 tại `da66569` để dựng bản Word nháp. Ghi kết luận vào vòng 3 của `TL-004` và giữ lịch sử checklist. Tạo task riêng cho AI viết `.docx` từ đúng SHA này, theo bố cục bốn chương và quy định Q1–Q15. Trong task, dẫn trực tiếp tới PDF quy định để người dựng Word đối chiếu khi cần."
Yêu cầu kèm theo (ghi vào [TL-005](TL-005-thesis-word-draft.md)): bản nháp mô tả đúng trạng thái tại `da66569` (Module 1 và Chat phản hồi mẫu đã tích hợp; ảnh đại diện và OpenAI đã kiểm thử trên PR #3/#4; Module 3–4 là thiết kế và giao diện minh họa; Chương 4 dùng ca kiểm thử có nguồn); nhãn `CẦN BỔ SUNG`; ảnh tạm và ảnh cần thay; chốt B7 theo checklist vòng 3 và quy định Khoa; checklist bàn giao Word; bàn giao `Chờ Review`. Sau tích hợp 23–24/11: cập nhật bộ Markdown (vòng 4), 25/11 cập nhật bản Word, báo bằng checklist vòng mới.
Checklist vòng 1–3 giữ nguyên ở trên.

### Checklist vòng 4
**Task hoặc yêu cầu** — TL-004 · bộ nguồn [docs/thesis/README.md](../thesis/README.md) · cơ sở `origin/develop` @ `ceba640` (code `d6832e0`); SHA bàn giao: commit vòng này (ghi trong [báo cáo ngày 16/11 vòng 4](../reports/daily/2026-11-16.md#vòng-4--1605)) · vòng 4
**Kết luận** — Đổi trạng thái SE-002 (ảnh đại diện) và SE-007 (OpenAI) từ "đã kiểm thử trên PR, chưa tích hợp" sang **đã tích hợp** kèm SHA merge trong README, `01`–`04`; B10, G3, G7 đóng. Ảnh chụp lại (B13) chưa làm.
**Checklist**
- [x] PR #3 → `1674425`, PR #4 → `d6832e0` nằm trên `origin/develop` — Đạt — `git merge-base --is-ancestor` cả hai (TL chạy 16/11 16:05)
- [x] Merge không thêm thay đổi code ngoài PR — Đạt — `git diff d60864a 1674425 -- apps packages` rỗng; `git diff e1fda76 d6832e0 -- apps packages` chỉ gồm 14 file của PR #3
- [x] Nhận định mới khớp code trên `develop` — Đạt — `llm.module.ts` chọn `mock`/`openai` theo `LLM_PROVIDER`; có `files.controller.ts`, `openai-llm.provider.spec.ts`; `main.ts` không còn `useStaticAssets`; `MessageStatus.TRUNCATED` dùng ở `chat.service.ts:143`
- [x] Bằng chứng xác minh trên `develop` dẫn về [báo cáo ngày 16/11 vòng 3](../reports/daily/2026-11-16.md#vòng-3--0058) (build/typecheck/lint, api test 12/12, `200`/`401`/`404` ảnh đại diện, ba kết thúc mock) — Đạt — 04 mục 3.3; ca OpenAI thật (TC-M2-09, TC-M2-11) và TC-M1-12 ghi rõ không chạy lại trên `develop`
- [x] Không còn nhãn `[PR]`/"chưa tích hợp" cho SE-002/SE-007 trong README, `01`–`04` — Đạt — `grep`; giữ nguyên `evidence/test-cases.md` (hồ sơ ca kiểm thử trên đầu PR, đúng lịch sử) và cột SHA chụp ảnh `m1-07`, `m1-08`, `m2-04`, `m2-05` (chụp trên PR)
- [x] `03` (Senior Dev lập) — TL chỉ đổi nhãn trạng thái và câu "LlmModule chỉ đăng ký Mock", ghi "Cập nhật trạng thái tích hợp: TL" ở đầu file, không đổi nội dung kỹ thuật — Đạt
- [x] Liên kết nội bộ tới file — Đạt — script: 0 lỗi; anchor mới `#74-ba-cách-kết-thúc-khi-dùng-openai` đã đổi theo heading
- [x] Không có khóa API/thông tin cá nhân mới — Đạt — `grep -E "sk-[A-Za-z0-9]{10}"` rỗng
- [ ] B13 chụp lại ảnh ≥ 1280 px trên `develop` — chưa làm: cần chạy web + API (máy thiếu bộ nhớ ở phiên trước); H1-07, H1-08, H2-05 vẫn dùng tạm, H2-04 không dùng
- [ ] Chế độ `demo`/`staff` — chưa đưa vào bộ nguồn: PR #6 (SE-003) chưa tích hợp

**Trạng thái và bước tiếp theo** — Chờ Review (khách hàng + CTO). Hỏi khách hàng: TL-005 dựng Word từ SHA vòng 4 thay `da66569`? Còn B13 (TL) và bổ sung `demo`/`staff` sau khi PR #6 merge.

### Checklist vòng 5
**Task hoặc yêu cầu** — TL-004 · bộ nguồn [docs/thesis/README.md](../thesis/README.md) · cơ sở `develop` @ `f4e1516` (code `783a8a3`) · vòng 5
**Kết luận** — Bộ nguồn khớp `develop` sau PR #6; B13 xong phần Chat; còn ảnh đại diện.
**Checklist**
- [x] Chế độ phát hành vào bộ nguồn — PASS — [02 NFR-11, mục 3](../thesis/02-requirements-and-design.md#22-yêu-cầu-phi-chức-năng); README mục 1 (PR #6 → `783a8a3`); dựa trên TL review vòng 4 của SE-003 (TL chạy API + giao diện 17/11)
- [x] Module 3–4: 02 mục 8 dẫn [module-3-documents.md](../design/module-3-documents.md) (đã duyệt) và [module-4-rag.md](../design/module-4-rag.md) (chờ duyệt); vẫn ghi "chưa có code" — PASS (`git ls-tree origin/develop apps/api/src/modules` không có `documents`, `rag`)
- [x] B13 phần Chat — PASS — TL chụp trên `develop` @ `783a8a3` (API bản build, `LLM_PROVIDER=openai`, giao diện tiếng Việt, câu hỏi chủ đề công khai), 1536 × 695: [m2-04-openai-stream.jpg](../thesis/images/m2-04-openai-stream.jpg), [m2-05-openai-truncated.jpg](../thesis/images/m2-05-openai-truncated.jpg), [m2-06-stopped.jpg](../thesis/images/m2-06-stopped.jpg); trạng thái lưu khớp ảnh (`TRUNCATED` 3.440 ký tự, usage `output_tokens=1000 end=max_output_tokens`; `STOPPED` 3.071 ký tự, không có dòng usage); hội thoại thử đã xóa (`204`)
- [ ] B13 ảnh đại diện (H1-07, H1-08) — NOT VERIFIED: chưa chụp lại (cần tải ảnh lên tài khoản thử trên trình duyệt); mobile 375 px — BLOCKED: công cụ trình duyệt của TL không thu được cửa sổ
- [x] Liên kết — PASS — kiểm toàn repo (`docs/**`, `README.md`, `CLAUDE.md`, chuẩn hóa NFC): 1.001 liên kết, 0 gãy
- [x] Ảnh không chứa khóa API hay tài khoản thật — PASS — chỉ hiện `admin@catgpt.local` (tài khoản seed mặc định đã có trong repo)

**Trạng thái và bước tiếp theo** — Chờ Review (khách hàng + CTO). TL-005: nếu khách hàng mở phiên Word, đề xuất dùng SHA của vòng 5.

## Bàn giao sang Thesis Roadmap V1.1 (24/11/2026)
**Quyết định** — Project Owner Directive "CAT_GPT — Thesis Workflow Handover V1.1" (24/11/2026): toàn bộ việc thiết lập, soạn thảo, hoàn thiện báo cáo Word chuyển sang workflow TH (TH-001…TH-024, khu vực `docs/thesis-report/` do Thesis Agent tạo ở TH-001). `docs/thesis/` giữ nguyên làm bộ nguồn kỹ thuật; kiểm chứng ở **TH-002**. TL tiếp tục quản lý phát triển phần mềm, điều phối SE và cung cấp minh chứng kỹ thuật khi workflow TH yêu cầu. Bản ghi này không phải audit mới.

**Trạng thái** — TL-004: giữ `Chờ Review` (workflow không có trạng thái bàn giao; Project Owner chưa nghiệm thu kết quả); TL dừng các vòng soạn thảo/mở rộng bộ nguồn. [TL-005](TL-005-thesis-word-draft.md): `Đóng — CANCELLED (Superseded by Thesis Roadmap V1.1)`, không còn được thực thi.

**Phiên bản nguồn bàn giao**
| Mốc | SHA | Ghi chú |
|---|---|---|
| Bàn giao | `origin/develop` @ `c34410b` (24/11/2026) | Nội dung `docs/thesis/` tại SHA này là bộ nguồn bàn giao (30 file theo dõi) |
| Thay đổi cuối vào `docs/thesis/` | `af27bb7` (SE-029, 22/11) | Sửa 2 dòng `03-implementation.md` (Chat stream bằng `ReadableStream`); không qua vòng TL-004 |
| Vòng TL cuối | `4ed96a9` (vòng 5, 17/11) | Cơ sở `f4e1516`, code `783a8a3` |
| Vòng khách hàng đã duyệt | `da66569` (vòng 3, 15/11) | Nguồn cố định của TL-005 (đã hủy) |

**Danh sách nguồn trong `docs/thesis/`**
- Văn bản: `README.md` (điểm vào, trạng thái module, G1–G9, B1–B13), `01-outline-and-sources.md` (đề tài, phạm vi, bố cục 4 chương, tài liệu tham khảo R1–R35, quy định Q1–Q15), `02-requirements-and-design.md` (yêu cầu, phân quyền, kiến trúc, dữ liệu, luồng, danh mục sơ đồ mục 9), `03-implementation.md` (SE-008), `04-validation-and-results.md` (kiểm thử, danh mục hình, hạn chế, hướng phát triển), `evidence/test-cases.md` (TC-M1-01…12, TC-M2-01…11).
- Nguồn ngoài chép lại: `sources/README.md`, `sources/de-cuong-datn.md`, `sources/quy-dinh-trinh-bay-datn.md`. Bản gốc (`.docx` đề cương, PDF quy định) chỉ ở `sources/originals/` của worktree TL, bị `.gitignore` chặn — không có trên GitHub.
- Sơ đồ (`diagrams/`): có file Mermaid D1 kiến trúc tổng thể, D2 ERD, D3 tuần tự đăng nhập, D4 tuần tự gửi tin nhắn, D9 cấu trúc module. **Chưa có:** D5 dừng giữa chừng, D6 trạng thái tin nhắn, D7–D8 use case (cần công cụ UML), D10 kiến trúc dự kiến Module 3–4; D11 Docker là hướng phát triển. Chưa xuất ảnh sơ đồ nào.
- Ảnh (`images/`, 15 file): dùng được — `m1-01`…`m1-06`, `m2-01`…`m2-03` (`develop`, 1536 px), `m2-04-openai-stream.jpg`, `m2-05-openai-truncated.jpg`, `m2-06-stopped.jpg` (`develop` @ `783a8a3`, 1536 px); ảnh tạm chụp trên PR #3 — `m1-07-avatar-admin-pr3.png` (768 px), `m1-08-avatar-mobile-pr3.png` (238 × 432); ảnh cũ PR #4 — `m2-04-openai-stream-pr4.png` (không dùng, tiêu đề lỗi mã hóa), `m2-05-openai-truncated-pr4.png` (đã có bản thay).

**Đã xác minh (trong các vòng TL-004, tại SHA của vòng đó)** — Module 1 và Module 2 (Chat, streaming SSE, Dừng/Tạo lại) đã tích hợp; SE-002 (ảnh đại diện chính chủ) và SE-007 (OpenAI, giới hạn 1.000 token, `TRUNCATED`) tích hợp @ `1674425`, `d6832e0`; chế độ `demo`/`staff` @ `783a8a3`; 23 ca kiểm thử có mã; ảnh không chứa khóa API hay tài khoản thật; liên kết 0 gãy (vòng 5).

**Chưa xác minh — TH-002 cần kiểm chứng**
1. Bộ nguồn mô tả code tới `783a8a3`. Từ `4ed96a9` tới `c34410b` có 60 commit đổi `apps/`; `develop` nay có module `documents`, `rag`, `storage`, trong khi bộ nguồn (README mục 3, `02` mục 8, checklist vòng 5) vẫn ghi Module 3–4 "chưa có code" → **đã lệch**.
2. Đánh giá RAG (TL-009, `docs/evaluation/rag-dataset/`) và unit test hiện có trên `develop` chưa được đưa vào bộ nguồn (README G7 còn ghi Module 1–2 chưa có unit test).
3. Thay đổi SE-029 trong `03` chưa được TL review như một vòng bộ nguồn.
4. B13: ảnh đại diện (H1-07, H1-08) chưa chụp lại trên `develop`; ảnh mobile 375 px BLOCKED.
5. Tài liệu tham khảo ngoài: trang OpenAI trả `403` cho truy cập tự động; chưa đọc lại nội dung từng trang.

**Quyết định nghiệp vụ còn mở**
- Đề cương: baseline `5250026_BuiVanDuong_LT_CNTT1_K29.1_Decuong DATN.docx`, phê duyệt của giảng viên **PENDING_CONFIRMATION** (D4; B1/T1 — ô ký để trống). Không coi là đã duyệt.
- B2–B7 do sinh viên cung cấp (lời cảm ơn, năm trên bìa, khảo sát S1–S5, sơ đồ bằng phần mềm thiết kế).
- Q12: CTO chấp nhận Mermaid `.mmd` + ảnh xuất cho **bản nháp** (17/11); chờ GVHD nếu cần công cụ khác.
- Thiết kế Module 4 ghi "chờ duyệt" trong bộ nguồn — trạng thái hiện tại cần đối chiếu (TH-002).
- Số liệu tải (G6/B11): SE-005 đang BLOCKED (CTO HOLD 22/11, sự cố dữ liệu) — chưa có số liệu, không viết số.

**Chức năng mock hoặc chưa hoàn thành đã biết** — `MockLlmProvider` (câu trả lời văn bản mẫu) vẫn là một chế độ của Chat; Module 3–4 trong bộ nguồn chỉ là thiết kế + giao diện minh họa (dữ liệu giả ở nhánh `preview/module-2-4-demo`); Module 5, Docker/Nginx, đánh giá tải là hướng phát triển.

**Giới hạn của bộ nguồn** — Markdown, ảnh chụp tại các SHA cố định; không thay cho `origin/develop`; một số nhận định chỉ đúng tại SHA vòng đó; không chứa nội dung sinh viên phải tự viết.

**Outline cũ** — Bố cục 4 chương (CTO chốt 15/11/2026, mục T2 ở trên; [01 mục 5](../thesis/01-outline-and-sources.md#5-đề-xuất-bố-cục-chương)) giữ làm tài liệu lịch sử và tham khảo. Outline mới do Project Owner duyệt thay thế về **định hướng soạn thảo** (D3); không mở rộng phạm vi phát triển phần mềm.

**Word nháp** — Không có. Đã kiểm 24/11/2026: không có `D:\workspace\buggysoft\cat_gpt-thesis-private\` (Output TL-005), không có `D:\workspace\CAT_GPT_Thesis\`, không có nhánh `docs/thesis-word` (local, remote) hay worktree `cat_gpt-word`, không có tiến trình Microsoft Word; ngoài 2 fixture kiểm thử của `apps/api` không có `.docx` nào trong các worktree. File Word chính thức của workflow mới `D:\workspace\CAT_GPT_Thesis\CAT_GPT_DATN.docx` thuộc **TH-003**, chưa tạo.

**Xác nhận chuyển giao** — Trách nhiệm viết Word đã chuyển sang workflow TH; workflow TL không còn luồng dựng Word nào.

## Phản hồi UI
Không áp dụng (tài liệu).
