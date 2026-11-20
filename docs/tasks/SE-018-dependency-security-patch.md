# SE-018 — Nâng bản vá bảo mật phụ thuộc (`multer`, `next`)

Trạng thái: Sẵn sàng (TL chuyển 20/11/2026: gate thứ tự CTO 18/11 "sau khi SE-014 merge" đã đạt — SE-014 `124ccee`; Module 4 hết task SE. Khi TL chạy thử `34b465d` ngày 20/11, `next dev` dừng ở thông báo khuyến nghị nâng bản vá bảo mật Next.js — cùng bản `next` 16.4.2 với `develop`. Chỉ vá trên `develop`; **không** sửa bản đóng băng `34b465d`. AC1 chạy `pnpm audit --prod` tại thời điểm nhận task: advisory mới phát sinh sau 18/11 cũng phải được ghi lại)
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 0,25 ngày làm việc
Phụ thuộc: không chặn kỹ thuật. **Thứ tự:** làm sau khi SE-014 merge, không xen vào SE-014 (CTO 18/11/2026)
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 18/11/2026 — CTO yêu cầu ghi đề xuất nâng bản vá thành task riêng
SHA cơ sở: `origin/develop` @ SHA khi nhận task
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
Đóng 2 advisory của `pnpm audit --prod` do TL phát hiện ngày 18/11/2026 bằng nâng bản vá. Không đổi kiến trúc, không tốn chi phí.

| Gói | Hiện tại | Advisory | Bản sửa | Mức độ phơi nhiễm hiện tại |
|---|---|---|---|---|
| `multer` (qua `@nestjs/platform-express` 12.2.0, ghim `multer@2.4.0`) | 2.4.0 | high — từ chối dịch vụ khi `fileFilter` bất đồng bộ còn chờ lúc request bị hủy | `multer` ≥ 2.5.0: `@nestjs/platform-express` 12.5.1 phụ thuộc `multer@2.5.0` | Thấp — code không dùng `fileFilter` (TL `grep` 18/11) |
| `next` (`apps/web`) | 16.4.2 | moderate ×2 — rò dữ liệu cache khi dùng `'use cache'` / `unstable_cache` | ≥ 16.4.5 (mới nhất cùng dòng: 16.4.6) | Thấp — code không dùng `'use cache'` / `unstable_cache` |

## Phạm vi
- **Làm:**
  - `@nestjs/platform-express` → 12.5.1. Nâng kèm các gói `@nestjs/*` nếu peer dependency yêu cầu, chỉ trong dòng 12.x.
  - `next` → 16.4.6 (giữ ghim chính xác như hiện tại).
  - Cập nhật `pnpm-lock.yaml`.
- **Không làm:** nâng major; đổi cấu hình; sửa code nếu không bắt buộc.

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | `pnpm audit --prod` không còn 2 advisory trên; không có advisory mới do việc nâng | Đầu ra audit trước/sau |
| AC2 | Upload không hồi quy: avatar (JPG/PNG/WEBP, quá cỡ, sai loại) và tài liệu (TXT/PDF/DOCX, `400 FILE_TOO_LARGE` cho > 25 MB) | `curl` + đếm 3 nơi |
| AC3 | Web không hồi quy: đăng nhập, Chat stream/Dừng/Tạo lại, trang Tài liệu, `staff`/`demo` | Ảnh + CI |
| AC4 | CI xanh; `pnpm build`, `typecheck`, `lint`, `test` | Link run |

## Kết quả review
Chưa có.

## Lịch sử review

## Phản hồi UI
Không áp dụng.
