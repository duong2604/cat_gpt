# CAT GPT — Tổng quan dự án & nhật ký quyết định chung

> Cập nhật lần cuối: 24/10/2026
> Đề tài: *Xây dựng hệ thống trợ lý AI nội bộ hỗ trợ hội thoại và khai thác thông tin từ tài liệu sử dụng mô hình ngôn ngữ lớn (LLM) — CAT GPT*
> Sinh viên: Bùi Văn Dương (5250026, CNTT1 K29.1) · GVHD: ThS. Bùi Minh Thảo
> Repo: https://github.com/duong2604/cat_gpt

## 1. Trạng thái các module

| Module | Nội dung | Kế hoạch (đề cương) | Trạng thái | Tài liệu |
|---|---|---|---|---|
| 1 | Xác thực & quản lý người dùng | 04/10 – 18/10 | ✅ Hoàn thành code, chờ review PR | [module-1-auth.md](module-1-auth.md) |
| 2 | Trợ lý hội thoại (AI Chat) + streaming | 19/10 – 01/11 | 📝 Đang chốt yêu cầu | [module-2-chat.md](module-2-chat.md) |
| 3 | Quản lý tài liệu + pipeline bất đồng bộ | 02/11 – 15/11 | Chưa bắt đầu (đã có trang giữ chỗ) | — |
| 4 | RAG: embedding, truy hồi, hỏi–đáp, tóm tắt | 16/11 – 29/11 | Chưa bắt đầu | — |
| 5 | Dịch tài liệu (mở rộng) | 14/12 – 31/12 | Ngoài phạm vi cam kết | — |

## 2. Nguyên tắc làm việc đã thống nhất

- **Hỏi trước, code sau:** chốt yêu cầu bằng bộ câu hỏi, có bản xác nhận cuối rồi mới code. Không tự ý thêm công nghệ ngoài đề cương nếu chưa được xác nhận.
- **Ưu tiên demo sớm:** tính năng nào làm nhanh được và lên được UI thì làm trước.
- **Đầu chờ cho phần chưa tích hợp:** công nghệ chưa sẵn sàng (LLM, MinIO…) thì vẫn dựng giao diện và backend, kèm một interface trừu tượng và bản mock. Khi tích hợp thật chỉ cần thay provider.
- **Code sạch, tường minh, dễ bảo trì:** mỗi feature tách rõ `api` / `hooks` / `components` (FE) và `controller` / `service` / `schema` (BE).

## 3. Quyết định kiến trúc chung (23/10/2026)

| # | Quyết định | Lý do |
|---|---|---|
| D-01 | **Monorepo pnpm workspaces + Turborepo** gồm `apps/api`, `apps/web`, `packages/shared` | Dùng chung type, enum, mã lỗi giữa FE và BE; một lệnh `pnpm dev` chạy tất cả |
| D-02 | **pnpm**, **Node.js ≥ 22** | Theo lựa chọn của sinh viên |
| D-03 | **MongoDB Atlas M0 (free, 512MB)**, region Singapore | Không cần cài DB local. Chỉ đổi `MONGODB_URI` là chuyển sang Mongo Docker được |
| D-04 | **Chưa dùng Docker Compose ở giai đoạn Module 1** | Module 1 chỉ cần MongoDB (đã dùng Atlas). Docker bắt đầu từ Module 3 (Redis, MinIO, Qdrant); Nginx và đóng gói toàn bộ ở giai đoạn 8 |
| D-05 | Backend: **NestJS + Mongoose + class-validator + Swagger** | Chuẩn của hệ sinh thái NestJS; Swagger dùng để test và đưa vào báo cáo |
| D-06 | Frontend: **Next.js App Router + Tailwind + shadcn/ui** | shadcn phù hợp giao diện chat kiểu ChatGPT |
| D-07 | Gọi API & form: **axios + TanStack Query + react-hook-form + zod** | axios: interceptor tự refresh token. TanStack Query: cache, loading/error. RHF + zod: form gọn, validate rõ ràng. Không cần Redux/Zustand |
| D-08 | **Đa ngôn ngữ vi/en bằng next-intl**, lưu ngôn ngữ trong cookie, không có tiền tố URL | App nội bộ, URL gọn. Backend chỉ trả **mã lỗi**, FE tự dịch |
| D-09 | **helmet, @nestjs/throttler, next-themes (dark mode)** | Bảo mật header, chống dò mật khẩu, giao diện sáng/tối |
| D-10 | Unit test **để sau** | Ưu tiên tiến độ demo |
| D-11 | FE gọi API **cùng origin** qua Next.js rewrites (`/api/*` → NestJS) | Cookie httpOnly hoạt động, không cần CORS. Khi triển khai, Nginx thay thế đúng vai trò này |

### Phiên bản thực tế khi khởi tạo

NestJS 12.2 · Mongoose 9 · Next.js 16.4 (Turbopack) · React 19.3 · Tailwind CSS 4 · TypeScript 6 · zod 4 · next-intl 4 · TanStack Query 5.

## 4. Quy ước Git

- Nhánh: `main` (ổn định) ← `develop` ← `feature/module-<n>-<tên>`.
- Tạo nhánh feature từ `develop`. **Không tự động merge vào `main`**; merge qua Pull Request sau khi review.
- Commit theo **Conventional Commits**: `feat(api): …`, `feat(web): …`, `chore: …`, `docs: …`.

## 5. Sự cố & cách xử lý

| Ngày | Sự cố | Nguyên nhân | Xử lý |
|---|---|---|---|
| 24/10/2026 | API không kết nối được Atlas: `querySrv ECONNREFUSED _mongodb._tcp.cluster0...mongodb.net` | DNS mặc định của mạng/router từ chối truy vấn bản ghi SRV mà chuỗi `mongodb+srv://` cần dùng. Không phải lỗi code hay whitelist IP | Đổi DNS của Windows sang `8.8.8.8` / `1.1.1.1` (*Wi-Fi → DNS server assignment → Manual*, **giữ IP assignment là Automatic (DHCP)**), sau đó chạy `ipconfig /flushdns`. Phương án dự phòng: dùng chuỗi kết nối `mongodb://` không SRV lấy từ Atlas |

## 6. Ghi chú môi trường phát triển

- Biến môi trường: `apps/api/.env` (Mongo, JWT secret, admin mặc định) và `apps/web/.env` (`API_INTERNAL_URL`). Mẫu ở các file `.env.example`.
- Lần chạy đầu, hệ thống tự tạo tài khoản admin từ `ADMIN_EMAIL` / `ADMIN_PASSWORD` (mặc định `admin@catgpt.local` / `Admin@123`). Cần đổi mật khẩu sau khi đăng nhập.
- Swagger: `http://localhost:4000/api/v1/docs` · Web: `http://localhost:3000`.
