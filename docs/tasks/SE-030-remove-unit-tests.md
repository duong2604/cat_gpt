# SE-030 — Gỡ toàn bộ unit test khỏi `apps/api`

Trạng thái: **TẠM DỪNG — CTO NOT APPROVED (22/11/2026)**; chờ CTO duyệt riêng sau giải trình TL ([báo cáo Chat mục 18](../reports/chat-module-structural-review.md))
Người phụ trách: Senior Dev · Ưu tiên: P2 · Ước lượng: 0,25 ngày
Phụ thuộc: SE-029 merge (cùng `package.json`/lockfile)
Hạn bàn giao review: theo SE-029 · Hạn hoàn tất: không đặt
Chốt: 22/11/2026 — **quyết định của chủ dự án** (trả lời TL): xóa toàn bộ 8 file spec. Thay thế mục 1 "Giữ nguyên test hiện có" của chỉ thị CTO "Chat Module Convention Review" — TL báo CTO.
SHA cơ sở: `origin/develop` mới nhất sau SE-029

## Phạm vi (chỉ những thứ chỉ phục vụ unit test)
1. Xóa 8 tệp: `apps/api/src/modules/chat/chat.service.spec.ts`; `documents/{chunk-text,document-summary,permanent-error,sanitize-filename,text-extract}.spec.ts`; `llm/openai-llm.provider.spec.ts`; `rag/rag.service.spec.ts`.
2. Xóa `apps/api/vitest.config.ts`, `apps/api/vitest.config.e2e.ts`.
3. `apps/api/package.json`: bỏ script `test`, `test:watch`, `test:cov`, `test:debug`, `test:e2e`; bỏ devDependency **chỉ dùng cho test** — `vitest`, `@vitest/coverage-v8`, `@nestjs/testing`, `supertest`, `@types/supertest` (grep xác nhận không còn import trong `src`); sửa script `format` bỏ glob `test/**`; cập nhật `pnpm-lock.yaml`.
4. `apps/api/tsconfig.json`: bỏ `vitest/globals` khỏi `types`. `tsconfig.build.json` giữ nguyên (exclude vô hại) hoặc bỏ `**/*spec.ts` — ghi lý do.
5. `apps/api/test/fixtures/`: grep — chỉ được spec dùng thì xóa; còn nơi khác dùng thì giữ, ghi lý do.
6. `.github/workflows/ci.yml`: bỏ bước `pnpm --filter @cat-gpt/api test`; giữ typecheck/lint/build.
7. Tài liệu: `docs/project/engineering-guide.md` dòng "Test: vitest…" → quy ước mới: không dùng unit test; kiểm chứng bằng kịch bản runtime/hồi quy và ghi lệnh + đầu ra vào bàn giao. **Không sửa** file task/báo cáo cũ (lịch sử).
Không đổi mã nguồn chạy, không đụng `apps/web`, `packages/shared`.

## Checklist nghiệm thu
| # | Tiêu chí | Cách kiểm tra |
|---|---|---|
| AC1 | Không còn `*.spec.ts`/`*.test.ts`, config vitest, script test, dependency chỉ dùng cho test | `find`, `grep vitest\|supertest\|@nestjs/testing` |
| AC2 | typecheck/lint/build sạch; CI xanh (không còn bước test) | Lệnh + CI |
| AC3 | Không regression runtime: `f03-verify`, `rag-runtime`, `se020-review` | Kịch bản TL |
| AC4 | Diff chỉ trong phạm vi trên | `git diff --stat` |

## Kết quả review
Chưa có.

## Lịch sử review
Chưa có.

## Phản hồi UI
Không áp dụng.
