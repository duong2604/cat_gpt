# Refactor `docs/` và tài liệu onboarding cho TL / Senior Dev

Trạng thái: Chờ Review
Chốt: 15/11/2026 (phạm vi giao trực tiếp qua yêu cầu của chủ dự án)
SHA cơ sở: `origin/develop` @ `a860437f45124636f4eea87b3209635f4e2d4d7d`
Loại: tài liệu TL soạn, chủ dự án và CTO phê duyệt. Vòng 1–6 review trên diff local nhánh `docs/reorganize-project-docs`; từ vòng 7 tích hợp vào `develop` theo quyền khách hàng giao ngày 15/11/2026, nội dung vẫn chờ duyệt

## Mục tiêu
Sắp xếp `docs/` theo nội dung, tạo tài liệu onboarding và quy trình làm việc để TL và Senior Dev đọc khi bắt đầu phiên.

## Output
- `CLAUDE.md`, `docs/README.md`, `docs/project/context.md`, `docs/project/workflow.md`
- Di chuyển: `docs/00-tong-quan.md` → `docs/project/overview-and-decisions.md`, `docs/module-1-auth.md` → `docs/design/module-1-auth.md`, `docs/module-2-chat.md` → `docs/design/module-2-chat.md`
- `README.md`: liên kết tới `docs/README.md`
- `docs/tasks/README.md` (mục lục task) và file này (hồ sơ theo dõi phê duyệt)
- Vòng 7: `docs/project/plan.md`, `docs/reports/demo-progress.md`, task `TL-001`, `SE-001`, `TL-002`; cập nhật audit `docs/project/preview-progress-review.md` (checklist vòng 2)

## Phạm vi
- Làm: tài liệu và tham chiếu tới tài liệu. Vòng 7: commit và tích hợp đợt tài liệu vào `develop` (được giao 15/11/2026).
- Không làm: code (phần Chat đi qua SE-001); `docs/ket-qua-tam-thoi.md`; merge vào `main`.

## Nguồn yêu cầu
- Yêu cầu/quyết định đã duyệt: các yêu cầu của khách hàng trong phiên làm việc 15/11/2026, tóm tắt tại "Review vòng 1–5" bên dưới (chưa có file nguồn riêng).
- Function Spec / Basic Design: không áp dụng (task tài liệu, không có hành vi sản phẩm).

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | `git diff HEAD --check` sạch; `git diff HEAD --name-status -M` chỉ gồm file trong Output | Yêu cầu vòng 1, mục 4 | Chạy lệnh |
| AC2 | Mọi liên kết tương đối và anchor trong `README.md`, `CLAUDE.md`, `docs/**` hợp lệ; không còn đường dẫn cũ | Yêu cầu vòng 1, mục 4 | Script kiểm tra liên kết/anchor; `grep` đường dẫn cũ |
| AC3 | `context.md` phân biệt trạng thái kiểm tra trong code với trạng thái ghi trong tài liệu | Yêu cầu vòng 1, mục 3 | Đọc `context.md` mục 3 |
| AC4 | `workflow.md` là nguồn quy trình và phản ánh đủ quyết định các vòng; `CLAUDE.md` và `docs/README.md` dẫn tới đúng mục | Review vòng 2–5 | Đối chiếu từng quyết định với heading tương ứng |

## Kết quả review
Chưa có kết luận của khách hàng / CTO. Bàn giao mới nhất: [Checklist vòng 7](#checklist-vòng-7).

## Lịch sử review

### Checklist vòng 1
*Đính kèm từ báo cáo gốc; vòng này bàn giao trước khi có mẫu checklist nên ghi lại dạng tóm tắt.*

**Task hoặc yêu cầu** — refactor `docs/` + onboarding, nhánh `docs/reorganize-project-docs` @ `a860437`
**Kết quả** — tạo `project/`, `design/`; di chuyển 3 file; tạo `CLAUDE.md`, `docs/README.md`, `context.md`, `workflow.md`; thêm liên kết trong `README.md`.
**Checklist**
- [x] Không tạo `requirements/`, `tasks/` khi chưa có nội dung — đã ghi lý do trong `docs/README.md`
- [x] `git diff --check` — sạch
- [x] Liên kết/anchor — 8 file, 0 lỗi; không có ảnh; không còn đường dẫn cũ
- [ ] Quyết định mở — chờ chủ dự án: dòng trạng thái cũ ở `module-1-auth.md`, thư mục `requirements/` + đề cương, nơi lưu task, `ket-qua-tam-thoi.md`

**Trạng thái và bước tiếp theo** — Chờ Review

#### Review vòng 1
Chủ dự án: sửa trạng thái Module 1 (dòng 3, 106, 118) thành đã tích hợp qua PR #1, giữ sự kiện lịch sử; bảng trạng thái trong `overview-and-decisions.md` giữ theo mốc lịch sử; yêu cầu nghiệp vụ giữ trong tài liệu module; đề cương ngoài repo; task lưu Markdown ở `docs/tasks/`; để `ket-qua-tam-thoi.md` cho đợt tích hợp preview.

### Checklist vòng 2
*Đính kèm từ báo cáo gốc (dạng tóm tắt).*

**Kết quả** — sửa `module-1-auth.md` dòng 3/106/118; heading bảng trạng thái ghi "(tại 24/10/2026)"; `workflow.md` mục 3, `docs/README.md`, `context.md` ghi các quy ước đã chốt.
**Checklist**
- [x] Dòng 3 ghi trạng thái hiện tại "đã tích hợp vào `develop` qua PR #1"; dòng 106 giữ sự kiện 23/10 và thêm mốc merge 27/10; dòng 118 đánh dấu `[x]`
- [x] `git diff HEAD --check` sạch; `--name-status -M` 8 mục trong phạm vi
- [x] Liên kết/anchor 8 file, 0 lỗi; không còn tham chiếu `00-tong-quan` / "Chờ review PR"

**Trạng thái và bước tiếp theo** — Chờ Review

#### Review vòng 2
Chủ dự án: bổ sung quy trình trạng thái task (`Đang làm → Chờ Review → Done`, vòng `Cần sửa`), báo cáo bắt buộc kèm checklist, mẫu báo cáo ngắn, yêu cầu sửa lại dạng prompt; thêm quy tắc trong `CLAUDE.md`.

### Checklist vòng 3
**Task hoặc yêu cầu** — quy trình task/báo cáo, nhánh `docs/reorganize-project-docs` @ `a860437`
**Kết quả** — viết lại `workflow.md` (mục 2–7); `CLAUDE.md` thêm mục "Bắt đầu và kết thúc phiên"; đồng bộ tên vai "TL / Senior Dev" ở `docs/README.md`, `context.md`, `overview-and-decisions.md`.
**Checklist**
- [x] Task ghi output, tiêu chí nghiệm thu, cách kiểm tra — `workflow.md` mục 3, 5
- [x] Luồng trạng thái và vòng `Cần sửa`; giữ `Chờ Review` khi chờ tích hợp — mục 2, 4
- [x] Chỉ TL chuyển `Done`, sau khi xác minh trên `develop` — bảng mục 4
- [x] Báo cáo bắt buộc, TL báo cáo chủ dự án + CTO, checklist review riêng — mục 3, 6
- [x] Mẫu báo cáo 5 mục — mục 6
- [x] Prompt yêu cầu sửa lại — mục 7
- [x] `CLAUDE.md` dẫn tới `workflow.md` và anchor `#6-mẫu-báo-cáo-bàn-giao` — hợp lệ
- [x] `git diff HEAD --check` sạch; 8 mục; 32 liên kết, 0 lỗi
- [ ] Chủ dự án duyệt diff — chờ

**Trạng thái và bước tiếp theo** — Chờ Review. Điểm cần xác nhận: trạng thái `Nháp` + dòng `Chốt:`; việc TL tự làm dừng ở `Chờ Review`.

#### Review vòng 3
Chủ dự án: TL được merge PR task của Senior Dev vào `develop` khi review đạt (thay bước merge thủ công); GitHub chặn thì giữ `Chờ Review` và báo nguyên nhân; sau merge ghi link PR + SHA, chuyển `Done`, báo cáo chủ dự án + CTO.

### Checklist vòng 4
**Task hoặc yêu cầu** — quyền merge của TL, nhánh `docs/reorganize-project-docs` @ `a860437`
**Kết quả** — `workflow.md` mục mở đầu, 1, 2, 4; `CLAUDE.md` mục "Vai trò" và "Quy tắc".
**Checklist**
- [x] Senior Dev mở PR nhắm `develop`, báo cáo kèm link PR → `Chờ Review` — mục 2 bước 4, mục 4
- [x] TL review PR: tiêu chí ↔ diff, base `develop`, check pass, mergeable (`gh pr view --json …`) — mục 2 bước 5
- [x] TL merge `gh pr merge --merge` (giống PR #1); GitHub chặn → giữ `Chờ Review`, báo nguyên nhân — mục 2 bước 6
- [x] Sau merge: xác minh trên `develop`, ghi link PR + SHA, `Done`, báo cáo — mục 2 bước 7
- [x] Ranh giới: chỉ task Senior Dev đã `Chốt:`; việc TL tự làm vẫn do chủ dự án tích hợp; câu "không merge" trong `CLAUDE.md` ghi ngoại lệ
- [x] Không có task/PR mở cần áp dụng (`docs/tasks/` chưa có, `gh pr list` rỗng)
- [x] `git diff HEAD --check` sạch; 8 mục; 32 liên kết, 0 lỗi
- [ ] Chủ dự án duyệt diff — chờ

**Trạng thái và bước tiếp theo** — Chờ Review. Lưu ý: `develop` không bật branch protection.

#### Review vòng 4
Chủ dự án: thêm quy tắc bàn giao lại — cập nhật tại chỗ, giữ lịch sử checklist theo vòng, checklist vòng mới bắt buộc, bàn giao ngắn gọn, review lại trên cùng hồ sơ; áp dụng ngay cho lần bàn giao tài liệu này.

### Checklist vòng 5
**Task hoặc yêu cầu** — `2026-11-15-reorganize-project-docs`, quy tắc bàn giao lại, nhánh `docs/reorganize-project-docs` @ `a860437`
**Kết quả** — `workflow.md`: thêm mục 8 "Bàn giao lại", cập nhật mục 3 (hồ sơ theo dõi phê duyệt cho tài liệu TL), mẫu task (tiêu đề `Checklist vòng <n>`), mục 6; "Nguyên tắc chung" thành mục 9. `CLAUDE.md`: thêm quy tắc bàn giao lại. Tạo file này, `docs/README.md` liệt kê `tasks/`.
**Checklist**
- [x] Cập nhật tại chỗ, giữ ID/đường dẫn/PR — `workflow.md` mục 8.1; đợt này sửa trên cùng nhánh và cùng file, không tạo bản sao
- [x] Lịch sử checklist theo vòng, không sửa vòng trước — mục 8.2, mẫu task mục 5; file này giữ vòng 1–4
- [x] Checklist vòng mới gồm yêu cầu sửa, tiêu chí bị ảnh hưởng kiểm tra lại, mục thiếu để trống + lý do — mục 8.3
- [x] Bàn giao ngắn: link bản hiện tại + checklist mới + link lịch sử; đính kèm checklist cũ khi chưa có link — mục 8.4; vòng 1–2 được đính kèm vào file này
- [x] Review lại trên cùng hồ sơ; TL tiếp tục merge → xác nhận → `Done`; chủ dự án + CTO review tài liệu TL trên cùng hồ sơ — mục 8.5
- [x] `CLAUDE.md` tóm tắt và dẫn tới `workflow.md#8-bàn-giao-lại` — anchor hợp lệ
- [x] Kiểm tra lại (bị ảnh hưởng do đổi số mục): anchor `#3-nơi-lưu-task`, `#6-mẫu-báo-cáo-bàn-giao` vẫn hợp lệ
- [x] `git diff HEAD --check` sạch; `--name-status -M` 9 mục (8 cũ + file này); liên kết/anchor 0 lỗi
- [ ] Vòng 1–2 không có checklist đầy đủ theo mẫu tại thời điểm bàn giao — đã đính kèm dạng tóm tắt từ báo cáo gốc
- [ ] Chủ dự án và CTO duyệt diff — chờ

**Kiểm tra đã chạy** — xem tiêu chí nghiệm thu; kết quả ghi trong báo cáo bàn giao vòng 5.
**Trạng thái và bước tiếp theo** — Chờ Review. File này tạo thư mục `docs/tasks/` (phạm vi đợt tài liệu đã được chốt).

#### Review vòng 5
Khách hàng: chốt bộ quy tắc mới — báo cáo cho khách hàng bằng ngôn ngữ dễ hiểu; TL nghiệm thu kỹ thuật theo nguồn yêu cầu / Function Spec / Basic Design; checklist bắt buộc cả hai vai; một hồ sơ qua các vòng (kèm SHA PR đã review); TL merge task đã duyệt; phản hồi UI ghi riêng; `docs/tasks/README.md` và các mục bắt buộc trong task; thêm mẫu bàn giao Senior Dev → TL và mẫu báo cáo TL → khách hàng. Áp dụng cho chính lần bàn giao này.

### Checklist vòng 6
**Task hoặc yêu cầu** — `2026-11-15-reorganize-project-docs`, nhánh `docs/reorganize-project-docs` @ `a860437`, vòng 6
**Kết luận** — Đã cập nhật tại chỗ `docs/project/workflow.md`, `CLAUDE.md`, `docs/README.md`, file này; thêm `docs/tasks/README.md`.
**Checklist**
- [x] Yêu cầu 1 (báo cáo khách hàng dễ hiểu) — Đạt — `workflow.md` [mẫu 6.3](../project/workflow.md#63-mẫu-báo-cáo-tl-cho-khách-hàng): làm được gì, mở ở đâu (kể cả khi chưa có môi trường), thao tác thử → kết quả mong đợi, chỉ hỏi điều ảnh hưởng trải nghiệm/phạm vi/ưu tiên; chi tiết kỹ thuật để trong hồ sơ task
- [x] Yêu cầu 2 (TL nghiệm thu kỹ thuật) — Đạt — [mục 9](../project/workflow.md#9-nghiệm-thu-kỹ-thuật-tl) + bảng "Checklist nghiệm thu" ở mẫu task có cột Nguồn (yêu cầu / FS / BD) và Cách kiểm tra; nguồn chưa rõ → "Quyết định còn mở"; review có kết luận riêng từng tiêu chí
- [x] Yêu cầu 3 (checklist cả hai vai) — Đạt — [mục 6](../project/workflow.md#6-báo-cáo-và-checklist): tiêu chí — kết quả — bằng chứng; mẫu 6.1 (Senior Dev), 6.2 (TL review / báo cáo kỹ thuật)
- [x] Yêu cầu 4 (một hồ sơ qua các vòng, SHA PR) — Đạt — [mục 8](../project/workflow.md#8-bàn-giao-lại); mục 2 bước 5–6: ghi SHA đã review, so với SHA đầu PR trước khi merge, `gh pr merge --match-head-commit`
- [x] Yêu cầu 5 (TL merge task đã duyệt) — Đạt — [mục 2](../project/workflow.md#2-luồng) bước 4–7, [mục 4](../project/workflow.md#4-trạng-thái-và-quyền-chuyển)
- [x] Yêu cầu 6 (phản hồi UI riêng) — Đạt — [mục 10](../project/workflow.md#10-phản-hồi-ui): lệch yêu cầu → mở lại (`Done` → `Cần sửa`, thêm vào bảng mục 4); đổi/thêm hành vi → task mới `Nháp`
- [x] Yêu cầu 7 (tìm lại từ báo cáo) — Đạt — [docs/tasks/README.md](README.md) mục lục theo ID / tính năng / trạng thái; mẫu task có đủ Nguồn yêu cầu, Checklist nghiệm thu, Kết quả review, Lịch sử review, Phản hồi UI; file này đã đổi sang cấu trúc đó
- [x] Hai mẫu ngắn — Đạt — [6.1](../project/workflow.md#61-mẫu-bàn-giao-của-senior-dev), [6.3](../project/workflow.md#63-mẫu-báo-cáo-tl-cho-khách-hàng) (có checklist thao tác UI)
- [x] `workflow.md` là nguồn; `CLAUDE.md` và `docs/README.md` dẫn tới đúng mục — Đạt — anchor tới từng mục đều hợp lệ (AC2)
- [x] Kiểm tra lại tiêu chí bị ảnh hưởng: AC1, AC2 — Đạt — xem "Kiểm tra đã chạy"; anchor cũ `#3-nơi-lưu-task`, `#6-…`, `#8-bàn-giao-lại` (đổi tên mục 6) đã cập nhật nơi dùng
- [x] Lịch sử vòng 1–5 giữ nguyên — Đạt — chỉ đổi tên mục chứa "Nhật ký bàn giao & review" → "Lịch sử review" theo mẫu mới; nội dung các vòng không sửa
- [ ] AC3 — Không kiểm tra lại — vòng này không chạm `context.md`
- [ ] Khách hàng và CTO duyệt — Chờ

**Kiểm tra đã chạy** — `git diff HEAD --check`: sạch · `git diff HEAD --name-status -M`: 10 mục, đều trong Output · script liên kết/anchor: 0 lỗi · `grep` thuật ngữ cũ: không còn
**Trạng thái và bước tiếp theo** — Chờ Review (khách hàng + CTO duyệt trên hồ sơ này)

#### Review vòng 6
Khách hàng (15/11/2026): chuẩn hóa tài liệu quản lý — `CLAUDE.md` chỉ chỗ đọc plan / tìm task / bàn giao checklist; `workflow.md` thêm quyền giao task, cách Senior Dev nhận task, `Sẵn sàng`, theo dõi tiến độ (hai hạn, `Đúng kế hoạch` / `Có nguy cơ trễ` / `Quá hạn`, `Sớm` / `Đúng hạn` / `Trễ`); thêm `plan.md`, `reports/demo-progress.md`; mục lục task theo ID `TL-` / `SE-` với người phụ trách, ưu tiên, hai hạn; TL được commit và tích hợp đợt tài liệu này, nội dung cần xác nhận giữ `Chờ Review`.

### Checklist vòng 7
**Task hoặc yêu cầu** — `2026-11-15-reorganize-project-docs`, nhánh `docs/reorganize-project-docs` @ `a860437`, vòng 7
**Kết luận** — Đã cập nhật tại chỗ `CLAUDE.md`, `workflow.md`, `docs/README.md`, `docs/tasks/README.md`, file này; thêm `plan.md`, `reports/demo-progress.md`, TL-001, SE-001, TL-002; audit thêm checklist vòng 2.
**Checklist**
- [x] `CLAUDE.md`: đọc plan, tìm task, bàn giao checklist ở đâu — Đạt — mục "Đọc trước khi làm", "Bắt đầu phiên", "Bàn giao ở đâu"
- [x] Quyền giao task, ID `TL-`/`SE-`, người phụ trách, ưu tiên — Đạt — [workflow mục 3](../project/workflow.md#3-nơi-lưu-task), [3.1](../project/workflow.md#31-phân-công-và-nhận-task), mục 1
- [x] Senior Dev nhận task (tiếp tục task đang làm hoặc lấy `Sẵn sàng` ưu tiên cao nhất → `Đang làm`) — Đạt — [mục 3.1](../project/workflow.md#31-phân-công-và-nhận-task), bảng [mục 4](../project/workflow.md#4-trạng-thái-và-quyền-chuyển)
- [x] Vòng review, sửa lại, merge, xác nhận `Done` — Đạt — giữ mục 2, 4, 7, 8; thêm `Sẵn sàng` và `Done` cho task `TL-`
- [x] Bàn giao của TL: báo cáo ngắn + checklist, UI dạng mở ở đâu → làm gì → sẽ thấy gì — Đạt — [mục 6](../project/workflow.md#6-báo-cáo-và-checklist), mẫu 6.3
- [x] Theo dõi tiến độ — Đạt — [mục 11](../project/workflow.md#11-theo-dõi-tiến-độ); áp dụng ở [mục lục task](README.md) và [báo cáo tiến độ](../reports/demo-progress.md)
- [x] Mục lục task đủ cột ID, tên, người phụ trách, ưu tiên, hai hạn, trạng thái; mỗi dòng dẫn tới task gốc — Đạt — [README.md](README.md)
- [x] `docs/README.md` tìm được plan, task, báo cáo tiến độ, audit — Đạt — mục "Bắt đầu từ đâu"
- [x] Kiểm tra lại tiêu chí bị ảnh hưởng: AC1, AC2, AC4 — Đạt — xem "Kiểm tra đã chạy"; mục "Nguyên tắc chung" đổi số 11 → 12, không có liên kết nào trỏ tới anchor cũ
- [x] Lịch sử vòng 1–6 giữ nguyên — Đạt — chỉ thêm Review vòng 6 và vòng 7; "Loại", "Output", "Phạm vi" cập nhật tại chỗ cho vòng 7
- [ ] AC3 — Không kiểm tra lại — vòng này không chạm `context.md`
- [ ] Khách hàng và CTO duyệt — Chờ

**Kiểm tra đã chạy** — `git diff HEAD --check`; script liên kết/anchor toàn bộ `README.md`, `CLAUDE.md`, `docs/**`; kết quả ghi trong báo cáo bàn giao gửi khách hàng và CTO.
**Trạng thái và bước tiếp theo** — Chờ Review (tài liệu đã tích hợp `develop`, nội dung chờ khách hàng + CTO duyệt).

## Phản hồi UI
Không áp dụng (task tài liệu, không có giao diện).
