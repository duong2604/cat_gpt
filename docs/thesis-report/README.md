# Báo cáo đồ án tốt nghiệp CAT_GPT — Thesis Roadmap V1.1

Khu vực quản lý quá trình viết báo cáo đồ án tốt nghiệp (workflow TH). Workflow này chạy song song và **độc lập** với quy trình phát triển phần mềm ([docs/project/workflow.md](../project/workflow.md)); không thay đổi vai trò TL/Senior Dev.

- Đề tài: *Xây dựng hệ thống trợ lý AI nội bộ hỗ trợ hội thoại và khai thác thông tin từ tài liệu CAT GPT* (giữ nguyên theo đề cương).
- Sản phẩm cuối: một file Microsoft Word duy nhất (lưu **local**, không đưa lên repo), 60–80 trang, mục tiêu 75 trang.
- Vai trò: **Project Owner** (sinh viên — quyết định, phê duyệt) · **Thesis Advisor** (ChatGPT — lập kế hoạch, review) · **Thesis Agent** (Claude — phân tích, soạn thảo, báo cáo).

## Đọc theo thứ tự

| # | File | Nội dung |
|---|---|---|
| 1 | [master-prompt.md](master-prompt.md) | Chỉ thị nền cho agent mới — đọc đầu mỗi phiên |
| 2 | [workflow.md](workflow.md) | Vòng đời task, Review Gate, Git, Human Edit Protection, STOP CONDITION |
| 3 | [progress.md](progress.md) | Trạng thái chính thức của 24 task |
| 4 | [plan.md](plan.md) | Mục tiêu, phạm vi, roadmap 6 giai đoạn, phụ thuộc, mốc |
| 5 | [outline.md](outline.md) | Outline báo cáo đã duyệt + phân bổ trang + task phụ trách |
| 6 | [format-standard.md](format-standard.md) | Quy định trình bày (trường) và quy ước dự án |
| 7 | [decisions.md](decisions.md) | Quyết định đã duyệt và vấn đề còn mở |
| 8 | [source-register.md](source-register.md) | Nguồn, trạng thái xác minh, baseline |
| 9 | [review-log.md](review-log.md) | Lịch sử bàn giao và review |
| 10 | [tasks/](tasks/) | Đặc tả TH-001 … TH-024 |

## Tiếp tục workflow

1. `git fetch origin develop`; ghi SHA `origin/develop`.
2. Đọc [progress.md](progress.md): xác định task gần nhất và trạng thái.
3. Chỉ bắt đầu task khi **Project Owner gửi chỉ thị thực thi rõ ràng** cho task đó và task trước đã `APPROVED` ([workflow mục 2](workflow.md#2-review-gate)).
4. Làm theo file `tasks/TH-xxx.md`, bàn giao qua PR vào `develop`, dừng ở `READY_FOR_REVIEW`.

## Quan hệ với bộ nguồn `docs/thesis/`

[docs/thesis/](../thesis/README.md) là bộ nguồn kỹ thuật do TL bàn giao tại `c34410b` ([bản ghi bàn giao](../tasks/TL-004-thesis-source-pack.md#bàn-giao-sang-thesis-roadmap-v11-24112026)). Workflow TH **chỉ đọc**, không sửa bộ nguồn này; nội dung của nó được kiểm chứng lại ở TH-002 trước khi dùng.
