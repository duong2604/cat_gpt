# Workflow viết báo cáo đồ án (TH)

Workflow riêng, song song với quy trình phát triển ([docs/project/workflow.md](../project/workflow.md)); không thay đổi vai trò, trạng thái hay quyền của TL/Senior Dev.

## 1. Vai trò

| Vai trò | Ai | Quyền |
|---|---|---|
| Project Owner | Sinh viên | Quyết định cuối cùng; gửi chỉ thị thực thi; phê duyệt task (`APPROVED`); merge PR TH |
| Thesis Advisor & Reviewer | ChatGPT | Lập kế hoạch, outline, yêu cầu; review và phản biện; không tự phê duyệt thay Project Owner |
| Thesis Author & Technical Analyst | Claude (Thesis Agent) | Phân tích, nghiên cứu, soạn thảo, tự kiểm tra, bàn giao; tối đa tới `READY_FOR_REVIEW` |

Thesis Agent không giao việc cho TL/SE agent. Khi cần minh chứng kỹ thuật mới (ảnh, số liệu, test), ghi vào báo cáo thực hiện để Project Owner yêu cầu qua quy trình phát triển.

## 2. Review Gate

Trạng thái hợp lệ: `TODO` · `IN_PROGRESS` · `BLOCKED` · `READY_FOR_REVIEW` · `CHANGES_REQUESTED` · `APPROVED`.

```
TODO → IN_PROGRESS → READY_FOR_REVIEW → APPROVED
                READY_FOR_REVIEW → CHANGES_REQUESTED → IN_PROGRESS → READY_FOR_REVIEW
                IN_PROGRESS → BLOCKED → IN_PROGRESS (khi blocker được gỡ)
```

| Chuyển | Ai | Điều kiện |
|---|---|---|
| `TODO → IN_PROGRESS` | Thesis Agent | Có chỉ thị thực thi rõ ràng của Project Owner cho đúng task; task trước `APPROVED` (trừ khi Project Owner quyết định khác) |
| `IN_PROGRESS → READY_FOR_REVIEW` | Thesis Agent | Đã làm đủ công việc, tự kiểm theo tiêu chí nghiệm thu, ghi báo cáo thực hiện, mở PR |
| `IN_PROGRESS → BLOCKED` | Thesis Agent | Gặp điều kiện dừng; ghi lý do và điều cần để gỡ |
| `READY_FOR_REVIEW → CHANGES_REQUESTED / APPROVED` | **Chỉ Project Owner** (có thể dựa trên review của Advisor) | Ghi trong [review-log.md](review-log.md) và mục review của task |

Quy tắc:
- Phê duyệt kế hoạch ≠ phê duyệt kết quả. Commit, push hay merge PR ≠ nghiệm thu.
- Không tự chuyển `APPROVED`; chỉ ghi `APPROVED` khi Project Owner xác nhận rõ ràng.
- Không tự bắt đầu task tiếp theo; không tự sinh chỉ thị cho task sau rồi thực hiện.
- Trạng thái ở [progress.md](progress.md) phải khớp file task; lệch thì sửa ngay trong phạm vi được phép và báo cáo.

## 3. Thực hiện một task

1. `git fetch origin develop`; ghi SHA `origin/develop`; kiểm tra working tree sạch hoặc bảo toàn thay đổi đang có.
2. Đọc [master-prompt.md](master-prompt.md), file task, các file liên quan trong `docs/thesis-report/`.
3. Chuyển task sang `IN_PROGRESS` (file task + progress).
4. Làm đúng "Phạm vi thực hiện"; với Word áp dụng [mục 5](#5-human-edit-protection).
5. Tự kiểm từng tiêu chí nghiệm thu: **tiêu chí — kết quả (PASS/FAIL/NOT_VERIFIED) — bằng chứng**.
6. Ghi "Báo cáo thực hiện" trong file task; thêm dòng bàn giao ở [review-log.md](review-log.md); cập nhật [progress.md](progress.md), [source-register.md](source-register.md), [decisions.md](decisions.md) nếu có thay đổi.
7. Commit, push, mở PR ([mục 4](#4-git)) → `READY_FOR_REVIEW` → **dừng**.

Bàn giao lại sau `CHANGES_REQUESTED`: sửa tại chỗ, cùng task ID và PR (hoặc PR mới nếu PR cũ đã đóng), thêm "Vòng n" trong báo cáo thực hiện, giữ lịch sử.

## 4. Git

| Mục | Quy định |
|---|---|
| Repo / nhánh gốc | `duong2604/cat_gpt`, base `origin/develop` mới nhất |
| Nhánh làm việc | `docs/th-<số>-<mô-tả-ngắn>`, mỗi task một nhánh |
| Phạm vi file | Chỉ `docs/thesis-report/`. Không sửa `docs/thesis/`, tài liệu TL/SE, `CLAUDE.md`, mã nguồn, cấu hình |
| Commit | Conventional Commits, `docs(thesis): …`; stage từng đường dẫn cụ thể, **không** `git add .` |
| Trước commit | Xem staged diff; mọi file thuộc phạm vi task; không có thông tin nhạy cảm |
| Tích hợp | Push nhánh riêng → PR vào `develop`; **Thesis Agent không tự merge** |
| Cấm | Force push, `reset --hard`, `clean`, stash/ghi đè việc của người khác khi chưa được phép, đổi git config hoặc branch protection, merge vào `main` |
| Không đưa lên GitHub | File Word, PDF, bản sao lưu, tài liệu gốc cá nhân (đề cương, quy định có chữ ký), ảnh chứa dữ liệu riêng tư, khóa API |

Nếu `develop` local và `origin/develop` bị diverged, hoặc có thay đổi lạ trong phạm vi task: dừng và báo cáo.

## 5. Human Edit Protection

Bắt buộc cho mọi task sửa file Word chính thức `D:\workspace\CAT_GPT_Thesis\CAT_GPT_DATN.docx`. File này và chỉnh sửa thủ công của sinh viên là **nguồn nội dung có thẩm quyền**.

**Trước khi sửa**
1. Xác định đúng file chính thức (đường dẫn, kích thước, thời điểm sửa cuối).
2. Kiểm tra file có đang mở trong Word / có lock file `~$*.docx` / có thay đổi chưa lưu. Nếu đang mở: **không** đóng Word, **không** bỏ qua thay đổi chưa lưu — dừng và nhờ sinh viên lưu, đóng.
3. Đọc phiên bản mới nhất; so với trạng thái ghi lại ở lần thực hiện trước (hash SHA-256, danh sách heading, số trang/ký tự từng mục).
4. Sao lưu nguyên trạng: `backups\CAT_GPT_DATN_<yyyyMMdd-HHmmss>_<TH-xxx>-before.docx`.
5. Liệt kê chính xác các mục (heading) được phép sửa theo task.

**Trong khi sửa**
- Chỉ sửa trong phạm vi task; sửa tại chỗ qua COM Automation, không tái tạo toàn bộ file, không sinh lại từ Markdown.
- Không ghi đè chỉnh sửa thủ công, không sửa nội dung đã `APPROVED`.
- Không sửa khi sinh viên đang thao tác trên cùng file.

**Sau khi sửa**
- Mở lại bằng Word thành công; cập nhật field (mục lục, danh mục, caption).
- So sánh: nội dung ngoài phạm vi task không đổi (so văn bản từng heading trước/sau).
- Kiểm tra style, heading, bảng, hình, field liên quan.
- Ghi hash mới, đường dẫn backup và danh sách mục đã đổi vào báo cáo thực hiện.

**Xung đột**: phát hiện chỉnh sửa thủ công trong chính phạm vi task mà không hợp nhất an toàn được → dừng, `BLOCKED`, chờ sinh viên quyết định. Không tự khôi phục backup nếu có thể làm mất chỉnh sửa mới.

## 6. Source Baseline Lock

| Baseline | Giá trị | Ai xác định |
|---|---|---|
| Handover Baseline | `c34410bba27504a6552c978bb3ab9f2a17719138` — bộ nguồn TL-004 lúc bàn giao | Đã chốt (PR #56) |
| Audit Baseline | SHA đầy đủ `origin/develop` tại thời điểm **bắt đầu** TH-002 | TH-002 ghi nhận |
| Report Baseline | SHA dùng để mô tả hiện thực, chụp ảnh, kiểm thử trong báo cáo | Chốt sau khi TH-002 `APPROVED` |

- Mọi nhận định kỹ thuật trong báo cáo dựa trên Report Baseline.
- Không tự cập nhật baseline giữa chừng. Khi `develop` có thay đổi đáng kể, Thesis Agent ghi đánh giá ảnh hưởng (mục nào lệch, mức độ) và đề xuất; Project Owner quyết định có dời baseline không ([decisions.md](decisions.md)).

## 7. STOP CONDITION

Sau khi bàn giao một task (hoặc khi `BLOCKED`), Thesis Agent:
- Dừng thực thi, báo cáo kết quả theo mẫu trong chỉ thị của task.
- Không tự phê duyệt, không tự merge, không bắt đầu task khác.
- Không tạo/sửa file Word, không cài đặt phần mềm, không sửa outline/kế hoạch ngoài những gì task cho phép.
- Không giao tiếp tục cho agent khác.

Dừng ngay và báo cáo `BLOCKED` khi: thiếu nguồn bắt buộc; nguy cơ ghi đè việc của người khác; xung đột Git; chỉ thị mâu thuẫn với tài liệu này; cần quyền quản trị, cài phần mềm, mua bản quyền hay đổi chính sách bảo mật.

## 8. Quy trình và tiêu chí chung cho task soạn thảo

Áp dụng cho TH-004 … TH-022 (task viết nội dung vào Word). File task chỉ ghi phần riêng và dẫn chiếu mã dưới đây.

**Quy trình chung (W-STEP)**
1. Lập dàn ý chi tiết cho các mục trong phạm vi (ý chính, hình/bảng dự kiến, nguồn cho từng ý) và đối chiếu [outline.md](outline.md).
2. Với nội dung kỹ thuật: xác minh từng nhận định tại Report Baseline (file code, cấu hình, test, PR) và gắn nhãn trạng thái.
3. Với nội dung lý thuyết: dùng nguồn đã xác minh (tác giả, tiêu đề, năm, nơi công bố, URL/DOI truy cập được); thêm vào [source-register mục 3](source-register.md#3-tài-liệu-tham-khảo-học-thuật).
4. Soạn vào Word theo Human Edit Protection ([mục 5](#5-human-edit-protection)), dùng đúng style, caption, cross-reference, trích dẫn [n].
5. Cập nhật field; đếm số trang của phạm vi; tự kiểm theo TC-W.

**Tiêu chí nghiệm thu chung (TC-W)**

| Mã | Tiêu chí | Cách kiểm tra |
|---|---|---|
| TC-W1 | Đủ mọi mục/tiểu mục của phạm vi, đúng tên và thứ tự trong outline | So danh sách heading trong Word với outline |
| TC-W2 | Style đúng [format-standard](format-standard.md): Normal, Heading 1–3, caption, không định dạng thủ công lệch style | Kiểm style từng đoạn qua COM; xem trực quan |
| TC-W3 | Mỗi nhận định kỹ thuật có traceability tới nguồn tại Report Baseline; nhãn trạng thái đúng; không mô tả mock/thiết kế như đã hiện thực | Bảng traceability trong báo cáo thực hiện |
| TC-W4 | Mỗi trích dẫn [n] trỏ tới nguồn có thật, đã xác minh; không có nguồn bịa | Đối chiếu danh sách nguồn + truy cập URL/DOI |
| TC-W5 | Hình/bảng đánh số theo chương, caption đúng vị trí, được nhắc trong văn bản; hình ngoài có "Nguồn: …" | Danh mục hình/bảng tự động |
| TC-W6 | Human Edit Protection: có backup trước, hash trước/sau, nội dung ngoài phạm vi không đổi | Log so sánh trong báo cáo thực hiện |
| TC-W7 | Dung lượng trong khoảng ±25 % mức của task; không độn chữ | Đếm trang phạm vi |
| TC-W8 | Văn phong học thuật, không lặp nội dung đã viết ở chương khác; chỗ thiếu nguồn để `[CẦN BỔ SUNG: …]` và liệt kê | Đọc lại; tìm chuỗi `CẦN BỔ SUNG` |
