# CAT GPT

Trợ lý AI nội bộ (đồ án tốt nghiệp). Monorepo pnpm + Turborepo: `apps/api` (NestJS), `apps/web` (Next.js), `packages/shared`.

## Đọc trước khi làm

1. [docs/project/workflow.md](docs/project/workflow.md): **nguồn quy trình duy nhất**. Đọc đầu mỗi phiên (TL và Senior Dev).
2. [docs/project/plan.md](docs/project/plan.md): mục tiêu demo, mốc, thứ tự việc, quyết định còn mở.
3. [docs/tasks/README.md](docs/tasks/README.md): **tìm task ở đây** — ID, người phụ trách, ưu tiên, hạn, trạng thái; mỗi dòng dẫn tới file task.
4. [docs/project/context.md](docs/project/context.md): phạm vi và trạng thái module trên `develop`.
5. [README.md](README.md) (công nghệ, chạy local, quy ước Git) và [docs/README.md](docs/README.md) (mục lục tài liệu).
6. Sửa code `apps/web`: đọc [apps/web/AGENTS.md](apps/web/AGENTS.md) (Next.js 16 có thay đổi phá vỡ).

## Bắt đầu phiên

- **Senior Dev:** `git fetch origin develop` → tiếp tục task của mình đang `Cần sửa` / `Đang làm`, nếu không thì lấy task `Sẵn sàng` ưu tiên cao nhất giao cho Senior Dev → chuyển `Đang làm` ([mục 3.1](docs/project/workflow.md#31-phân-công-và-nhận-task)).
- **TL:** `git fetch origin develop` → đối chiếu [plan](docs/project/plan.md) và [mục lục task](docs/tasks/README.md) → review task `Chờ Review` → cập nhật [báo cáo tiến độ](docs/reports/demo-progress.md) ([mục 11](docs/project/workflow.md#11-theo-dõi-tiến-độ)).

## Bàn giao ở đâu

- Checklist bàn giao ghi vào mục **"Lịch sử review"** của chính file task (`docs/tasks/<ID>-….md`), dạng `### Checklist vòng <n>`; mỗi dòng **tiêu chí — kết quả — bằng chứng**, chưa xác minh thì để trống + lý do ([mục 6](docs/project/workflow.md#6-báo-cáo-và-checklist)).
- Senior Dev: PR nhắm `develop` + [mẫu 6.1](docs/project/workflow.md#61-mẫu-bàn-giao-của-senior-dev) → `Chờ Review`. Không merge.
- TL: [mẫu 6.2](docs/project/workflow.md#62-mẫu-review-và-báo-cáo-kỹ-thuật-của-tl) cho CTO, [mẫu 6.3](docs/project/workflow.md#63-mẫu-báo-cáo-tl-cho-khách-hàng) cho khách hàng (mở ở đâu → làm gì → sẽ thấy gì). Phản hồi UI ghi trong task ([mục 10](docs/project/workflow.md#10-phản-hồi-ui)).
- Bàn giao lại: sửa tại chỗ, cùng ID/PR/đường dẫn, thêm checklist vòng mới, giữ lịch sử ([mục 8](docs/project/workflow.md#8-bàn-giao-lại)).

## Tóm tắt quyền (chi tiết trong workflow)

- Khách hàng + CTO chốt phạm vi và deadline; TL ghi lại, giao task và điều phối ([mục 1](docs/project/workflow.md#1-vai-trò)).
- Chỉ TL chuyển `Sẵn sàng` / `Cần sửa` / `Done` ([mục 4](docs/project/workflow.md#4-trạng-thái-và-quyền-chuyển)). Mỗi tiêu chí task có nguồn yêu cầu, mục Function Spec / Basic Design và cách kiểm tra ([mục 9](docs/project/workflow.md#9-nghiệm-thu-kỹ-thuật-tl)).
- TL merge: task đã chốt, mọi tiêu chí và check đạt, SHA đầu PR trùng SHA đã review → `gh pr merge --merge`, xác minh trên `develop`, ghi link PR + SHA rồi `Done`. Merge bị chặn → giữ `Chờ Review`, báo lý do ([mục 2](docs/project/workflow.md#2-luồng)).

## Quy tắc

- `origin/develop` là nguồn đối chiếu trạng thái. Luôn `git fetch origin develop` và ghi SHA trước khi phân tích hoặc bắt đầu task.
- Không commit, push hay merge khi chưa được yêu cầu; ngoại lệ: TL merge PR task vào `develop`, và TL tích hợp tài liệu của mình khi khách hàng giao quyền cho đợt đó. Không merge vào `main`.
- Commit theo Conventional Commits (`feat(api): …`, `feat(web): …`, `docs: …`).
- Thay đổi hành vi hoặc thiết kế thì cập nhật tài liệu tương ứng trong `docs/`.
