# TL-001 — Khoanh phạm vi tích hợp Chat

Trạng thái: Done
Người phụ trách: TL · Ưu tiên: P1 · Ước lượng: 0,5 ngày làm việc
Phụ thuộc: Không
Hạn bàn giao review: 15/11/2026 (giao trong ngày) · Hạn hoàn tất: không đặt (trước mốc M1 16/11/2026)
Ngày thực tế: bắt đầu 15/11/2026 · bàn giao review 15/11/2026 · hoàn tất 15/11/2026
Chốt: 15/11/2026 (khách hàng giao trực tiếp, yêu cầu "thực hiện ngay")
SHA cơ sở: `origin/develop` @ `a860437f45124636f4eea87b3209635f4e2d4d7d` · nguồn: `origin/preview/module-2-4-demo` @ `b2a4b22d40804f246c8505e66bad9e7a2b483ca4`
PR: Không áp dụng (task phân tích; tài liệu tích hợp cùng đợt tài liệu 15/11/2026)

## Mục tiêu
Xác định chính xác phần Chat (Module 2) lấy được từ nhánh preview vào `develop`, những gì phải loại để không kéo theo giao diện demo Module 3–4, các phụ thuộc và điểm cần kiểm tra — đủ cụ thể để Senior Dev làm [SE-001](SE-001-chat-integration.md) mà không phải phân tích lại.

## Output
- Mục "Kết quả phân tích" bên dưới: danh sách lấy / lấy một phần / loại trừ, phụ thuộc, khoảng trống so với thiết kế, công thức tích hợp đã chạy thử, các kiểm tra chống lẫn Module 3–4.
- Task [SE-001](SE-001-chat-integration.md) soạn từ kết quả này.

## Phạm vi
- Làm: phân tích commit preview, chạy thử tích hợp trong worktree tạm (không push), ghi kết quả.
- Không làm: code trên nhánh dự án; quyết định thay khách hàng.

## Nguồn yêu cầu
- Yêu cầu/quyết định đã duyệt: yêu cầu của khách hàng 15/11/2026 (đợt chuẩn bị demo); đề xuất bước 1 và câu Q1–Q2 của [audit](../project/preview-progress-review.md#1-kết-luận-và-quyết-định-cần-chốt).
- Function Spec / Basic Design: [module-2-chat.md](../design/module-2-chat.md) mục 2–5 và [mục 8](../design/module-2-chat.md#8-checklist-nghiệm-thu).

## Kết quả phân tích

### 1. Kiểm tra lại SHA
`git fetch origin` ngày 15/11/2026: `develop` vẫn `a860437`, preview vẫn `b2a4b22` — **trùng SHA của audit**, nội dung không thay đổi. Phát hiện mới bên dưới (mục 3, 5) là do phân tích sâu hơn, không phải do nhánh thay đổi.

### 2. Commit trên preview (5 commit sau `develop`)

| Commit | Nội dung | Quyết định |
|---|---|---|
| `6a301c3` feat(shared) | `packages/shared/src/chat.ts` (kiểu, sự kiện SSE, `CHAT_MAX_MESSAGE_LENGTH`), 3 mã lỗi chat | **Lấy nguyên** |
| `653a4b0` feat(api) | `apps/api/src/modules/chat/*`, `llm/*` (mock), `app.module.ts`, config `LLM_MODEL` / `LLM_SYSTEM_PROMPT`, `.env.example` | **Lấy nguyên** |
| `8db5547` feat(web) | `features/chat/*`, route `/chat`, `/chat/[id]`, `lib/api/*`, CSS tô màu code, 3 thư viện markdown + `pnpm-lock.yaml` | **Lấy nguyên, bỏ 1 dòng** `ask: "/ask"` trong `apps/web/src/lib/routes.ts` (route của demo Module 4) |
| `d2d1ac1` feat(web) demo M3–4 | `features/ask`, `features/documents`, `/ask`, `/documents`, sidebar, app-shell, `messages/*.json`, xóa `coming-soon.tsx` | **Không cherry-pick.** Chỉ chép tay 3 phần Chat cần (mục 3) |
| `b2a4b22` docs | `docs/ket-qua-tam-thoi.md` (mô tả cả demo M3–4) | **Không lấy**; SE-001 cập nhật `module-2-chat.md` thay thế |

### 3. Phát hiện mới: Chat phụ thuộc vào commit demo `d2d1ac1`

Chạy thử `git cherry-pick 6a301c3 653a4b0 8db5547` lên `develop`: **không xung đột**, nhưng `pnpm typecheck` và `pnpm build` của web **thất bại với 41 lỗi TS2345**, vì chuỗi dịch của Chat chỉ được thêm ở `d2d1ac1` (next-intl kiểm tra key theo kiểu). Ba phần Chat nằm trong `d2d1ac1` cần chép tay:

| # | File | Lấy | Không lấy |
|---|---|---|---|
| P1 | `apps/web/messages/vi.json`, `en.json` | Toàn bộ namespace `chat` (thay `chat.title` / `chat.description` giữ chỗ); 3 key `errors.CONVERSATION_NOT_FOUND`, `CHAT_STREAM_IN_PROGRESS`, `CHAT_NOTHING_TO_REGENERATE` | `nav.ask`, namespace `ask`, mọi thay đổi `documents`; **giữ** `common.comingSoon` |
| P2 | `apps/web/src/components/layout/app-shell.tsx` | Bố cục toàn màn hình (không lề, không giới hạn rộng) **chỉ cho `/chat` và `/chat/*`** — xem mục 6 | `routes.ask` trong danh sách full-bleed |
| P3 | `apps/web/src/components/layout/app-sidebar.tsx` | Bỏ `comingSoon: true` của mục Chat | Mục "Hỏi đáp tài liệu", icon `BookOpenCheckIcon`; **giữ** nhãn "Đang phát triển" cho Tài liệu và cơ chế `comingSoon` |

Thiếu P2 thì Chat vẫn biên dịch được nhưng bị đóng khung trong vùng có lề `max-w-6xl` → khung chat và ô nhập không chiếm hết chiều cao (cần SE-001 xác nhận trên giao diện).

### 4. Phụ thuộc

| Loại | Chi tiết | Ảnh hưởng |
|---|---|---|
| Thư viện mới (web) | `react-markdown`, `remark-gfm`, `rehype-highlight` (kèm lockfile từ `8db5547`) | Là câu 7 mục 3 Module 2 — **chưa được xác nhận chính thức** (xem Q3) |
| Biến môi trường | `LLM_MODEL` (mặc định `mock-1`), `LLM_SYSTEM_PROMPT` (có mặc định) | `.env` hiện tại không cần sửa; thêm vào `.env.example` |
| CSDL | 2 collection mới `conversations`, `messages` (tự tạo) | Không cần migration |
| LLM | `MockLlmProvider` — **phản hồi là nội dung giả lập**, chọn ngẫu nhiên, không liên quan câu hỏi | Nếu demo bắt buộc AI thật → task provider riêng (plan, quyết định D2) |
| Code Module 1 | Dùng `refreshSession`, `useErrorMessage`, guard JWT có sẵn | Không sửa Module 1 |

### 5. Khoảng trống so với Basic Design

| # | Basic Design | Preview `b2a4b22` | Đề xuất cho SE-001 |
|---|---|---|---|
| G1 | [4.6](../design/module-2-chat.md#46-giới-hạn-tần-suất): 20 tin/phút **theo người dùng** cho 2 endpoint SSE; [mục 8](../design/module-2-chat.md#8-checklist-nghiệm-thu) dòng 8 | **Chưa có.** Chỉ có giới hạn chung 120 request/phút/IP (`app.module.ts:25`); `chat.controller.ts` không có `@Throttle` | Làm trong SE-001 (ước lượng 0,5 ngày) — cần chốt Q3 |
| G2 | [4.5](../design/module-2-chat.md#45-đầu-chờ-llm): `LLM_PROVIDER=mock` chọn provider | Chưa có biến này, `llm.module.ts` cố định `MockLlmProvider` | Không làm ở SE-001; để cho task provider (nếu có) |
| G3 | [5.2](../design/module-2-chat.md#52-cấu-trúc-appswebsrcfeatureschat--theo-tên-file-thực-tế-trên-develop): tên file component | Tên file thực tế khác (`chat-stream-provider.tsx`, `conversation-view.tsx`, …) | Chấp nhận; SE-001 cập nhật tài liệu theo code |
| G4 | [Mục 3](../design/module-2-chat.md#3-câu-hỏi-cần-sinh-viên-xác-nhận): 11 đề xuất mặc định "chờ xác nhận" | Preview đã làm theo các đề xuất mặc định | Cần khách hàng xác nhận để làm nguồn nghiệm thu (Q3) |

### 6. Công thức tích hợp đã chạy thử

Chạy trong worktree tạm từ `origin/develop` @ `a860437` (đã gỡ sau khi kiểm tra, không push):

```bash
git cherry-pick -x 6a301c3 653a4b0 8db5547   # không xung đột
# P1: chép namespace chat + 3 key errors từ messages/{vi,en}.json @ b2a4b22
# P2: app-shell.tsx
#   const pathname = usePathname();
#   const fullBleed = pathname === routes.chat || pathname.startsWith(`${routes.chat}/`);
#   <main className={fullBleed ? "flex min-h-0 flex-1 flex-col" : "mx-auto w-full max-w-6xl flex-1 p-4 md:p-6 lg:p-8"}>
# P3: app-sidebar.tsx — bỏ comingSoon: true ở mục chat
# routes.ts — bỏ ask: "/ask"
```

| Bước | Kết quả |
|---|---|
| Chỉ cherry-pick 3 commit | `typecheck` web: 41 lỗi; `build` web: thất bại |
| + P1 | `tsc --noEmit` web: 0 lỗi |
| + P2, P3, bỏ `routes.ask` | `pnpm typecheck` 4/4, `pnpm lint` 3/3 (0 lỗi, 0 cảnh báo), `pnpm build` 3/3 thành công; build có route `/chat`, `/chat/[id]` |
| So với preview | `git diff b2a4b22 -- apps/api packages/shared apps/web/package.json pnpm-lock.yaml` **rỗng** → API và kiểu dữ liệu giống hệt bản đã kiểm chứng hành vi trong [audit mục 3.2](../project/preview-progress-review.md#32-module-2--trợ-lý-hội-thoại-hình-56) |

Lưu ý: chép bằng script làm đổi ký tự xuống dòng của `routes.ts`; SE-001 sửa tay để diff chỉ còn dòng cần đổi.

### 7. Kiểm tra chống kéo theo Module 3–4 (đưa vào SE-001 AC9)

Trên nhánh SE-001 so với `develop`:
- `git diff --name-only origin/develop` không có `features/ask`, `features/documents`, `app/(app)/ask`, `app/(app)/documents`, `components/coming-soon.tsx`, `docs/ket-qua-tam-thoi.md`.
- `git grep -n '"/ask"\|ask:' -- apps/web/src/lib/routes.ts` rỗng; `messages/*.json` không có key `ask` (cả `nav.ask`), vẫn có `common.comingSoon`.
- Giao diện: `/documents` vẫn là trang "Đang phát triển"; thanh bên chỉ có Trò chuyện, Tài liệu (nhãn "Đang phát triển"), Người dùng; mở `/ask` → trang 404.

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | Xác định phần lấy / lấy một phần / loại trừ theo từng commit và file | Yêu cầu 15/11 mục 2.1 | Mục 2, 3 |
| AC2 | Liệt kê phụ thuộc và khoảng trống so với thiết kế | Yêu cầu 15/11 mục 2.1; module-2-chat mục 2–5, 8 | Mục 4, 5 |
| AC3 | Có các kiểm tra chống kéo theo Module 3–4 | Yêu cầu 15/11 mục 2.1; audit Q2 | Mục 7 |
| AC4 | Đủ cụ thể để Senior Dev triển khai | Yêu cầu 15/11 mục 2.1 | Công thức mục 6 đã chạy thử; SE-001 dẫn về đây |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q3 | Xác nhận 11 đề xuất mặc định ở [mục 3 Module 2](../design/module-2-chat.md#3-câu-hỏi-cần-sinh-viên-xác-nhận) (gồm 3 thư viện markdown mới) làm yêu cầu đã duyệt, và đưa giới hạn 20 tin/phút/người (G1) vào SE-001 | Đồng ý cả hai | **Đồng ý** — khách hàng, 15/11/2026 |

Q3 là điều kiện để SE-001 sang `Sẵn sàng`. Quyết định của mốc demo (D1, D2, D3) ghi ở [plan.md](../project/plan.md#5-quyết-định-còn-mở).

## Kết quả review
**Đạt** — khách hàng duyệt phạm vi và chốt Q3 ngày 15/11/2026 ([Review vòng 1](#review-vòng-1)). TL chuyển `Done` 15/11/2026; tài liệu có trên `develop` @ `6f9d3e4`. SE-001 chuyển `Sẵn sàng` cùng ngày.

## Lịch sử review

### Checklist vòng 1
**Task hoặc yêu cầu** — TL-001 · `develop` `a860437` · preview `b2a4b22` · vòng 1
**Kết luận** — Lấy được 3 commit Chat nhưng phải chép tay 3 phần Chat nằm trong commit demo `d2d1ac1` (chuỗi dịch, bố cục toàn màn hình, nhãn thanh bên); thiếu giới hạn 20 tin/phút/người so với thiết kế. Công thức đã chạy thử đạt typecheck/lint/build.
**Checklist**
- [x] AC1 Phân loại lấy / một phần / loại trừ — Đạt — mục 2–3; `git show --stat` 5 commit `a860437..b2a4b22`
- [x] AC2 Phụ thuộc và khoảng trống — Đạt — mục 4–5; `git grep Throttle b2a4b22 -- apps/api/src` chỉ có `auth.controller.ts` và `app.module.ts`
- [x] AC3 Kiểm tra chống lẫn Module 3–4 — Đạt — mục 7
- [x] AC4 Công thức chạy thử — Đạt — mục 6: 41 → 0 lỗi; typecheck 4/4, lint 3/3, build 3/3; diff API/shared với preview rỗng
- [ ] Chạy giao diện Chat trên bản thử — chưa chạy: task phân tích; hành vi API đã kiểm chứng ở audit với cùng mã nguồn, giao diện sau tích hợp do SE-001 (AC2–AC5, AC10) và TL-002 kiểm tra
- [ ] Khách hàng và CTO duyệt phạm vi, chốt Q3 — chờ

**Kiểm tra đã chạy** — `git fetch origin`; `git cherry-pick` trong worktree tạm; `pnpm install --frozen-lockfile`; `pnpm typecheck`; `pnpm lint`; `pnpm build`; `npx tsc --noEmit` (web); `git diff b2a4b22 -- …`; worktree đã gỡ.
**Trạng thái và bước tiếp theo** — Chờ Review. Khách hàng/CTO duyệt phạm vi và chốt Q3 → TL chuyển [SE-001](SE-001-chat-integration.md) sang `Sẵn sàng`.

#### Review vòng 1
Khách hàng (15/11/2026): duyệt TL-001 và Q3. Demo đầu tiên dùng phản hồi mẫu; giữ Module 3–4 ở preview. Kết quả: TL chuyển `Done`, SE-001 sang `Sẵn sàng`.

## Phản hồi UI
Không áp dụng (task phân tích, không có giao diện mới).
