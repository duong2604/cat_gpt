# TL-002 — Nghiệm thu bản demo Chat

Trạng thái: Nháp
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 0,5 ngày làm việc mỗi vòng review
Phụ thuộc: **[SE-001](SE-001-chat-integration.md)** ở `Chờ Review` (chặn)
Hạn bàn giao review: **19/11/2026** (gửi khách hàng link bản chạy + checklist UI) · Hạn hoàn tất: **20/11/2026** (mốc demo dự kiến)
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 15/11/2026 (khách hàng giao trong đợt chuẩn bị demo)
SHA cơ sở: SHA đầu PR của SE-001 (ghi khi review)
PR: PR của SE-001

## Mục tiêu
Xác nhận bản Chat tích hợp vào `develop` đạt từng tiêu chí đã duyệt, rồi gửi khách hàng checklist thao tác để tự thử trên giao diện trước buổi demo.

## Output
- Review theo [mẫu 6.2](../project/workflow.md#62-mẫu-review-và-báo-cáo-kỹ-thuật-của-tl) ghi trong SE-001 (từng AC: kết luận + bằng chứng TL tự kiểm tra).
- Merge PR SE-001 theo [workflow mục 2](../project/workflow.md#2-luồng) bước 5–7, hoặc `Cần sửa` + prompt theo [mục 7](../project/workflow.md#7-yêu-cầu-sửa-lại).
- Báo cáo khách hàng theo [mẫu 6.3](../project/workflow.md#63-mẫu-báo-cáo-tl-cho-khách-hàng): **link bản chạy** (theo D3 của [plan](../project/plan.md#5-quyết-định-còn-mở); mặc định link commit merge trên `develop` + hướng dẫn chạy + http://localhost:3000) và **checklist UI ngắn** của SE-001; cập nhật [context.md](../project/context.md), [mục lục task](README.md), [báo cáo tiến độ](../reports/demo-progress.md).

## Phạm vi
- Làm: review, xác minh trên `develop` sau merge, báo cáo.
- Không làm: sửa code thay Senior Dev; đánh giá chất lượng câu trả lời AI (đang là nội dung giả lập).

## Nguồn yêu cầu
- Yêu cầu: yêu cầu khách hàng 15/11/2026 mục 2.3; tiêu chí AC1–AC12 của [SE-001](SE-001-chat-integration.md#checklist-nghiệm-thu).
- Function Spec / Basic Design: như SE-001.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Mỗi AC của SE-001 có kết luận riêng và bằng chứng TL tự kiểm tra | [workflow mục 9](../project/workflow.md#9-nghiệm-thu-kỹ-thuật-tl) | Review ghi trong SE-001 |
| AC2 | PR nhắm `develop`, SHA đầu PR trùng SHA đã review, mergeable | [workflow mục 2](../project/workflow.md#2-luồng) bước 5–6 | `gh pr view <số> --json baseRefName,headRefOid,mergeable,mergeStateStatus` |
| AC3 | Sau merge: merge commit có trên `origin/develop`; chạy lại checklist UI trên `develop` đạt | Workflow mục 2 bước 7 | `git fetch`; `pnpm dev` trên `develop` |
| AC4 | Khách hàng nhận link bản chạy và checklist thao tác ngắn (mở ở đâu → làm gì → sẽ thấy gì), ghi rõ nội dung trả lời là giả lập | Yêu cầu 15/11 mục 2.3 | Báo cáo 6.3 dẫn về SE-001 |

## Quyết định còn mở
D3 ở [plan](../project/plan.md#5-quyết-định-còn-mở) (khách hàng thử ở đâu) quyết định dạng "link bản chạy" trong AC4; không đổi các tiêu chí khác.

## Kết quả review
Chưa bắt đầu — chờ SE-001.

## Lịch sử review
Chưa có bàn giao.

## Phản hồi UI
Chưa có.
