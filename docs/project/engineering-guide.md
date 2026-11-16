# Hướng dẫn kỹ thuật ngắn — Simplicity First, Backend, Frontend

Áp dụng cho mọi task `SE-` từ 16/11/2026 (CTO duyệt Wave 0–2). Đây là bản thử nghiệm của [TL-010](../tasks/TL-010-engineering-guide-skills-pilot.md); quy trình task/PR/review vẫn theo [workflow.md](workflow.md).

## 1. Simplicity First (mọi task)

- Theo quy ước và dependency đang có trước khi viết mới. Tìm trong repo trước: có helper/khuôn tương tự thì dùng lại.
- KISS, YAGNI: chỉ làm đúng phạm vi task. Không refactor ngoài phạm vi, không scaffolding "để sau".
- Không thêm repository, factory, adapter, strategy, event bus, base class, interface chỉ bọc một bản cài — trừ khi task chứng minh cần. Lớp trừu tượng có sẵn (`StorageService`, `LlmProvider`) thì dùng tiếp.
- Logic nghiệp vụ tường minh, dễ đọc hơn ngắn. Chuyển trạng thái và xử lý lỗi viết rõ từng nhánh.
- Không tối ưu sớm. Chỗ cố ý đơn giản có giới hạn biết trước → chú thích `ponytail:` nêu giới hạn và hướng nâng cấp.
- Dependency runtime mới: ghi lý do trong PR, **TL duyệt trước khi thêm**.
- Không nới bảo mật, không bỏ kiểm tra đầu vào ở biên, không làm mất dữ liệu để code ngắn hơn.
- Bằng chứng trước kết luận: chỉ ghi "đạt" khi đã chạy lệnh và đọc kết quả trong phiên đó; chưa chạy được → `NOT VERIFIED` + lý do.
- Kiểm thử bằng service thật (Docker local, Atlas dev). Không tạo mock/fake chỉ để đánh dấu xong; mock chỉ khi cô lập lỗi khó tái hiện, ghi lý do.

**Bàn giao (thêm vào mẫu 6.1):** (1) đã đổi gì, vì sao; (2) vì sao đây là cách đơn giản nhất đủ dùng; (3) abstraction/dependency mới và lý do (hoặc "Không có"); (4) test đã chạy + kết quả; (5) giới hạn còn lại, rủi ro.

**Trước khi bàn giao:** chạy `/simplify` (có sẵn trong Claude Code) trên diff của task; ghi vào bàn giao những gì đã nhận/từ chối và lý do. Không để nó mở rộng phạm vi.

## 2. Backend (NestJS, `apps/api`)

- Một thư mục mỗi module: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `schemas/`, `dto/`, `*.presenter.ts` — theo `modules/chat/`.
- Lỗi nghiệp vụ: `AppException` + mã trong `packages/shared/src/error-codes.ts`; FE tự dịch. Tài nguyên của người khác trả `404` (không `403`).
- Mọi endpoint mặc định cần đăng nhập (guard toàn cục); mọi truy vấn dữ liệu cá nhân lọc theo `userId` người gọi.
- Biến môi trường: khai báo trong `config/env.validation.ts`, đọc qua `AppConfigService`; thêm/đổi/xóa biến thì sửa **cùng lúc** `.env` và `.env.example` (chỉ giá trị minh họa) và chạy `pnpm env:check` (từ SE-010).
- Phân trang: `PaginationQueryDto`. Upload: `FileInterceptor` + kiểm chữ ký tệp như `me.service.ts`.
- Test: vitest (`*.spec.ts` cạnh file), ưu tiên logic thuần (kiểm định dạng, chuyển trạng thái, phân loại lỗi). Kiểm luồng bằng service thật và ghi lệnh + đầu ra vào bàn giao.
- Log: không ghi nội dung người dùng, mật khẩu, khóa API.
- Docker: chỉ thao tác trong project compose `cat-gpt`; không `down -v`, không `prune`.

## 3. Frontend (Next.js 16, `apps/web`)

- **Đọc `apps/web/AGENTS.md`** và tài liệu Next trong `node_modules/next/dist/docs/` trước khi dùng API của Next — bản 16 có thay đổi phá vỡ.
- Mỗi tính năng: `src/features/<tên>/api.ts` (axios), `hooks.ts` (TanStack Query), `components/`. Form: react-hook-form + zod. Không thêm thư viện state.
- Dùng component có sẵn (`src/components/ui`, shadcn) và [chuẩn giao diện](../design/ui-release-standards.md#1-chuẩn-dùng-chung); đủ trạng thái trống / tải / lỗi / thành công.
- Mọi chuỗi qua `messages/{vi,en}.json`; lỗi API hiển thị theo mã lỗi.
- Kiểm desktop + 375 px, sáng + tối, vi + en; nút có nhãn truy cập được, điều hướng được bằng bàn phím.
- Polling chỉ khi cần (`refetchInterval` có điều kiện).
- Tính năng chưa sẵn sàng phải ẩn được ở chế độ `staff` (SE-003).
