# TL-010 — Hướng dẫn kỹ thuật ngắn và thử nghiệm skills tối thiểu

Trạng thái: Đang làm — vòng 1 (hướng dẫn + đánh giá skill) bàn giao 16/11/2026; đo trên SE-011, SE-012 khi hai task bàn giao
Người phụ trách: TL · Ưu tiên: P2 · Ước lượng: 1 ngày làm việc (chia theo pilot)
Phụ thuộc: đo kết quả cần [SE-011](SE-011-documents-txt-backend.md), [SE-012](SE-012-documents-txt-frontend.md) bàn giao; **không chặn** Module 3
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu 16/11/2026 · bàn giao review 16/11/2026 (vòng 1) · hoàn tất —
Chốt: 16/11/2026 — CTO duyệt Wave 0–2 (TL-010); CTO vòng 2 mục 6: đo bằng độ dễ đọc, độ đơn giản, đúng phạm vi, phát hiện review; không so cứng số dòng diff
SHA cơ sở: `origin/develop` @ `eb1ce4d`
PR: Không — tài liệu TL

## Mục tiêu
Một hướng dẫn ngắn giúp code mới đơn giản, đúng phạm vi; chỉ giữ skill/practice có lợi ích đo được trên 2 task Module 3.

## Output
- [docs/project/engineering-guide.md](../project/engineering-guide.md) (1 file, 3 phần).
- Đánh giá skill bên ngoài (dưới đây) và phiếu đo cho SE-011, SE-012.
- Prompt Senior Dev: thêm một dòng dẫn tới hướng dẫn — **đề xuất**, áp dụng khi CTO duyệt (không tự sửa prompt).

## Phạm vi
- Làm: như Output.
- Không làm: cài skill/plugin; copy hướng dẫn bên thứ ba vào repo; khung agent riêng.

## Nguồn yêu cầu
- CTO directive 16/11/2026 mục 7–8; CTO vòng 2 mục 6; CTO duyệt Wave 0–2.

## Hiện trạng (TL kiểm 16/11/2026)
- Repo: không có `.claude/`, không skill cấp repo; `CLAUDE.md` + `apps/web/AGENTS.md` là hướng dẫn agent duy nhất.
- Máy dev (cấp user, dùng chung TL/SE): skill `code-reviewer`, `nestjs-expert`, `nextjs-developer`, `react-expert`, `typescript-pro`, `security-reviewer`, …; plugin `ponytail` (tự bật mỗi phiên, thiên hướng "ít code nhất").
- Có sẵn trong Claude Code, không cần cài: `/simplify` (rà diff về dùng lại/đơn giản hóa), `/code-review`.
- Cổng chất lượng: `pnpm build/typecheck/lint`, vitest api (12 test); chưa có CI (SE-010 bổ sung).

## Đánh giá skill bên ngoài (đọc qua GitHub API, không cài)
| Nguồn | Ứng viên | Kết luận | Lý do |
|---|---|---|---|
| `anthropics/claude-plugins-official` (Apache-2.0) | `code-simplifier` | **Không dùng** | Ghi cứng chuẩn riêng (ưu tiên `function`, tránh try/catch, kiểu trả về tường minh…) có thể lệch quy ước repo; trùng `/simplify` có sẵn |
| | `code-review`, `pr-review-toolkit` | Không dùng | Trùng `/code-review` có sẵn và quy trình review TL |
| | `security-guidance` | Để sau | Hook cảnh báo mẫu mã nguy hiểm — xét khi chuẩn bị thử nội bộ |
| `obra/superpowers` (MIT) | Toàn bộ plugin | **Không dùng** | Hook `session-start` ép quy trình riêng (brainstorming, writing-plans, subagent-driven-development, worktree) — xung đột workflow TL/SE |
| | `verification-before-completion` | Lấy **nguyên tắc**, không cài | "Bằng chứng trước kết luận" đã ghi 3 dòng trong hướng dẫn mục 1 |
| | `systematic-debugging` | Để sau | Chỉ xét khi gặp lỗi khó; chưa có nhu cầu |
| `vercel-labs/agent-skills` (**không có license**) | `react-best-practices`, `composition-patterns`, `web-design-guidelines` | **Không dùng** | Không có giấy phép; thiên về tối ưu hiệu năng/Vercel; rủi ro lệch Next.js 16 (AGENTS.md cảnh báo) |
| Có sẵn trên máy | `ponytail` | **Quan sát trong pilot** | Hợp Simplicity First; rủi ro: quá tay cắt kiểm tra hoặc rút gọn bàn giao — đối chiếu bằng phiếu đo dưới |
| Có sẵn trong Claude Code | `/simplify` | **Thử** trên SE-011, SE-012 | Không cài gì; SE chạy trước bàn giao, ghi đề xuất đã nhận/từ chối |

## Phiếu đo (TL ghi trong review của SE-011, SE-012)
| Tiêu chí | Cách ghi |
|---|---|
| Độ dễ đọc | 1–5 + 2 ví dụ cụ thể (file:dòng) |
| Trừu tượng thừa / dependency chưa duyệt | Đếm từ phát hiện review |
| Đúng phạm vi | File/thay đổi ngoài phạm vi task |
| Phát hiện review | Số lượng theo mức (chặn / nên sửa / nhỏ); số vòng `Cần sửa` |
| Khả năng test | AC có test tự động / AC kiểm tay |
| `/simplify` | Số đề xuất, đã nhận, đã từ chối (lý do) |
| Tham khảo | Số file, dòng diff, thời gian nhận → bàn giao — **chỉ ghi, không so giữa các task** |

**Giữ lại** practice khi: không có trừu tượng thừa/dependency chưa duyệt bị bắt ở review, không lệch phạm vi, và TL thấy review nhanh hơn. Không đạt → bỏ, ghi lý do.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Một file hướng dẫn ≤ ~1 trang, 3 phần, dẫn đúng khuôn code thật | CTO 16/11 mục 8 | Đọc file |
| AC2 | Đánh giá từng ứng viên theo liên quan / xung đột / bảo mật / bảo trì; không cài gì | CTO 16/11 mục 8 | Bảng trên |
| AC3 | Phiếu đo SE-011, SE-012 điền đủ | CTO vòng 2 mục 6 | Review của 2 task |
| AC4 | Kết luận giữ/bỏ từng practice có bằng chứng | CTO 16/11 mục 8 | Checklist vòng 2 |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| P1 | Thêm một dòng vào prompt Senior Dev: "Đọc docs/project/engineering-guide.md trước khi code" | Đồng ý | Chờ CTO |

## Kết quả review
Vòng 1 (16/11/2026): hướng dẫn + đánh giá skill — chờ CTO. Vòng 2: kết quả đo sau SE-011, SE-012.

## Lịch sử review
### Checklist vòng 1
**Task hoặc yêu cầu** — TL-010 · [engineering-guide.md](../project/engineering-guide.md) · cơ sở `eb1ce4d` · vòng 1
**Kết luận** — Không cài skill nào. Thử `/simplify` có sẵn trên 2 task pilot; quan sát `ponytail` đang có; nguyên tắc "bằng chứng trước kết luận" đưa vào hướng dẫn.
**Checklist**
- [x] AC1 — hướng dẫn 3 phần, dẫn `modules/chat/`, `env.validation.ts`, `PaginationQueryDto`, `me.service.ts`, `apps/web/AGENTS.md`
- [x] AC2 — 3 repo đọc qua `gh api` (license, nội dung skill, hook); 0 cài đặt
- [ ] AC3, AC4 — chờ SE-011, SE-012 bàn giao

**Trạng thái và bước tiếp theo** — Chờ CTO duyệt hướng dẫn và P1; đo ở vòng 2.

## Phản hồi UI
Không áp dụng.
