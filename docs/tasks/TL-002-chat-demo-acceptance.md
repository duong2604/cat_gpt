# TL-002 — Nghiệm thu bản demo Chat

Trạng thái: Chờ Review (chờ khách hàng thử theo checklist)
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 0,5 ngày làm việc mỗi vòng review
Phụ thuộc: [SE-001](SE-001-chat-integration.md) — đã `Done` 15/11/2026
Hạn bàn giao review: **19/11/2026** (gửi khách hàng link bản chạy + checklist UI) · Hạn hoàn tất: **20/11/2026** — demo **local trên máy trình chiếu** ngày 20/11/2026, giờ cập nhật sau (D1)
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 (gửi khách hàng link + checklist) · hoàn tất —
Chốt: 15/11/2026 (khách hàng giao trong đợt chuẩn bị demo)
SHA cơ sở: SHA đầu PR SE-001 đã review `b01be16` · `develop` sau merge `fbffd5b`
PR: https://github.com/duong2604/cat_gpt/pull/2 (của SE-001, đã merge)

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
Đã gửi khách hàng link bản chạy và checklist UI ngày 15/11/2026 (D3 chưa chốt → dùng mặc định: chạy `develop` trên máy, mở http://localhost:3000). Chờ khách hàng thử; phản hồi ghi ở mục "Phản hồi UI". Khách hàng chốt 15/11/2026: D3 = chạy sẵn trên máy trình chiếu, mở qua localhost; **giữ `Chờ Review` đến khi khách hàng thử UI**, chỉ chuyển `Done` sau khi khách hàng xác nhận. Trước buổi demo TL gửi SHA bản chạy + checklist ngắn ([plan mục 4](../project/plan.md#4-rủi-ro)).

## Lịch sử review

### Checklist vòng 1
**Task hoặc yêu cầu** — TL-002 · PR https://github.com/duong2604/cat_gpt/pull/2 · SHA đã review `b01be16` · vòng 1
**Kết luận** — Đạt AC1–AC4; còn chờ khách hàng thử.
**Checklist**
- [x] AC1 Mỗi AC của SE-001 có kết luận và bằng chứng TL tự kiểm tra — Đạt — [SE-001 "Review vòng 1"](SE-001-chat-integration.md#review-vòng-1): 12/12 AC; phần dựa vào bằng chứng Senior Dev (clipboard, đổi tên/xóa/tìm qua UI, đăng nhập lại, tiếng Anh) ghi rõ
- [x] AC2 PR nhắm `develop`, SHA đầu PR trùng SHA đã review, mergeable — Đạt — `gh pr view 2`: `baseRefName: develop`, `headRefOid: b01be16…`, `MERGEABLE`, `CLEAN`, không có check; merge bằng `--match-head-commit b01be16…`
- [x] AC3 Merge commit có trên `origin/develop`; checklist UI chạy lại đạt — Đạt — `git fetch`: `origin/develop` = `fbffd5b` (Merge pull request #2); cây trùng `b01be16`; trên `develop`: gửi → chạy dần + nút Dừng, Tạo lại → câu mới chạy dần. Dừng và mở lại lịch sử đã chạy trên cùng cây (SE-001 AC3/AC5)
- [x] AC4 Khách hàng nhận link bản chạy + checklist ngắn, ghi rõ nội dung giả lập — Đạt — báo cáo 6.3 gửi 15/11/2026, dẫn về SE-001; link commit https://github.com/duong2604/cat_gpt/commit/fbffd5b
**Kiểm tra đã chạy** — như SE-001 "Review vòng 1".
**Trạng thái** — Chờ Review (khách hàng thử).

## Phản hồi UI
Chưa có.
