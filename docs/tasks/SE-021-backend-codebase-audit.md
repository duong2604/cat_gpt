# SE-021 — Backend Codebase Audit & Refactoring (`apps/api`)

Trạng thái: Sẵn sàng (giai đoạn A — audit). Giai đoạn B (refactor) mở theo từng PR sau khi TL duyệt phạm vi
Người phụ trách: Senior Dev · Ưu tiên: P1 · Ước lượng: A 0,5 ngày; B theo phạm vi duyệt (mỗi PR ≤ 0,5 ngày)
Phụ thuộc: làm **sau** khi bàn giao [SE-020](SE-020-dependency-security-patch-r2.md) (cùng phiên SE; không làm song song trên cùng nhánh). Không chặn bởi nghiệm thu M1–M4 ở giai đoạn A (chỉ đọc code)
Hạn bàn giao review: A — 21/11/2026 trong ngày nếu kịp, không thì phiên sau · B — Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — · bàn giao review — · hoàn tất —
Chốt: 21/11/2026 — chỉ thị CTO "TL Independent Backend Code Review": TL tạo task, giao SE audit độc lập, TL duyệt phạm vi refactor nhỏ **không đổi hành vi**; thay đổi kiến trúc lớn / API contract / schema DB / nghiệp vụ trình CTO; **không merge PR refactor khi CTO chưa cho phép**; không viết unit test mới
SHA cơ sở: `origin/develop` @ `b7af2fb` (A); B: `origin/develop` mới nhất khi tạo nhánh
PR: A — không có PR code (báo cáo ghi vào file này); B — <Senior Dev ghi từng PR>

## Mục tiêu
Backend dễ hiểu, dễ bảo trì, dễ debug, ít lỗi, đủ để developer con người tiếp quản. Giai đoạn A tìm vấn đề có bằng chứng; giai đoạn B sửa các mục TL duyệt bằng PR nhỏ, không đổi hành vi.

## Phạm vi
- **Làm (A):** đọc trực tiếp `apps/api/src` theo 6 luồng: (1) Auth & phân quyền; (2) Chat; (3) Documents; (4) RAG; (5) Document Summary; (6) Cross-cutting (config, log, exception filter, DTO validation, rate limit, DI, ranh giới module). Checklist: đúng/đủ logic, dễ đọc, naming, trách nhiệm hàm/class, vị trí file, duplicate/dead code, magic values, abstraction thừa, điều kiện lồng nhau, type assertion không an toàn, async/concurrency, nhất quán DB, exception bị nuốt, thiếu cleanup, log (đủ, không lộ dữ liệu), edge case, mô tả code cho người mới.
- **Làm (B):** chỉ các finding TL đánh dấu "Duyệt — refactor nhỏ"; mỗi PR một chủ đề.
- **Không làm:** đổi API contract (đường dẫn, mã lỗi, response shape), schema DB, hành vi nghiệp vụ; thêm interface/repository/factory không có lợi ích rõ; viết unit test mới; sửa `apps/web`; style chủ quan.

## Định dạng finding (bắt buộc)
| ID | Severity | Luồng | File:dòng | Bằng chứng | Ảnh hưởng | Cách sửa đề xuất | Blocking? |
|---|---|---|---|---|---|---|---|
| SE-F1 | BLOCKER / MAJOR / MINOR / SUGGESTION | 1–6 | `apps/api/src/...:n` | trích code / kịch bản tái hiện | | | Có / Không |

BLOCKER: lỗi logic, bảo mật, dữ liệu, concurrency, regression. MAJOR: khó bảo trì, coupling nghiêm trọng. MINOR: đọc hiểu, naming, tổ chức. SUGGESTION: tùy chọn.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | (A) Báo cáo audit đủ 6 luồng; mỗi luồng ghi rõ đã đọc file nào; finding đúng định dạng trên | Chỉ thị CTO mục 2–5 | TL đối chiếu với code |
| AC2 | (A) Finding BLOCKER/concurrency/nhất quán dữ liệu có kịch bản tái hiện hoặc lập luận theo dòng code cụ thể | Chỉ thị CTO mục 7 | TL tự kiểm chứng |
| AC3 | (B) Mỗi PR không đổi API contract: cùng route, mã HTTP, mã lỗi, response shape — đối chiếu trước/sau bằng gọi API thật | Chỉ thị CTO mục 7 | Kịch bản API trước/sau |
| AC4 | (B) Hồi quy luồng liên quan (M1–M4 38 bước như SE-018) và ca concurrency/cleanup của vùng sửa | Chỉ thị CTO mục 7 | Kịch bản + đầu ra |
| AC5 | (B) `pnpm typecheck`, `lint`, `build`, `pnpm -C apps/api test` (test hiện có), CI xanh tại SHA đầu PR | Quy ước repo | Lệnh + link run |
| AC6 | (B) Diff chỉ trong `apps/api/src` (+ hồ sơ task); không đổi schema, không đổi `.env` | Phạm vi | `git diff --stat` |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q1 | Quyền merge PR refactor (B) | Chờ CTO cho phép từng PR | Chờ CTO |

## Kết quả review
Chưa có. Review độc lập của TL: [báo cáo ngày 21/11](../reports/daily/2026-11-21.md) (vòng 6) và mục "TL independent findings" dưới đây.

## Lịch sử review
Chưa có.

## Phản hồi UI
Không áp dụng.
