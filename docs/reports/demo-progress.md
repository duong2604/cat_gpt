# Báo cáo tiến độ demo Chat

Theo mốc của [plan.md](../project/plan.md#2-mốc). Chi tiết từng ngày: [báo cáo ngày](daily/README.md). TL cập nhật cuối mỗi ngày làm việc và ngay khi phát hiện nguy cơ trễ mốc; mục mới nhất ở trên, giữ các mục cũ ([workflow mục 11](../project/workflow.md#11-theo-dõi-tiến-độ)).

## Cập nhật 21/11/2026 11:14 (SE-020 Done; review backend)

Chi tiết: [21/11 vòng 6–7](daily/2026-11-21.md).

| Mốc / việc | Tình trạng |
|---|---|
| Bảo mật phụ thuộc | **SE-020 Done** (PR #37 → `e040e08`): audit 26 → 5 (1 high, nhóm `minio` chờ CTO) |
| Chất lượng backend | SE-021: audit SE (22) + TL (13) → **CHANGES REQUIRED**, 2 BLOCKER (sập API khi tải về lỗi; thu hồi phiên không kiểm secret). PR-B1/B2/B4 đã giao SE; B3 + merge chờ CTO |
| Nghiệm thu M1–M4 (CTO) | Chờ CTO. Máy demo: kéo `develop` `e040e08` rồi `pnpm install` |

## Cập nhật 21/11/2026 10:36 (Security Audit vòng 2, SE-020)

Chi tiết: [21/11 vòng 4](daily/2026-11-21.md#vòng-4--1031-phiên-tl-sáng-2111-baseline-security-audit-vòng-2-kế-hoạch).

| Mốc / việc | Tình trạng |
|---|---|
| Bảo mật phụ thuộc | Audit `b7af2fb`: 26 (8 high). **SE-020** Sẵn sàng, đã giao SE: mục tiêu 26 → 5 (1 high). 5 advisory qua `minio` chờ CTO |
| Nghiệm thu M1–M4 (CTO) | Môi trường sẵn sàng trên `develop` @ `b7af2fb` (dependency đã cài, Docker healthy). Chờ CTO |
| Module 4 | Không đổi: SE-017 Chờ Review (`-large` bị chặn); SE-019 Nháp |

## Cập nhật 21/11/2026 01:40 (SE-018 Done, kết thúc phiên TL)

Chi tiết: [21/11 vòng 3](daily/2026-11-21.md).

| Mốc / việc | Tình trạng |
|---|---|
| Bảo mật phụ thuộc | SE-018 **Done** (PR #36 → `6f2271d`): `next` 16.4.6, `multer` 2.5.0; audit 34 → 26; còn 8 high ngoài phạm vi, đề xuất task riêng |
| Nghiệm thu M1–M4 (CTO) | Chờ CTO. Trước khi chạy: đưa `D:\workspace\buggysoft\cat_gpt` về `develop` và `pnpm install` (mục 4.2 vòng 3) |
| Module 4 | TL-009 Done (baseline); SE-017 Chờ Review (`-large` bị chặn); SE-019 Nháp, chờ nghiệm thu |

## Cập nhật 21/11/2026 00:40 (PR #34 merge, sẵn sàng CTO nghiệm thu)

Chi tiết: [21/11 vòng 2](daily/2026-11-21.md).

| Mốc / việc | Tình trạng |
|---|---|
| Nghiệm thu M1–M4 (CTO) | **Môi trường sẵn sàng** trên `develop` @ `356e6a6` (code = `09fbcff`, đã kiểm 38/38); `.env` đúng cấu hình demo; Docker healthy; chờ CTO chạy checklist 20 bước |
| Đánh giá RAG | TL-009 **Done**, CTO chấp nhận baseline (209 đoạn LF, hit@5 100%, precision 92–96%, từ chối nhầm 1–2/40); SE-017 Chờ Review (`-large` bị chặn) |
| Senior Dev | SE-018 chưa bắt đầu, đã yêu cầu báo blocker; SE-019 Nháp |

## Cập nhật 21/11/2026 00:30 (chỉ thị CTO round 4)

Chi tiết: [21/11 vòng 1](daily/2026-11-21.md).

| Mốc / việc | Tình trạng |
|---|---|
| Nghiệm thu M1–M4 (CTO) | Không đổi: sẵn sàng trên `develop` @ `b2d2098`; Docker healthy |
| Tài liệu | PR #34 mở, CI pass, chờ CTO cho merge |
| Đánh giá RAG | TL-009 v2 bằng chứng đạt; SE-017 `Chờ Review` (`-large` bị chặn); 3 lượt: từ chối nhầm 1–2/40, precision 92–96% |
| Senior Dev | SE-018 chưa bắt đầu (chưa có nhánh); SE-019 Nháp |
| Sự cố 19/11 | Cluster dùng chung; M0/Flex cần CTO xem Atlas UI; khuyến nghị chấp nhận mất |

## Cập nhật 21/11/2026 00:10 (thực hiện quyết định CTO 20/11)

Chi tiết: [20/11 vòng 4](daily/2026-11-20.md).

| Mốc / việc | Tình trạng |
|---|---|
| Nghiệm thu M1–M4 (CTO) | Sẵn sàng trên `develop` @ `b2d2098` (code = `09fbcff`, đã kiểm 38/38); Docker healthy; checklist 20 bước ở vòng 3 mục 11 |
| Module 4 | SE-017 chạy lại sau TL-009 v2: hit@5 100%, MRR 0,881, từ chối nhầm 1/40, rubric 1,78; **Chờ Review**, `-large` bị chặn |
| Tài liệu | PR #30 merge (`b2d2098`); PR docs vòng 4 chờ CTO |
| Senior Dev | SE-018 đã giao, SE xác nhận; SE-019 Nháp (sau nghiệm thu) |
| Sự cố 19/11 | Báo cáo sự cố; 2 hội thoại mất, 0 tin nhắn mất; backup chưa xác định (cần Atlas UI) |

## Cập nhật 20/11/2026 23:40 (kiểm tích hợp M1–M4, chuẩn bị CTO nghiệm thu)

Chi tiết: [20/11 vòng 3](daily/2026-11-20.md).

| Mốc / việc | Tình trạng |
|---|---|
| Nghiệm thu M1–M4 (CTO chạy local) | **Sẵn sàng trên `develop` @ `09fbcff`**: TL kiểm API thật 38/38 đạt; hướng dẫn chạy + checklist 20 bước ở vòng 3 mục 11 |
| Bản đóng băng `34b465d` | Khởi động được (M1 + Chat mẫu, 5/5); không có M3–M4; không sửa |
| Module 4 | SE-014/015/016 Done; SE-017 **Chờ Review** (đính chính: phần `-small` xong, rubric 1,70/2, 0 hallucination, ≈ $0,0016/câu; `-large` chờ quyền API) |
| Senior Dev | SE-018 (vá bảo mật) Sẵn sàng, chỉ thị đã soạn, chưa có xác nhận nhận việc |
| Sự cố dữ liệu 19/11 | Quy tắc phòng ngừa đưa vào workflow 9.1; 2 hội thoại admin chưa khôi phục, chờ CTO |

## Cập nhật 20/11/2026 01:30 (SE-017 merge)

Chi tiết: [20/11 vòng 2](daily/2026-11-20.md).

| Mốc / việc | Tình trạng |
|---|---|
| Module 4 | SE-014…SE-017 trên `develop` @ `09fbcff`; SE-017 chỉ có `text-embedding-3-small` (hit@5 92,5%, MRR 0,758); so sánh `-large` bị chặn chờ quyền API |

## Cập nhật 20/11/2026 01:10 (Module 4: hỏi đáp + tóm tắt có UI)

Chi tiết: [20/11 vòng 1](daily/2026-11-20.md).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 | Bản đóng băng `34b465d` không đổi (M1 + Chat mẫu); chưa chạy thử khởi động; giờ demo chưa chốt |
| Module 4 | SE-014, SE-015, SE-016 **Done** trên `develop` @ `7ff3c62` (hỏi đáp có trích dẫn + tóm tắt, có UI, TL nghiệm thu với 2 tài khoản); SE-017 đánh giá: đã giao, phần `text-embedding-3-large` bị chặn chờ quyền API |
| Sự cố | Xóa nhầm 2 hội thoại admin khi dọn dữ liệu thử (19/11); chờ CTO quyết khôi phục |

## Cập nhật 19/11/2026 (SE-014 merge, backend Module 4)

Chi tiết: [19/11 vòng 1–2](daily/2026-11-19.md).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 | Có nguy cơ (quy trình): bản `34b465d` không đổi, code vẫn trùng `fbffd5b`; chưa có xác nhận tin trước demo đã tới khách hàng; giờ demo chưa chốt |
| Module 4 | SE-014 **Done** (PR #28 → `124ccee`; R1–R11 trên service thật, TL tự kiểm R1/R2/R4); SE-015 **Sẵn sàng**, giao; SE-016, SE-017 Nháp theo gate; SE-017 còn chờ quyền `text-embedding-3-large` |

## Cập nhật 18/11/2026 (Module 3 hoàn thành)

Chi tiết: [18/11 vòng 1–4](daily/2026-11-18.md).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 | Đúng kế hoạch — `34b465d` (code `fbffd5b`) không đổi; giờ demo chưa chốt |
| Module 3 | **Hoàn thành** trên `develop` @ `1c45249`: SE-011 backend TXT (`abc5a55`), SE-012 trang Tài liệu (`cd386e5`), SE-013 PDF/DOCX (`1c45249`); TL nghiệm thu từng PR trên service thật |
| Module 4 | TL-008 Done (AC4 đạt trên `develop`); SE-014 **Sẵn sàng, giao ngay** (P0); SE-015…SE-017 nội dung sẵn sàng; TL-009 Chờ Review (CTO chọn phương án A) |

## Cập nhật 17/11/2026 đêm (SE-003 merged, Module 4 thiết kế)

Chi tiết: [17/11 vòng 2](daily/2026-11-17.md#vòng-2--0045).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 | Đúng kế hoạch — `34b465d` (code `fbffd5b`) không đổi |
| Luồng chính đã xác minh trên `develop` | Module 1; Chat phản hồi mẫu; Chat OpenAI thật (code `783a8a3`); chế độ `demo`/`staff` |
| Module 3 | SE-010 **Done** (`9f502d1`, CI có trên repo); SE-011 Sẵn sàng — nhận ngay |
| Module 4 | TL-008: CTO duyệt kiến trúc có điều kiện 17/11, chốt Q-M4-1…5; còn AC4 (payload Qdrant thật, chờ SE-011); SE-014…SE-017 Nháp |

## Cập nhật 17/11/2026 (Wave 1 chuẩn bị)

Chi tiết: [17/11 vòng 1](daily/2026-11-17.md#vòng-1--0020).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 | Đúng kế hoạch — `34b465d` không đổi |
| Luồng chính đầu–cuối đã xác minh | 2 trên `develop` (Module 1; Chat phản hồi mẫu) + Chat OpenAI thật (TL kiểm trên đầu PR #6) |
| SE-003 (PR #6) | Review vòng 4 **đạt kỹ thuật**; merge chờ khách hàng cho phép trước 20/11 |
| Module 3 | TL-007 Done; SE-010 Sẵn sàng → SE-011 Sẵn sàng (sau SE-010) |
| Object storage | MinIO legacy tạm cho dev; đề xuất RustFS (đã chạy thử) |

## Cập nhật 16/11/2026 (lộ trình Module 3–4, Wave 0–2)

Chi tiết: [16/11 vòng 5](daily/2026-11-16.md#vòng-5--1655). Lộ trình: [plan mục 8](../project/plan.md#8-lộ-trình-module-34-cto-duyệt-16112026).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 | Đúng kế hoạch — `34b465d` không đổi |
| Luồng chính đầu–cuối đã xác minh trên `develop` | 2 (Module 1; Chat phản hồi mẫu). OpenAI thật trên `develop`: chưa xác minh |
| Module 3 — thiết kế (TL-007) | Chờ Review — đường găng #1 |
| Module 3 — SE-010 hạ tầng + CI | Sẵn sàng (sau SE-003 vòng 4) |
| Môi trường dev | Đạt (Redis, MinIO legacy, Qdrant, Atlas); chờ chốt Q-INF-1 |
| Việc chặn chờ quyết định | TL-007, Q4, Q-INF-1, W1, P1, khóa OpenAI cho TL |

## Cập nhật 16/11/2026 chiều (bộ nguồn đồ án vòng 4)

Chi tiết: [16/11 vòng 4](daily/2026-11-16.md#vòng-4--1605).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 | Đúng kế hoạch — máy trình chiếu giữ `34b465d` |
| TL-004 vòng 4 | **Chờ Review** — SE-002/SE-007 ghi đã tích hợp; còn chụp lại ảnh (B13) — Sớm so với 25/11 |
| SE-003 (PR #6) | Chờ Senior Dev ghép `develop` (PR đang `DIRTY`) — hạn 25/11, Đúng kế hoạch |
| TL-005 | Chờ khách hàng chọn SHA nguồn (đề xuất vòng 4) và mở phiên Word |

## Cập nhật 16/11/2026 (tích hợp sớm PR #3, PR #4)

Chi tiết: [16/11 vòng 3](daily/2026-11-16.md#vòng-3--0058).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 | Đúng kế hoạch — máy trình chiếu giữ `34b465d` (không theo `develop`) |
| SE-002, SE-007 | **Done 16/11** — merge `1674425`, `d6832e0` (khách hàng cho tích hợp sớm), xác minh trên `develop` |
| SE-003 (PR #6) | Chờ Senior Dev ghép `develop` (có PR #4) — hạn 25/11 |
| TL-004 vòng 4, TL-005 | Có thể làm sớm: bộ nguồn cập nhật theo `d6832e0`; Word nháp chờ mở phiên |

## Cập nhật 15/11/2026 (SE-007 đạt kỹ thuật; bộ nguồn đồ án)

Chi tiết: [15/11 vòng 4](daily/2026-11-15.md#vòng-4--1900).

| Mốc / việc | Tình trạng |
|---|---|
| M4 Demo 20/11 (giờ chờ chốt) | Đúng kế hoạch — bản `34b465d` không đổi |
| Sau demo 23–24/11: PR #3 / SE-002 → PR #4 / SE-007 | Cả hai đạt review TL; SE-007 khách hàng xác nhận đạt kỹ thuật 15/11; chờ tích hợp |
| TL-004 bộ nguồn đồ án | Vòng 1 Chờ Review; dự kiến bộ nguồn 19/11, cập nhật sau tích hợp 25/11 (hạn chờ chốt) |
| SE-008 tài liệu hiện thực + bằng chứng | Sẵn sàng; dự kiến bàn giao 18/11, trước SE-003 (hạn SE-003 25/11 không đổi) |

## Cập nhật 15/11/2026 (SE-002 đạt review — báo cáo ngày)

Từ 15/11/2026 chi tiết hằng ngày ở [báo cáo ngày](daily/README.md); mục này chỉ tóm tắt theo mốc. Chi tiết: [15/11 vòng 1](daily/2026-11-15.md#vòng-1--1720).

| Mốc | Tình trạng |
|---|---|
| M0–M3 | Đạt 15/11 |
| M4 Demo 20/11 (giờ chờ chốt) | Đúng kế hoạch — bản `34b465d` không đổi |
| Sau demo: SE-002 | Bàn giao 15/11, TL review đạt; merge dự kiến 23/11 (hạn hoàn tất 24/11) |
| Sau demo: SE-003 | Sẵn sàng; hạn 25/11 / 26/11 |
| Sau demo: SE-005, SE-006, SE-004 | Sẵn sàng; lịch dự kiến, chưa duyệt |

## Cập nhật 15/11/2026 (TL-003 vòng 3 — xếp lại task sau demo)

Bản demo 20/11 **không đổi** (code `fbffd5b`, máy trình chiếu `34b465d`); giờ demo chờ chốt. Senior Dev đã nhận phạm vi mới của SE-002 (commit local `977c03d`; PR #3 mở, trên GitHub còn `02f31f5`, chưa bàn giao).

| Thứ tự | Task | Trạng thái | Bàn giao / hoàn tất | Tiến độ |
|---|---|---|---|---|
| 1 | [SE-002](../tasks/SE-002-avatar-requires-login.md) ảnh chỉ chính chủ | **Đang làm** | 23/11 / 24/11 | Đúng kế hoạch |
| 2 | [SE-003](../tasks/SE-003-release-mode-navigation.md) bản `demo`/`staff` | Sẵn sàng | 25/11 / 26/11 | Đúng kế hoạch |
| 3 | [SE-005](../tasks/SE-005-login-limit-shared-ip.md) đăng nhập chung IP | Sẵn sàng | Dự kiến 27/11 / 30/11 | Chưa bắt đầu |
| 4 | [SE-006](../tasks/SE-006-account-admin-rules.md) quản trị tài khoản + công cụ khôi phục | Sẵn sàng | Dự kiến 02/12 / 03/12 | Chưa bắt đầu |
| 5 | [SE-004](../tasks/SE-004-ui-consistency.md) giao diện nhất quán | Sẵn sàng | Dự kiến 04/12 / 07/12 | Chưa bắt đầu |

Cần khách hàng / CTO chốt: giờ demo (D1); R1 — người phê duyệt và người thực hiện [khôi phục admin](../design/access-control.md#41-quy-trình-khôi-phục-tài-khoản-admin-đề-xuất--chờ-duyệt); Q1 — chặn tạm theo IP khi dò mật khẩu ([SE-005](../tasks/SE-005-login-limit-shared-ip.md#quyết-định-còn-mở)); duyệt mốc dự kiến SE-005, SE-006, SE-004.

## Cập nhật 15/11/2026 (quyết định quyền và UI — TL-003 vòng 2)

Bản demo 20/11 **không đổi** (code `fbffd5b`, máy trình chiếu chạy `34b465d`); giờ demo chờ chốt. Khách hàng duyệt TL-003, chốt CS-1…CS-6 và font Be Vietnam Pro.

| Task | Trạng thái | Hạn bàn giao / hoàn tất | Tiến độ |
|---|---|---|---|
| [SE-002](../tasks/SE-002-avatar-requires-login.md) ảnh chỉ chính chủ | **Đang làm** (từ 15/11) | 23/11 / 24/11 | Đúng kế hoạch — phạm vi đổi 15/11, Senior Dev điều chỉnh |
| [SE-003](../tasks/SE-003-release-mode-navigation.md) bản `demo`/`staff` | Sẵn sàng | 25/11 / 26/11 | Đúng kế hoạch |
| [SE-006](../tasks/SE-006-account-admin-rules.md) quy tắc quản trị tài khoản | Sẵn sàng | Chờ chốt (đề xuất 27/11 / 28/11) | — |
| [SE-005](../tasks/SE-005-login-limit-shared-ip.md) đăng nhập chung IP | Sẵn sàng | Chờ chốt (đề xuất 28/11 / 29/11) | — |
| [SE-004](../tasks/SE-004-ui-consistency.md) giao diện nhất quán | Sẵn sàng | Chờ chốt (đề xuất 30/11 / 01/12) | — |

Mọi task merge **sau buổi demo 20/11**. Khách hàng thử được SE-002 từ 24/11, SE-003 từ 26/11 (sau khi TL merge và xác minh trên `develop`).

Cần khách hàng / CTO chốt: giờ demo (D1); hạn SE-006, SE-005, SE-004.

## Cập nhật 15/11/2026 (rà quyền, UI và phát hành — TL-003)

Cơ sở kiểm tra: `origin/develop` @ `06a5a83` (code giống bản demo `fbffd5b`). **Bản demo 20/11 không đổi**: không có thay đổi code; các task mới chỉ merge sau buổi demo.

- **Không có lỗi phân quyền hay lỗi chặn demo.** Nhân viên không xem được hội thoại của người khác; quản trị viên quản lý tài khoản nhưng không đọc được nội dung Chat. Chi tiết: [ma trận phân quyền](../design/access-control.md).
- **Cần sửa trước khi mở cho nhân viên:** ảnh đại diện mở được khi chưa đăng nhập ([SE-002](../tasks/SE-002-avatar-requires-login.md)); ẩn tính năng chưa sẵn sàng ở bản nhân viên ([SE-003](../tasks/SE-003-release-mode-navigation.md)); đăng nhập bị giới hạn 5 lần/phút cho mỗi IP — 500 người chung mạng công ty sẽ bị chặn ([tiêu chí R-3](../design/ui-release-standards.md#4-tiêu-chí-chuẩn-bị-cho-500-nhân-sự)).
- Task: TL-003 `Chờ Review`; SE-002, SE-003 `Sẵn sàng` (Senior Dev nhận ngay, merge sau 20/11); SE-004 `Nháp`.

Cần khách hàng / CTO chốt: CS-1…CS-6 ([access-control mục 4](../design/access-control.md#4-chính-sách-đã-chốt)), U1 (chuẩn giao diện, font Be Vietnam Pro), hạn SE-002/SE-003 (đề xuất 23–26/11), giờ demo (D1).

## Cập nhật 15/11/2026 (chốt ngày demo và nơi chạy)

Cơ sở: `origin/develop` @ `8666859` (code Chat như `fbffd5b`; sau đó chỉ có commit tài liệu). Khách hàng chốt:
- **D1:** demo **20/11/2026**; giờ cụ thể khách hàng cập nhật sau.
- **D3:** khách hàng chạy sẵn CAT GPT trên **máy trình chiếu**, mở Chat qua http://localhost:3000. Không cần task triển khai.
- TL-002 giữ `Chờ Review` đến khi khách hàng thử UI.

| Mốc | Hạn | Tình trạng | Ai giữ bước tiếp theo |
|---|---|---|---|
| M0–M3 | 15/11–19/11 | Đạt 15/11 | — |
| M4 Demo | **20/11** (giờ: Chờ chốt) | Đúng kế hoạch | Khách hàng (thử UI, báo giờ); TL (gửi SHA bản chạy + checklist trước demo) |

| Task | Trạng thái | Tiến độ |
|---|---|---|
| [SE-001](../tasks/SE-001-chat-integration.md) | Done 15/11 | Sớm |
| [TL-002](../tasks/TL-002-chat-demo-acceptance.md) | Chờ Review (đến khi khách hàng thử UI) | Đúng kế hoạch |

Cần khách hàng chốt: **giờ demo** ngày 20/11.

## Cập nhật 15/11/2026 (Chat lên `develop`)

Cơ sở: `origin/develop` @ `fbffd5b` (merge PR #2). SE-001 bàn giao và đạt review trong ngày; Chat đã có trên `develop`, nội dung trả lời vẫn là văn bản mẫu.

### Theo mốc

| Mốc | Hạn | Tình trạng | Ai giữ bước tiếp theo |
|---|---|---|---|
| M0 Tài liệu + TL-001 | 15/11 | Đạt 15/11 | — |
| M1 Chốt phạm vi | 16/11 | Đạt 15/11 | — |
| M2 SE-001 bàn giao | 18/11 | Đạt 15/11 — sớm 3 ngày | — |
| M3 Chat lên `develop` + gửi link và checklist | 19/11 | Đạt 15/11 — sớm 4 ngày | — |
| M4 Demo | 20/11 (giờ: Chờ chốt) | Đúng kế hoạch | **Khách hàng** (thử checklist, chốt giờ D1 và nơi thử D3) |

### Thử được ngay
- **Trên `develop` @ `fbffd5b`:** đăng nhập, hồ sơ, quản trị người dùng và **Trò chuyện** (http://localhost:3000/chat sau khi chạy theo [README](../../README.md#chạy-dự-án)). Checklist thao tác Chat: [SE-001](../tasks/SE-001-chat-integration.md#checklist-nghiệm-thu) (phần "Checklist UI dự kiến cho khách hàng").

### Task

| Task | Trạng thái | Tiến độ |
|---|---|---|
| [TL-001](../tasks/TL-001-chat-integration-scope.md) | Done 15/11 | Đúng hạn |
| [SE-001](../tasks/SE-001-chat-integration.md) | Done 15/11 | Sớm (hạn hoàn tất 19/11) |
| [TL-002](../tasks/TL-002-chat-demo-acceptance.md) | Chờ Review (khách hàng thử) | Đúng kế hoạch |

Không còn nguy cơ trễ mốc 20/11 từ phía code. Việc còn lại trước demo: khách hàng thử checklist; TL chạy lại checklist trên máy demo.

### Cần khách hàng / CTO chốt
1. **D1 — Giờ demo** ngày 20/11.
2. **D3 — Thử bản Chat ở đâu?** Hiện dùng mặc định (chạy trên máy, mở http://localhost:3000). Cần link mở được từ xa thì báo trước 18/11 (thêm ~1 ngày triển khai, cần tài khoản hosting).

## Cập nhật 15/11/2026 (sau quyết định của khách hàng)

Cơ sở: `origin/develop` @ `6f9d3e4`. Khách hàng chốt: duyệt TL-001 và Q3; demo đầu tiên dùng phản hồi mẫu; giữ Module 3–4 ở preview; mốc demo dự kiến **20/11/2026**, giờ chốt sau ([plan mục 5](../project/plan.md#5-quyết-định-còn-mở)).

### Theo mốc

| Mốc | Hạn | Tình trạng | Ai giữ bước tiếp theo |
|---|---|---|---|
| M0 Tài liệu + TL-001 | 15/11 | Đạt 15/11 | — |
| M1 Chốt phạm vi | 16/11 | Đạt 15/11 — sớm 1 ngày | — |
| M2 SE-001 bàn giao | 18/11 | Đúng kế hoạch — SE-001 `Sẵn sàng`, dự kiến bàn giao 17/11 | **Senior Dev** |
| M3 Chat lên `develop` + gửi khách hàng link và checklist | 19/11 | Đúng kế hoạch — chờ M2 | TL |
| M4 Demo | 20/11 (giờ: Chờ chốt) | Đúng kế hoạch | Khách hàng (chốt giờ) |

### Thử được ngay
Không đổi so với mục dưới: Module 1 trên `develop`; Chat chỉ xem trước được trên preview.

### Task

| Task | Trạng thái | Tiến độ |
|---|---|---|
| [TL-001](../tasks/TL-001-chat-integration-scope.md) | Done 15/11 | Đúng hạn |
| [SE-001](../tasks/SE-001-chat-integration.md) | Sẵn sàng | Đúng kế hoạch (dự kiến 17/11 ≤ hạn 18/11) |
| [TL-002](../tasks/TL-002-chat-demo-acceptance.md) | Nháp (chờ SE-001) | Đúng kế hoạch |

Dự phòng: đủ cho một vòng `Cần sửa`. Bàn giao muộn hơn 17/11 kèm cần sửa, hoặc vòng sửa thứ hai → `Có nguy cơ trễ` mốc 20/11.

### Cần khách hàng / CTO chốt
1. **D1 — Giờ demo** ngày 20/11.
2. **D3 — Thử bản Chat ở đâu?** Chưa có môi trường chung. Mặc định: chạy trên máy anh/chị hoặc máy demo, mở http://localhost:3000; TL gửi link commit và hướng dẫn chạy. Nếu cần một đường link mở được từ xa, cần thêm việc triển khai (~1 ngày, cần tài khoản hosting) — xin chốt trước 18/11.

## Cập nhật 15/11/2026 (cuối ngày)

Cơ sở: `origin/develop` @ `a860437` (trước đợt tài liệu). Báo cáo này nằm trong chính đợt tài liệu được tích hợp vào `develop`; SHA tích hợp ghi trong báo cáo gửi khách hàng và ở lần cập nhật kế tiếp.

### Theo mốc

| Mốc | Tình trạng | Ai giữ bước tiếp theo |
|---|---|---|
| M0 Tài liệu + TL-001 | **Đạt** — tài liệu quy trình, audit, plan, task tích hợp vào `develop` cùng báo cáo này; TL-001 đã bàn giao | Khách hàng + CTO review |
| M1 Chốt phạm vi | Đang chờ — cần duyệt TL-001 và chốt Q3, D1, D2 | **Khách hàng + CTO** |
| M2 SE-001 bàn giao | Chưa bắt đầu — chờ M1 | Senior Dev (sau khi TL chuyển `Sẵn sàng`) |
| M3 Chat lên `develop` | Chưa bắt đầu — chờ M2 | TL |
| M3b AI thật | Chỉ áp dụng nếu D2 = có | — |
| M4 Demo | Chưa có ngày (D1) | Khách hàng + CTO |

### Thử được ngay
- **Trên `develop`:** đăng nhập, hồ sơ, phiên đăng nhập, quản trị người dùng — mở http://localhost:3000 sau khi chạy theo [README](../../README.md#chạy-dự-án). Checklist thao tác: [audit mục 4](../project/preview-progress-review.md#4-checklist-trải-nghiệm-cho-khách-hàng).
- **Chat:** chưa có trên `develop`. Có thể xem trước trên nhánh preview (nội dung trả lời là văn bản mẫu) theo cách mở ở [audit mục 4](../project/preview-progress-review.md#4-checklist-trải-nghiệm-cho-khách-hàng).

### Task

| Task | Trạng thái | Tiến độ | Ghi chú |
|---|---|---|---|
| [TL-001](../tasks/TL-001-chat-integration-scope.md) | Chờ Review | Đúng kế hoạch — bàn giao 15/11, đúng hạn bàn giao review | Phát hiện: Chat cần 3 phần nằm trong commit demo Module 3–4 (đã có cách tách); thiếu giới hạn 20 tin/phút/người so với thiết kế |
| [SE-001](../tasks/SE-001-chat-integration.md) | Nháp | Chưa đánh giá (chờ chốt hạn) | Đã soạn xong; sẵn sàng giao ngay khi M1 chốt |
| [TL-002](../tasks/TL-002-chat-demo-acceptance.md) | Nháp | Chưa đánh giá (chờ chốt hạn) | Chờ SE-001 |

Nguy cơ trễ: chưa xác định được vì chưa có ngày demo. Mỗi ngày M1 chưa chốt, mốc demo sớm nhất lùi một ngày làm việc (sớm nhất hiện tại: 20/11 nếu chốt 16/11, nội dung giả lập).

### Cần khách hàng / CTO chốt
1. **D1 — Ngày giờ demo.**
2. **D2 — Demo có bắt buộc AI trả lời thật không?** Có → thêm khoảng 2–3 ngày và cần chọn nhà cung cấp AI.
3. **Q3 — Duyệt phạm vi Chat** ([TL-001](../tasks/TL-001-chat-integration-scope.md#quyết-định-còn-mở)): đồng ý các đề xuất mặc định của Module 2 (gồm 3 thư viện hiển thị markdown) và thêm giới hạn 20 tin/phút cho mỗi người dùng.
