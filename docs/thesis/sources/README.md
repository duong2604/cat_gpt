# Nguồn gốc của bộ tài liệu đồ án

Bản sao các tài liệu ngoài repo mà bộ nguồn [docs/thesis](../README.md) dựa vào. Agent đọc **bản chép Markdown** trong thư mục này. Repo `duong2604/cat_gpt` đang **công khai**, nên bản chép lược thông tin liên lạc cá nhân; file gốc chỉ nằm trên máy.

| Tài liệu | Bản chép (trong repo) | Bản gốc trên máy (không commit) | MD5 bản gốc |
|---|---|---|---|
| Đề cương ĐATN — bản khách hàng chỉ định 15/11/2026 (sửa lần cuối 30/09/2026) | [de-cuong-datn.md](de-cuong-datn.md) | `docs/thesis/sources/originals/de-cuong-datn-2026-09-30.docx` (chép từ `D:\workspace\5250026_BuiVanDuong_LT_CNTT1_K29.1_Decuong DATN.docx`) | `cf7b9248aff07b155bf2cee1f19798ba` |
| Quy định và hướng dẫn trình bày ĐATN — Khoa CNTT, ĐH GTVT (ký số 23/09/2021) | [quy-dinh-trinh-bay-datn.md](quy-dinh-trinh-bay-datn.md) | `docs/thesis/sources/originals/quy-dinh-trinh-bay-datn.signed.pdf` (chép từ `C:\Users\duong\Downloads\Quy dinh va huong dan trinh bay DATN .signed.pdf`) | `c972b9dcac7e3abc30de63f5920a5411` |

- Thư mục `originals/` có `.gitignore` chặn toàn bộ, nên chỉ tồn tại trong worktree TL `D:\workspace\buggysoft\cat_gpt-tl`. Agent trên máy khác dùng bản chép; cần bản gốc thì hỏi khách hàng.
- Khi khách hàng đổi file nguồn: chép lại vào `originals/`, cập nhật MD5 ở bảng trên, chép lại nội dung vào bản Markdown, ghi lý do trong [TL-004](../../tasks/TL-004-thesis-source-pack.md).
- Không đưa vào repo: số điện thoại, email cá nhân, tài khoản thật, khóa API.
- Báo cáo công việc 27/10/2026 (`Downloads/Bùi Văn Dương_Tài liệu báo cáo công việc.docx`) không chép vào đây: nội dung đã được audit ở [preview-progress-review.md](../../project/preview-progress-review.md) và số liệu "80%" không dùng cho báo cáo.
