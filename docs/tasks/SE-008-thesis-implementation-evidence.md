# SE-008 — Tài liệu đồ án: hiện thực Module 1–2 và bảng bằng chứng kiểm thử

Trạng thái: Đang làm
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: 2 ngày làm việc
Phụ thuộc: Không chặn. Làm **trước** [SE-003](SE-003-release-mode-navigation.md) (cùng P1, hạn bàn giao sớm hơn); SE-003 bắt đầu sau khi bàn giao SE-008, hạn SE-003 (25/11) không đổi
Hạn bàn giao review: 18/11/2026 (dự kiến) · Hạn hoàn tất: 19/11/2026 (dự kiến)
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review — · hoàn tất —
Chốt: 15/11/2026 — khách hàng giao SE hai đầu ra cho bộ nguồn đồ án ([TL-004](TL-004-thesis-source-pack.md)); chỉ tài liệu và ảnh
SHA cơ sở: `origin/develop` @ `2f003a0` (15/11/2026, ghi lúc chuyển `Đang làm`)
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Senior Dev là người hiểu code nhất: viết phần **hiện thực** Module 1–2 bằng văn phong đưa được vào báo cáo đồ án, và lập **bảng bằng chứng kiểm thử** có ảnh để TL tổng hợp vào `04-validation-and-results.md`. Người đọc cuối là một AI viết Word và sinh viên — cần rõ ràng, truy vết được, không suy đoán.

## Output
1. `docs/thesis/03-implementation.md` (SE sở hữu).
2. `docs/thesis/evidence/test-cases.md` — bảng ca kiểm thử + danh mục ảnh (SE lập, TL tổng hợp sang `04`).
3. `docs/thesis/images/*.png` — ảnh đã chọn, tên ổn định.
4. PR `docs/thesis-implementation` → `develop`, checklist vòng 1 trong file này.

## Phạm vi
- **Làm:**
  - `03-implementation.md` cho **Module 1** (xác thực, phiên, hồ sơ, quản trị) và **Module 2** (Chat, SSE, dừng/tạo lại, provider LLM). Mỗi module: luồng hiện thực; Web ↔ API ↔ MongoDB phối hợp thế nào; các quyết định cần giải thích (phiên đăng nhập + refresh rotation, sở hữu hội thoại theo `userId`, streaming SSE + Dừng, lựa chọn provider AI và `mock` mặc định); dẫn tới file code (đường dẫn + tên hàm/lớp), commit hoặc PR.
  - Đầu file: bảng **trạng thái tích hợp** từng phần, dùng đúng 4 mức của [README bộ nguồn](../thesis/README.md#3-trạng-thái-module-tại-sha-cơ-sở): `Đã tích hợp (develop @ <sha>)` · `Đã kiểm thử trên PR, chưa tích hợp` · `Chỉ có demo` · `Hướng phát triển`. Ảnh đại diện chỉ chính chủ (PR #3 / SE-002) và OpenAI thật (PR #4 / SE-007) ghi **đã kiểm thử trên PR, chưa tích hợp**; mỗi đoạn mô tả hai phần này gắn nhãn đó ngay tại đoạn để TL đổi một chỗ sau khi tích hợp.
  - `evidence/test-cases.md`: bảng `Mã ca | Module | Vai trò | Bước thử | Kết quả mong đợi | Kết quả thực tế | SHA | Nguồn`. Mã ca `TC-M1-nn`, `TC-M2-nn`. Ưu tiên lấy kết quả đã có trong hồ sơ (SE-001, SE-002, SE-007, TL-003, [access-control](../design/access-control.md)) — ghi nguồn tới đúng mục; chạy lại khi cần ảnh.
  - Ảnh: gom ảnh UI sẵn có hoặc chụp bổ sung bằng **dữ liệu thử** (tài khoản `*.test@catgpt.local` / `se008.*@catgpt.local`, nội dung hội thoại mẫu). Danh mục ảnh trong `evidence/test-cases.md`: `Mã hình | Chú thích | Màn hình (route) | Vai trò | SHA chạy | Đường dẫn`. Tên file `images/m<module>-<nn>-<slug>.png`. Desktop rộng ≥ 1280 px (mobile 375 px khi cần), ≤ 500 KB/ảnh.
  - Mục thiếu bằng chứng: ghi dòng với kết quả thực tế `THIẾU — <lý do>` để TL xử lý; không bịa kết quả.
- **Không làm:** sửa code; sửa `README.md`, `01`, `02`, `04` của `docs/thesis/` (TL sở hữu); sửa file đang có trong PR #3/#4; merge; thay đổi bản demo `34b465d`.

**Ảnh tạm có sẵn** (TL chụp khi review 15/11, 768 px — chỉ dùng nếu không chụp lại được; ghi đúng SHA):
`C:\Users\duong\AppData\Local\Temp\claude-chrome-screenshots-W0KrXu\` — `…-0.jpg` hồ sơ (admin thử, desktop, PR #3 @ `d60864a`), `…-2.png` hồ sơ mobile sau khi xóa ảnh (PR #3), `…-4.jpg` Chat đang stream OpenAI (PR #4), `…-8.jpg` nhãn "Câu trả lời bị cắt…" (PR #4 @ `e1fda76`).

## Nguồn yêu cầu
- Yêu cầu khách hàng 15/11/2026 — [báo cáo ngày 15/11 vòng 4](../reports/daily/2026-11-15.md#vòng-4--1900).
- Function Spec / Basic Design: [module-1-auth.md](../design/module-1-auth.md), [module-2-chat.md](../design/module-2-chat.md) (bản trên PR #4 cho §4.5 OpenAI), [access-control.md](../design/access-control.md).
- Bằng chứng có sẵn: [SE-001](SE-001-chat-integration.md#lịch-sử-review), [SE-002](SE-002-avatar-requires-login.md#lịch-sử-review), SE-007 (trên PR #4: `docs/tasks/SE-007-openai-provider.md` @ `e1fda76`), [TL-003](TL-003-access-ui-release-audit.md).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | `03` mô tả Module 1 và 2: luồng, phối hợp Web–API–DB, các quyết định (phiên, sở hữu hội thoại, SSE + Dừng, provider) | Yêu cầu 15/11 (tin 3 mục 2) | TL đọc, đối chiếu code |
| AC2 | Mỗi nhận định kỹ thuật dẫn tới file code / commit / PR có thật tại SHA ghi trong file | Yêu cầu 15/11 | TL `git show <sha>:<file>` ngẫu nhiên ≥ 10 dẫn chứng |
| AC3 | Phân biệt đúng **đã tích hợp trên `develop`** và **đã kiểm thử trên PR** (SE-002, SE-007) | Yêu cầu 15/11 (tin 2 mục 1) | TL đối chiếu `gh pr view 3/4`, `git log origin/develop` |
| AC4 | `evidence/test-cases.md`: đủ 8 cột; tối thiểu: đăng nhập đúng/sai, khóa tài khoản có hiệu lực ngay, phiên (đăng xuất từ xa), USER bị chặn trang/API quản trị, hồ sơ; Chat gửi + stream, Dừng, Tạo lại, mở lại hội thoại, hội thoại người khác → 404, giới hạn 20 tin/phút; SE-002 ảnh chính chủ; SE-007 ba kết thúc Hoàn tất / Bị cắt / Đã dừng + hủy kết nối (test server giả lập) + lượt Dừng **không nhận được usage** | TL-004, hồ sơ task | TL đọc + đối chiếu nguồn |
| AC5 | Ảnh mở được từ đường dẫn trong repo, có chú thích, vai trò, SHA; chỉ dữ liệu thử; không có khóa API, email/SĐT thật | Yêu cầu 15/11; quy tắc bảo mật | TL mở từng ảnh; `grep -ri "sk-" docs/thesis` |
| AC6 | Mục thiếu bằng chứng đánh dấu `THIẾU — <lý do>` | Yêu cầu 15/11 | Đọc |
| AC7 | PR chỉ thay đổi `docs/thesis/03-implementation.md`, `docs/thesis/evidence/**`, `docs/thesis/images/**`, file task này và dòng SE-008 trong mục lục | Phạm vi | `gh pr diff --name-only` |
| AC8 | Dữ liệu thử đã dọn (khóa tài khoản thử, xóa hội thoại thử); không chạy OpenAI thật quá 10 lượt; key chỉ nằm trong `apps/api/.env` | Workflow 9.1; quy tắc bảo mật | Ghi trong checklist |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| — | Không có | — | — |

## Kết quả review
Chưa có.

## Lịch sử review
Chưa có.

## Phản hồi UI
Không áp dụng (tài liệu).
