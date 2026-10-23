# CAT GPT

Hệ thống trợ lý AI nội bộ hỗ trợ hội thoại và khai thác thông tin từ tài liệu sử dụng mô hình ngôn ngữ lớn (LLM).

Đồ án tốt nghiệp — Bùi Văn Dương (5250026, CNTT1 K29.1, Trường Đại học GTVT).

## Phạm vi

| Module | Nội dung | Trạng thái |
|---|---|---|
| 1 | Xác thực & quản lý người dùng | ✅ Hoàn thành |
| 2 | Trợ lý hội thoại (AI Chat) + streaming | ⏳ Giao diện giữ chỗ |
| 3 | Quản lý tài liệu + pipeline bất đồng bộ | ⏳ Giao diện giữ chỗ |
| 4 | Khai thác tài liệu bằng AI (RAG) | Chưa bắt đầu |

## Công nghệ

| Phần | Công nghệ |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Backend (`apps/api`) | NestJS 12, Mongoose (MongoDB), Passport JWT, class-validator, Swagger, helmet, @nestjs/throttler |
| Frontend (`apps/web`) | Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui, TanStack Query, axios, react-hook-form + zod, next-intl, next-themes |
| Dùng chung (`packages/shared`) | Enum, mã lỗi, kiểu dữ liệu, hằng số validate dùng chung cho FE và BE |

## Cấu trúc thư mục

```
cat_gpt/
├─ apps/
│  ├─ api/                     # NestJS — http://localhost:4000/api/v1
│  │  └─ src/
│  │     ├─ config/            # Đọc & kiểm tra biến môi trường
│  │     ├─ common/            # Guard, filter, pipe, decorator dùng chung
│  │     └─ modules/
│  │        ├─ auth/           # Đăng nhập, refresh, đăng xuất, JWT strategy
│  │        ├─ sessions/       # Phiên đăng nhập (refresh token rotation)
│  │        ├─ users/          # Schema & truy cập dữ liệu người dùng, seed admin
│  │        ├─ me/             # Hồ sơ, avatar, đổi mật khẩu, quản lý phiên
│  │        ├─ admin-users/    # Quản trị người dùng
│  │        ├─ storage/        # Lưu file (Local; MinIO ở module 3)
│  │        └─ health/
│  └─ web/                     # Next.js — http://localhost:3000
│     ├─ messages/             # Bản dịch vi / en
│     └─ src/
│        ├─ app/               # Route: (auth)/login, (app)/chat|documents|profile|admin/users
│        ├─ features/          # auth, profile, admin-users (api.ts, hooks.ts, components/)
│        ├─ components/        # Layout, component dùng chung, components/ui (shadcn)
│        ├─ lib/               # axios client, query keys, validation
│        ├─ i18n/              # Cấu hình next-intl
│        └─ proxy.ts           # Chuyển hướng theo trạng thái đăng nhập
└─ packages/shared/
```

## Chạy dự án

Yêu cầu: **Node.js ≥ 22**, **pnpm ≥ 10**, một cơ sở dữ liệu MongoDB (khuyến nghị MongoDB Atlas gói M0 miễn phí).

### 1. Chuẩn bị MongoDB Atlas

1. Tạo cluster M0, chọn region **Singapore (ap-southeast-1)**.
2. *Database Access*: tạo user và mật khẩu.
3. *Network Access*: thêm IP máy dev (hoặc `0.0.0.0/0` **chỉ cho môi trường dev**).
4. *Connect → Drivers*: copy chuỗi kết nối và thêm tên database, ví dụ `.../cat_gpt?retryWrites=true&w=majority`.

### 2. Cấu hình biến môi trường

```bash
cp apps/api/.env.example apps/api/.env   # điền MONGODB_URI, JWT_ACCESS_SECRET, ADMIN_*
cp apps/web/.env.example apps/web/.env   # mặc định trỏ API về http://localhost:4000
```

Tạo `JWT_ACCESS_SECRET` ngẫu nhiên:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 3. Cài đặt và chạy

```bash
pnpm install
pnpm dev          # chạy song song shared (watch), API (4000) và Web (3000)
```

- Web: http://localhost:3000
- Swagger: http://localhost:4000/api/v1/docs
- Lần chạy đầu, hệ thống tự tạo tài khoản admin từ `ADMIN_EMAIL` / `ADMIN_PASSWORD` (mặc định `admin@catgpt.local` / `Admin@123`). **Hãy đổi mật khẩu sau khi đăng nhập.**

### Lệnh khác

```bash
pnpm build        # build toàn bộ
pnpm typecheck    # kiểm tra kiểu
pnpm lint         # lint
```

## Thiết kế xác thực

- **Access token** (JWT, 15 phút) và **refresh token** (7 ngày, gia hạn trượt) lưu trong **cookie httpOnly**, `SameSite=Lax`. JavaScript phía trình duyệt không đọc được token.
- Cookie refresh chỉ gửi tới `/api/v1/auth/*`.
- Mỗi lần đăng nhập tạo một **phiên** trong collection `sessions`. Refresh token có dạng `<sessionId>.<secret>`, DB chỉ lưu SHA-256 của secret.
- **Refresh token rotation**: mỗi lần refresh cấp token mới. Nếu token cũ bị dùng lại ngoài thời gian ân hạn 30 giây, hệ thống coi là bị đánh cắp và thu hồi phiên.
- Mỗi request kiểm tra phiên còn hiệu lực và tài khoản chưa bị khóa. Vì vậy khi admin **khóa tài khoản**, hoặc người dùng **đăng xuất thiết bị từ xa**, phiên đó bị chặn ngay ở request kế tiếp.
- Frontend gọi API qua Next.js rewrites (`/api/*` → NestJS), nên cùng origin và không cần CORS. Khi triển khai, Nginx sẽ đảm nhận việc này.
- Axios interceptor tự refresh khi gặp 401. Nhiều request lỗi cùng lúc chỉ refresh một lần.
- Giới hạn đăng nhập **5 lần/phút/IP**; toàn API **120 request/phút/IP**.

## Quy ước Git

- Nhánh `main` (ổn định) ← `develop` ← `feature/module-<n>-<tên>`.
- Commit theo [Conventional Commits](https://www.conventionalcommits.org/): `feat(api): ...`, `feat(web): ...`, `chore: ...`.
- Không merge thẳng vào `main`; merge qua Pull Request sau khi review.
