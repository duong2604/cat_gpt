# Tiến độ — Thesis Roadmap V1.1

Bảng trạng thái **chính thức** của 24 task; phải khớp dòng "Trạng thái" trong từng file task. Trạng thái hợp lệ và quyền chuyển: [workflow mục 2](workflow.md#2-review-gate).

Cập nhật: 24/11/2026 — Fast-track V1.2: bản nháp Word V0.1 đầy đủ, chờ review (FT-003). Trạng thái TH là theo mức bản nháp V0.1; nghiệm thu qua FT-004.

## Fast-track V1.2

| ID | Phạm vi | Trạng thái | Sản phẩm |
|---|---|---|---|
| FT-001 | Chuẩn bị, kiểm chứng nguồn, thiết lập Word (TH-001…TH-003) | READY_FOR_REVIEW | [audit](audit/TH-002-audit.md); file Word local |
| FT-002 | Soạn toàn bộ báo cáo (TH-004…TH-022) | READY_FOR_REVIEW | `CAT_GPT_DATN.docx` V0.1 (local) |
| FT-003 | Kiểm tra, bàn giao V0.1 | READY_FOR_REVIEW | PDF V0.1, `REVIEW_NOTES.md` (local) |
| FT-004 | Review và chỉnh sửa sau khi Project Owner đọc | TODO — chưa được cấp quyền | |

## Task TH (checklist phạm vi)

| Tổng | APPROVED | READY_FOR_REVIEW | IN_PROGRESS | CHANGES_REQUESTED | BLOCKED | TODO |
|---|---|---|---|---|---|---|
| 24 | 0 | 21 | 1 | 0 | 0 | 2 |

| ID | Nhiệm vụ | Giai đoạn | Trang | Trạng thái | PR | Ghi chú |
|---|---|---|---|---|---|---|
| [TH-001](tasks/TH-001.md) | Khởi tạo kế hoạch và workflow | 1 | — | READY_FOR_REVIEW | [#57](https://github.com/duong2604/cat_gpt/pull/57) | Vòng 2 — sửa theo review vòng 1 |
| [TH-002](tasks/TH-002.md) | Audit mã nguồn và tài liệu dự án | 1 | — | READY_FOR_REVIEW | | Audit Baseline `e8cefed` (tạm thời) |
| [TH-003](tasks/TH-003.md) | Thiết lập môi trường Microsoft Word | 1 | — | IN_PROGRESS | | Word + style + field xong; chưa chạy 6 kịch bản kiểm thử HEP a–f |
| [TH-004](tasks/TH-004.md) | Phần đầu và Mở đầu | 1 | 9 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-005](tasks/TH-005.md) | Chương 1 — mục 1.1–1.3 | 2 | 5 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-006](tasks/TH-006.md) | Chương 1 — mục 1.4–1.5 | 2 | 4,5 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-007](tasks/TH-007.md) | Chương 1 — mục 1.6–1.7 | 2 | 2,5 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-008](tasks/TH-008.md) | Chương 2 — mục 2.1–2.2 | 3 | 4 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-009](tasks/TH-009.md) | Chương 2 — mục 2.3 Use Case | 3 | 4 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-010](tasks/TH-010.md) | Chương 2 — mục 2.4 Luồng nghiệp vụ | 3 | 4 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-011](tasks/TH-011.md) | Chương 2 — mục 2.5–2.6 | 3 | 5 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-012](tasks/TH-012.md) | Chương 2 — mục 2.7 RAG | 3 | 3 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-013](tasks/TH-013.md) | Chương 2 — mục 2.8–2.10 | 3 | 2 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-014](tasks/TH-014.md) | Chương 3 — mục 3.1–3.2 | 4 | 4,5 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-015](tasks/TH-015.md) | Chương 3 — mục 3.3 | 4 | 4 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-016](tasks/TH-016.md) | Chương 3 — mục 3.4 | 4 | 4 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-017](tasks/TH-017.md) | Chương 3 — mục 3.5–3.7 | 4 | 5,5 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-018](tasks/TH-018.md) | Chương 4 — mục 4.1–4.2 | 5 | 3,5 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-019](tasks/TH-019.md) | Chương 4 — mục 4.3 | 5 | 1,5 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-020](tasks/TH-020.md) | Chương 4 — mục 4.4 Thực nghiệm RAG | 5 | 3,5 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-021](tasks/TH-021.md) | Chương 4 — mục 4.5–4.6 | 5 | 1,5 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-022](tasks/TH-022.md) | Kết luận, TLTK, phụ lục | 6 | 4 | READY_FOR_REVIEW | | Bản nháp V0.1 |
| [TH-023](tasks/TH-023.md) | Review toàn bộ báo cáo | 6 | — | TODO | | |
| [TH-024](tasks/TH-024.md) | Nghiệm thu và xuất bản | 6 | — | TODO | | |
| | | | **75** | | | |

## Baseline

| Baseline | SHA | Trạng thái |
|---|---|---|
| Handover | `c34410bba27504a6552c978bb3ab9f2a17719138` | Đã chốt |
| Audit | `e8cefedd62ffa1c38c049049fecada857d82793f` | Ghi 24/11/2026 khi bắt đầu audit FT-001; baseline kỹ thuật tạm thời cho V0.1 |
| Report | — | Project Owner xác nhận ở FT-004 |
