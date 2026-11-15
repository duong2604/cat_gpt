# Tài liệu CAT GPT

Hướng dẫn cài đặt và chạy local nằm ở [README.md](../README.md) gốc.

## Bắt đầu từ đâu

| Cần | Mở |
|---|---|
| Kế hoạch demo, mốc, quyết định còn mở | [project/plan.md](project/plan.md) |
| Task đang có, ai làm, hạn, trạng thái | [tasks/README.md](tasks/README.md) |
| Tiến độ theo mốc demo | [reports/demo-progress.md](reports/demo-progress.md) |
| Audit tiến độ so với báo cáo 27/10/2026 | [project/preview-progress-review.md](project/preview-progress-review.md) |
| Quy trình làm việc TL / Senior Dev | [project/workflow.md](project/workflow.md) |
| Ai được xem/sửa gì; chuẩn giao diện và phát hành | [design/access-control.md](design/access-control.md), [design/ui-release-standards.md](design/ui-release-standards.md) |

## Dự án — `project/`

| Tài liệu | Nội dung |
|---|---|
| [context.md](project/context.md) | Mục tiêu, phạm vi, trạng thái từng module (đã kiểm tra trên `develop`), bản đồ mã nguồn. **Đọc đầu tiên.** |
| [plan.md](project/plan.md) | Kế hoạch demo Chat: mục tiêu theo trải nghiệm UI, [mốc](project/plan.md#2-mốc), [thứ tự việc và phụ thuộc](project/plan.md#3-thứ-tự-công-việc-ước-lượng-và-phụ-thuộc), [quyết định còn mở](project/plan.md#5-quyết-định-còn-mở) |
| [workflow.md](project/workflow.md) | **Nguồn quy trình**: [vai trò](project/workflow.md#1-vai-trò), [luồng & merge](project/workflow.md#2-luồng), [phân công và nhận task](project/workflow.md#31-phân-công-và-nhận-task), [trạng thái](project/workflow.md#4-trạng-thái-và-quyền-chuyển), [mẫu task](project/workflow.md#5-mẫu-task), [báo cáo & checklist](project/workflow.md#6-báo-cáo-và-checklist), [bàn giao lại](project/workflow.md#8-bàn-giao-lại), [nghiệm thu kỹ thuật](project/workflow.md#9-nghiệm-thu-kỹ-thuật-tl), [checklist hai vai](project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành), [điều kiện chặn merge](project/workflow.md#92-điều-kiện-chặn-merge), [phản hồi UI](project/workflow.md#10-phản-hồi-ui), [theo dõi tiến độ](project/workflow.md#11-theo-dõi-tiến-độ) |
| [preview-progress-review.md](project/preview-progress-review.md) | Audit tiến độ so với báo cáo 27/10/2026: đối chiếu từng module trên `develop` và nhánh preview, checklist trải nghiệm, [checklist kiểm chứng theo vòng](project/preview-progress-review.md#5-checklist-kiểm-chứng-của-tl) |
| [overview-and-decisions.md](project/overview-and-decisions.md) | Thông tin đề tài, nguyên tắc làm việc, quyết định kiến trúc D-01…D-11, quy ước Git, sự cố môi trường |

## Task — `tasks/`

Mục lục: [tasks/README.md](tasks/README.md). Task demo Chat: [TL-001](tasks/TL-001-chat-integration-scope.md) (khoanh phạm vi), [SE-001](tasks/SE-001-chat-integration.md) (tích hợp Chat), [TL-002](tasks/TL-002-chat-demo-acceptance.md) (nghiệm thu). Rà quyền, UI và phát hành: [TL-003](tasks/TL-003-access-ui-release-audit.md) → [SE-002](tasks/SE-002-avatar-requires-login.md), [SE-003](tasks/SE-003-release-mode-navigation.md), [SE-004](tasks/SE-004-ui-consistency.md).

## Báo cáo — `reports/`

| Tài liệu | Nội dung |
|---|---|
| [demo-progress.md](reports/demo-progress.md) | Tiến độ theo mốc demo: phần thử được, task đúng tiến độ / có nguy cơ trễ, ai giữ bước tiếp theo, quyết định cần chốt |

## Thiết kế — `design/`

| Tài liệu | Nội dung |
|---|---|
| [module-1-auth.md](design/module-1-auth.md) | Module 1: yêu cầu đã chốt, token & phiên, dữ liệu, API, màn hình, kiểm thử |
| [module-2-chat.md](design/module-2-chat.md) | Module 2: phạm vi, câu hỏi chốt, thiết kế BE/FE, giao thức SSE, kế hoạch, checklist |
| [access-control.md](design/access-control.md) | Ma trận phân quyền vai trò → màn hình → thao tác → dữ liệu → khi thiếu quyền; khoảng trống và chính sách cần chốt (Chờ Review) |
| [ui-release-standards.md](design/ui-release-standards.md) | Chuẩn giao diện (font tiếng Việt, theme, spacing, component, thông báo), chế độ phát hành `demo`/`staff`, tiêu chí chuẩn bị cho 500 nhân sự (Chờ Review) |

## Quy ước

- Yêu cầu nghiệp vụ nằm trong tài liệu thiết kế từng module (Module 1 mục 1, Module 2 mục 2–3). Không có thư mục `requirements/`; đề cương gốc giữ ngoài repo.
- `tasks/`: task và hồ sơ theo dõi phê duyệt, ID `TL-…` / `SE-…`; quy ước theo [workflow.md](project/workflow.md#3-nơi-lưu-task).
