# Sổ đăng ký nguồn

Trạng thái: `SOURCE_PENDING` (chưa có / chưa truy cập được) · `AVAILABLE_UNVERIFIED` (có, Thesis Agent chưa đọc/kiểm chứng) · `VERIFIED` (đã đối chiếu, ghi rõ tại SHA/phiên bản nào) · `SUPERSEDED` (bị thay thế).

Traceability (file code, cấu hình, test) ghi ở đây và trong báo cáo thực hiện của task; không bắt buộc đưa đường dẫn mã nguồn vào Word. Tài liệu gốc cá nhân **không** đưa lên GitHub; chỉ ghi vị trí trên máy sinh viên.

Ghi nhận lần đầu: TH-001, 24/11/2026, `origin/develop` @ `e8cefed`.

## 1. Nguồn đầu vào

| ID | Nguồn | Loại | Vị trí | Phiên bản / SHA | Trạng thái | Mục đích | Mục báo cáo | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| SRC-001 | Quy định và hướng dẫn trình bày ĐATN (PDF, ký số) | Quy định trường | Máy sinh viên, thư mục Downloads; bản chép: [docs/thesis/sources/quy-dinh-trinh-bay-datn.md](../thesis/sources/quy-dinh-trinh-bay-datn.md) | Ký số 23/09/2021 (theo bản chép) | AVAILABLE_UNVERIFIED | Quy định trình bày | Toàn bộ; [format-standard](format-standard.md) | Thesis Agent thấy file, chưa đọc; TH-003 đối chiếu bản gốc |
| SRC-002 | Đề cương ĐATN (`…_Decuong DATN.docx`) | Đề cương đăng ký | `D:\workspace\` (máy sinh viên); bản chép: [docs/thesis/sources/de-cuong-datn.md](../thesis/sources/de-cuong-datn.md) | File sửa 30/09/2026 (theo bản ghi bàn giao) | AVAILABLE_UNVERIFIED | Tên đề tài, mục tiêu, phạm vi | Bìa, Mở đầu, 2.1 | Phê duyệt GVHD PENDING_CONFIRMATION ([OPEN-001](decisions.md#vấn-đề-còn-mở)); 2 bản khác ở Downloads ([OPEN-002](decisions.md#vấn-đề-còn-mở)) |
| SRC-003 | Báo cáo tiến độ CAT_GPT 16/11/2026 (.docx) | Báo cáo tiến độ | Máy sinh viên, thư mục Downloads | 16/11/2026 | AVAILABLE_UNVERIFIED | Bối cảnh tiến độ | Tham khảo | **Không dùng** tỷ lệ % hoàn thành (lấy từ báo cáo 27/10, chưa kiểm chứng) |
| SRC-004 | Bộ nguồn kỹ thuật TL-004 — [docs/thesis/](../thesis/README.md) (30 file theo dõi) | Tài liệu dự án | Repo | Handover Baseline `c34410b` | AVAILABLE_UNVERIFIED | Đầu vào cho mọi chương | 1–4 | Đã biết lỗi thời so với `develop` (mục 2) |
| SRC-005 | Bản ghi bàn giao TL-004 | Tài liệu dự án | [docs/tasks/TL-004-thesis-source-pack.md](../tasks/TL-004-thesis-source-pack.md#bàn-giao-sang-thesis-roadmap-v11-24112026) | PR #56, merge `e8cefed` | AVAILABLE_UNVERIFIED | Danh sách nguồn, hạn chế đã biết | — | Không phải kết quả audit độc lập |
| SRC-006 | Mã nguồn `apps/api`, `apps/web`, `packages/shared` | Mã nguồn | Repo | Audit Baseline (TH-002) | SOURCE_PENDING | Mô tả hiện thực | 2–4 | Chỉ dùng sau khi TH-002 chốt baseline |
| SRC-007 | Tài liệu thiết kế `docs/design/` (module-1 … module-4, access-control, ui-release-standards) | Thiết kế | [docs/design/](../design/) | Audit Baseline | AVAILABLE_UNVERIFIED | Yêu cầu, thiết kế | Ch.2 | Cần đối chiếu với code |
| SRC-008 | Bộ dữ liệu đánh giá RAG (TL-009) | Dữ liệu thực nghiệm | [docs/evaluation/rag-dataset/](../evaluation/rag-dataset/) | Audit Baseline | AVAILABLE_UNVERIFIED | Thực nghiệm RAG | 4.4 | Chưa đưa vào bộ nguồn TL-004 |
| SRC-009 | Hồ sơ task, PR, báo cáo ngày (`docs/tasks/`, `docs/reports/`) | Quản lý dự án | Repo | Audit Baseline | AVAILABLE_UNVERIFIED | Minh chứng kiểm thử, review | Ch.3–4 | |
| SRC-010 | Tài liệu tham khảo R1–R35 ([docs/thesis/01 mục 7](../thesis/01-outline-and-sources.md#7-tài-liệu-tham-khảo-đề-xuất)) | Học thuật / tài liệu chính thức | Bộ nguồn | — | AVAILABLE_UNVERIFIED | Cơ sở lý thuyết | Ch.1 | Chưa kiểm tra lại từng nguồn (tác giả, năm, URL/DOI) |
| SRC-011 | Ảnh giao diện [docs/thesis/images/](../thesis/images/) | Minh chứng | Repo | Chụp tại `783a8a3` và các PR cũ | AVAILABLE_UNVERIFIED | Hình Ch.3–4 | Ch.3–4 | Có thể phải chụp lại tại Report Baseline |
| SRC-012 | Sơ đồ Mermaid D1–D4, D9 [docs/thesis/diagrams/](../thesis/diagrams/) | Sơ đồ | Repo | Handover Baseline | AVAILABLE_UNVERIFIED | Tham khảo khi vẽ sơ đồ | Ch.2–3 | Chưa xuất ảnh; phản ánh code tới `783a8a3` |
| SRC-013 | Tài liệu chính thức công nghệ (TypeScript, Next.js, NestJS, CSDL, hàng đợi, nhà cung cấp LLM/embedding) | Tài liệu chính thức | Web | Theo phiên bản trong `package.json` tại Report Baseline | SOURCE_PENDING | 1.6, Ch.3 | Ch.1, Ch.3 | Một số trang trả `403` với truy cập tự động (theo bàn giao) |

## 2. Phát hiện từ bản ghi bàn giao — cần TH-002 kiểm chứng

Các mục dưới đây là **nhận định của TL khi bàn giao**, không phải kết quả audit độc lập của Thesis Agent.

| ID | Nhận định bàn giao | Cách kiểm chứng ở TH-002 |
|---|---|---|
| H-01 | Bộ nguồn TL-004 lỗi thời: nội dung kỹ thuật chủ yếu phản ánh code tới `783a8a3`; có 60 commit đổi `apps/` từ vòng TL-004 cuối (`4ed96a9`) tới `c34410b` | Đếm/đối chiếu commit tới Audit Baseline; liệt kê mục bộ nguồn bị lệch |
| H-02 | `develop` đã có module `documents`, `rag`, `storage`; bộ nguồn vẫn ghi Module 3–4 "chưa có code" | Gán nhãn trạng thái từng chức năng Module 3–4 |
| H-03 | Kết quả đánh giá RAG (TL-009, `docs/evaluation/rag-dataset/`) chưa đưa vào bộ nguồn | Xác định dữ liệu, kịch bản, kết quả có thật hay chưa |
| H-04 | Unit test trên `develop` chưa được tổng hợp đầy đủ (bộ nguồn ghi Module 1–2 chưa có unit test) | Chạy/đếm test tại Audit Baseline (không sửa code) |
| H-05 | Thay đổi SE-029 (`af27bb7`, Chat stream bằng `ReadableStream`) sửa `03-implementation.md` ngoài vòng review | Đối chiếu đoạn mô tả với code |
| H-06 | Thiếu sơ đồ D5–D8, D10 (D11 hướng phát triển); chưa xuất ảnh sơ đồ nào | Lập danh sách sơ đồ cần cho outline V1.0 |
| H-07 | Ảnh đại diện (H1-07, H1-08) chưa chụp lại trên `develop`; ảnh mobile 375 px BLOCKED | Lập danh sách ảnh cần chụp tại Report Baseline |
| H-08 | Tài liệu tham khảo ngoài chưa xác minh đầy đủ | Lập kế hoạch xác minh R1–R35 (thực hiện ở task chương tương ứng) |
| H-09 | Phê duyệt đề cương PENDING_CONFIRMATION | Giữ ở OPEN-001 |
| H-10 | Thiết kế Module 4 ghi "chờ duyệt" trong bộ nguồn; số liệu tải chưa có (SE-005 BLOCKED) | Đối chiếu trạng thái hiện tại; không viết số liệu chưa đo |

## 3. Tài liệu tham khảo học thuật

Chưa có mục nào ở trạng thái `VERIFIED`. Khi một task chương xác minh nguồn, thêm dòng dạng:

| ID | Tác giả | Tiêu đề | Năm | Nơi công bố | URL / DOI | Trạng thái | Dùng ở mục |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |
