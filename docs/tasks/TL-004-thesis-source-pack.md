# TL-004 — Bộ tài liệu nguồn cho báo cáo đồ án (Markdown)

Trạng thái: Chờ Review (vòng 1 — đề cương chương, bảng trạng thái module, danh sách còn thiếu)
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 3,5 ngày làm việc, chia 4 mốc (bảng dưới)
Phụ thuộc: [SE-008](SE-008-thesis-implementation-evidence.md) (`03-implementation.md` + bảng bằng chứng); cập nhật trạng thái Module 1–2 sau khi tích hợp PR #3 (SE-002) và PR #4 (SE-007)
Hạn bàn giao review: Chờ chốt (dự kiến: bộ nguồn trước demo 19/11/2026; cập nhật sau tích hợp 25/11/2026) · Hạn hoàn tất: Chờ chốt
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 (vòng 1) · hoàn tất —
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
| T1 | Bản đề cương nào là bản đã duyệt? Tìm thấy 4 file ngày 09/09/2026; bản mới nhất `5250026_BuiVanDuong_LT_CNTT1_K29.1_Decuong DATN.docx` (16:29) | Dùng bản mới nhất | Chờ khách hàng |
| T2 | Bố cục chương: quy định Khoa chỉ bắt buộc phần đầu/cuối, số chương tùy đề tài | 4 chương theo [01 mục 5](../thesis/01-outline-and-sources.md#5-đề-xuất-bố-cục-chương) | Chờ khách hàng + CTO |
| T3 | Module 3–4 ghi thế nào trong báo cáo khi chỉ có giao diện demo dữ liệu giả ở nhánh preview? | Ghi là "thiết kế + giao diện minh họa", không ghi đã hiện thực; chi tiết ở hướng phát triển | Chờ khách hàng + CTO |

## Kết quả review
Vòng 1 bàn giao 15/11/2026 — chờ khách hàng + CTO xem đề cương chương, bảng trạng thái module, danh sách còn thiếu.

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

## Phản hồi UI
Không áp dụng (tài liệu).
