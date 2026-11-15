# Audit tiến độ so với báo cáo 27/10/2026

Trạng thái: Chờ Review (khách hàng + CTO)
Người lập: TL · Ngày: 15/11/2026
Nguồn báo cáo: `Bùi Văn Dương_Tài liệu báo cáo công việc.docx` (chốt 27/10/2026, bảng tiến độ + Hình 1–14), file nằm ngoài repo
Bản đã kiểm tra:

| Nhánh | Nguồn | SHA |
|---|---|---|
| `develop` | `origin/develop` (fetch 15/11/2026) | `a860437f45124636f4eea87b3209635f4e2d4d7d` |
| `preview/module-2-4-demo` | `origin/preview/module-2-4-demo`, trùng nhánh local | `b2a4b22d40804f246c8505e66bad9e7a2b483ca4` |

Mọi kết luận "thấy trên develop / preview" phản ánh hai SHA trên, không phải trạng thái ngày 27/10. Commit dùng để chụp từng hình **không xác định được** (xem mục 4.1).

## 1. Kết luận và quyết định cần chốt

**Thử được ngay**
- **Module 1** (đăng nhập, hồ sơ, phiên, quản trị người dùng): đã nằm trên `develop` và chạy thật với MongoDB.
- **Module 2** (Chat): chạy thật trên nhánh preview — câu trả lời đến từng phần qua API (streaming thật), lịch sử được lưu, dừng/tạo lại hoạt động. Nhưng **chưa đưa vào `develop`** và **nội dung trả lời là văn bản mẫu**, chưa có mô hình AI thật.

**Mới ở mức giao diện demo**
- **Module 3** (Tài liệu) và **Module 4** (Hỏi–đáp, tóm tắt): toàn bộ dữ liệu nằm sẵn trong trình duyệt. Tải tệp lên không gửi gì tới máy chủ; tải lại trang là mất. Câu trả lời được chọn theo từ khóa: hỏi về nội dung tệp vừa tải lên, hệ thống vẫn trả lời bằng tài liệu mẫu khác và trích nguồn sai.

**Chênh lệch lớn nhất so với báo cáo**
- Báo cáo ghi Module 3 và Module 4 "Hoàn thành 80%", nhưng phần xử lý phía máy chủ (lưu tệp, bóc tách, chia đoạn, vector, truy hồi, AI) **chưa có dòng code nào**. Không có căn cứ để xác nhận 80%.
- Báo cáo ghi Module 2 "Hoàn thành", trong khi tính năng chưa tích hợp vào `develop` và chưa có LLM thật.

**Đề xuất thứ tự việc tiếp theo** (để khách hàng và CTO đánh giá)
1. **Tích hợp Module 2 vào `develop`** từ 4 commit chat của nhánh preview (`6a301c3`, `653a4b0`, `8db5547` và phần chat liên quan), tách khỏi demo Module 3–4. Đây là phần gần xong nhất. *(Vòng 2: phạm vi chi tiết ở [TL-001](../tasks/TL-001-chat-integration-scope.md) — "phần chat liên quan" là chuỗi dịch, bố cục và nhãn thanh bên nằm trong commit demo `d2d1ac1`; giao triển khai ở [SE-001](../tasks/SE-001-chat-integration.md).)*
2. **Chốt LLM thật** (nhà cung cấp, mô hình, chạy local hay API) vì cùng ảnh hưởng Module 2 và Module 4.
3. **Viết Function Spec + Basic Design cho Module 3** (API tải lên, lưu trữ, hàng đợi xử lý, bóc tách PDF/DOCX/TXT, trạng thái) rồi giao task làm thật.
4. **Module 4 thật** sau khi Module 3 có dữ liệu thật (embedding, cơ sở dữ liệu vector, truy hồi, trích dẫn).
5. **Điều chỉnh cách ghi tiến độ** trong báo cáo kế tiếp: tách "giao diện demo" và "chạy thật".

**Quyết định cần chốt**

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Tích hợp Module 2 vào `develop` với LLM giả lập trước, hay chờ LLM thật? | Tích hợp trước; LLM thật là task riêng |
| Q2 | Giữ demo Module 3–4 trên nhánh preview hay đưa vào `develop` kèm nhãn "Dữ liệu minh họa"? | Giữ ở preview; làm bản thật thay dần |
| Q3 | Báo cáo tiến độ kế tiếp ghi Module 3–4 thế nào? | "Giao diện demo xong; phần xử lý thật chưa bắt đầu" thay cho "80%" |
| Q4 | Chọn LLM nào cho Module 2 và 4? | Cần khách hàng/CTO chốt theo chi phí và yêu cầu chạy nội bộ |

Vòng 2: Q1 và Q4 gắn với quyết định D2 của [plan.md](plan.md#5-quyết-định-còn-mở) (demo có bắt buộc AI thật); plan đang giả định Q2 = giữ demo Module 3–4 ở preview.

## 2. Bảng đối chiếu tiến độ

| Hạng mục | Báo cáo 27/10 | Thực tế trên `develop` | Thực tế trên preview | Việc còn lại | Bằng chứng |
|---|---|---|---|---|---|
| Nghiên cứu, khảo sát công nghệ | Hoàn thành | Không có tài liệu nghiên cứu trong repo | — | Bổ sung tài liệu nếu cần nộp | Chưa xác minh (ngoài repo) |
| Phân tích yêu cầu, thiết kế kiến trúc, CSDL, API | Hoàn thành | Có quyết định kiến trúc D-01…D-11, thiết kế Module 1–2. **Chưa có** thiết kế Module 3–4 | — | Function Spec + Basic Design Module 3, 4 | [overview-and-decisions.md](overview-and-decisions.md), [module-1-auth.md](../design/module-1-auth.md), [module-2-chat.md](../design/module-2-chat.md) |
| Module 1 — Xác thực & người dùng | Hoàn thành | **Chạy thật** (PR #1) | Giống `develop` | Chạy lại kịch bản khóa/mở khóa trên giao diện (không chạy trong audit này) | Hình 1–4, mục 3.1 |
| Module 2 — Chat + streaming | Hoàn thành | **Chưa có** (trang "Đang phát triển") | **Chạy thật**, nội dung trả lời **Demo/mock** | Tích hợp `develop`; LLM thật | Hình 5–6, mục 3.2 |
| Module 3 — Quản lý tài liệu | Hoàn thành 80% | **Chưa có** | **Demo/mock** (chỉ giao diện) | Toàn bộ backend + nối giao diện | Hình 7–9, mục 3.3 |
| Module 4 — RAG hỏi–đáp, tóm tắt | Hoàn thành 80% | **Chưa có** | **Demo/mock** (chỉ giao diện) | Toàn bộ RAG + LLM + nối giao diện | Hình 10–14, mục 3.4 |
| Tối ưu RAG tiếng Việt, đánh giá | Chưa bắt đầu | Chưa có | Chưa có | Phụ thuộc Module 4 thật | Khớp báo cáo |
| (Mở rộng) Module 5 — Dịch tài liệu | Chưa bắt đầu | Chưa có | Chưa có | Ngoài phạm vi cam kết | Khớp báo cáo |
| Viết báo cáo, chuẩn bị bảo vệ | Đang thực hiện | — | — | — | Chưa xác minh (ngoài repo) |

**Hai mốc 80%:**
- *Module 3 — đã có:* giao diện danh sách, thống kê, tìm kiếm/lọc, hộp thoại tải lên (kiểm tra loại/kích thước tệp), trang chi tiết với 4 bước xử lý, minh họa lỗi tệp scan. *Còn thiếu:* API tải lên, lưu tệp (Local/MinIO), hàng đợi xử lý bất đồng bộ, bóc tách nội dung, chia đoạn, sinh vector, lưu dữ liệu tài liệu, phân quyền theo người dùng, nối giao diện với API.
- *Module 4 — đã có:* giao diện hỏi–đáp, hiển thị các bước RAG, trích dẫn + thẻ nguồn, chọn phạm vi, từ chối khi không có thông tin, hộp thoại tóm tắt 2 chế độ. *Còn thiếu:* embedding, cơ sở dữ liệu vector, truy hồi, gọi LLM, sinh trích dẫn từ dữ liệu thật, tóm tắt từ nội dung thật, API và streaming cho hỏi–đáp.
- Không có Function Spec/kế hoạch hạng mục cho Module 3–4 trong repo để làm mẫu số, nên **không xác nhận được tỷ lệ 80%**.

## 3. Chi tiết theo module

Cách kiểm chứng chung (15/11/2026): chạy bản preview `b2a4b22` trong worktree riêng (API cổng 4100, Web cổng 3100, MongoDB Atlas thật theo `apps/api/.env`); gọi API bằng curl/script; thao tác giao diện bằng trình duyệt; đọc code bằng `git show`. Module 1 trên preview **giống hệt** `develop` (`git diff a860437 b2a4b22` trên các thư mục Module 1 rỗng), nên hành vi chạy trên preview đại diện cho `develop`. Dữ liệu thử đã được xóa sau khi kiểm tra.

### 3.1. Module 1 — Xác thực và quản lý người dùng (Hình 1–4)

| Chức năng | Báo cáo | `develop` | Kiểm chứng | Kết luận |
|---|---|---|---|---|
| Đăng nhập, ngôn ngữ, sáng/tối (H1) | Có | Có | Đăng nhập qua giao diện và API: 200; chưa đăng nhập gọi `/me`: 401 | Chạy thật |
| Hồ sơ, ảnh đại diện (H2) | Có | Có | `GET /me` 200; tải PNG hợp lệ 201; tệp giả đuôi `.png` bị từ chối `FILE_INVALID_TYPE`; đã xóa ảnh để trả lại trạng thái cũ | Chạy thật |
| Quản lý phiên (H3) | Có | Có | `GET /me/sessions` 200 | Chạy thật |
| Tìm kiếm/lọc người dùng (H4) | Có | Có | `GET /admin/users?search=admin&role=ADMIN&status=ACTIVE&pageSize=10` → 1 kết quả | Chạy thật |
| Phân quyền, khóa/mở khóa (H4) | Có | Có | Admin tự khóa mình bị chặn `USER_CANNOT_MODIFY_SELF`. Khóa/mở khóa user khác **không chạy** để tránh sửa dữ liệu thật | Chạy thật một phần; khóa user khác: Chưa xác minh lần này (tài liệu Module 1 ghi đã kiểm thử 23/10) |

Lưu ý hình: Hình 2–4 có mục menu "Hỏi đáp tài liệu", mục này chỉ có từ commit `d2d1ac1` trên preview → các hình này chụp từ bản preview, không phải `develop`. Giao diện Module 1 hai bản như nhau nên không ảnh hưởng kết luận.

### 3.2. Module 2 — Trợ lý hội thoại (Hình 5–6)

| Chức năng | Báo cáo | `develop` | Preview | Kiểm chứng | Kết luận |
|---|---|---|---|---|---|
| Màn Chat, câu hỏi gợi ý (H5) | Có | Chưa có (`ComingSoon`) | Có | Giao diện: 4 gợi ý, ô nhập | Chạy thật (giao diện) |
| Phản hồi AI (H6) | Có | Chưa có | Có | Câu trả lời từ `MockLlmProvider` (model `mock-1`): chọn ngẫu nhiên 1 trong các mẫu, không liên quan câu hỏi. Hình 6 khớp bản ghi DB ngày 27/10 21:53 (giờ VN), model `mock-1` | Demo/mock |
| **Streaming** | Hoàn thành | Chưa có | Có | Gọi `POST /chat/stream`: 39 sự kiện `delta` đến trong 1,4 giây qua **41 lần đọc mạng riêng**; qua proxy Next.js: 55 `delta` trong 2,2 giây. Giao diện gọi đúng `POST /api/v1/chat/stream` | **Chạy thật** (từng phần đến từ API, không phải hiệu ứng). Nội dung là mock |
| Markdown dạng bảng (H6) | Có | Chưa có | Có | `react-markdown` + `remark-gfm`; bảng hiển thị trên giao diện | Chạy thật |
| Sao chép, tạo lại (H6) | Có | Chưa có | Có | `POST /conversations/:id/regenerate` → 56 `delta`, tin nhắn mới `COMPLETED` | Chạy thật |
| Dừng giữa chừng | — | Chưa có | Có | Ngắt kết nối sau 0,6 giây → tin nhắn lưu `STOPPED` (191 ký tự) | Chạy thật |
| Lịch sử, tìm kiếm, xóa | — | Chưa có | Có | `GET /conversations?q=` đúng kết quả; `DELETE` 204 | Chạy thật |

Còn thiếu: tích hợp `develop`; LLM thật; checklist nghiệm thu ở [module-2-chat.md](../design/module-2-chat.md#8-checklist-nghiệm-thu) chưa được đánh dấu.

### 3.3. Module 3 — Quản lý tài liệu (Hình 7–9)

| Chức năng | Báo cáo | `develop` | Preview | Kiểm chứng | Kết luận |
|---|---|---|---|---|---|
| Danh sách, thống kê (H7) | Có | Chưa có | Có | 8 tài liệu dựng sẵn trong `fake-data.ts`, có nhãn "Dữ liệu minh họa" | Demo/mock |
| Tải lên (H8) | Có | Chưa có | Có | Tải `audit-sample.txt` (95 byte, nội dung đã biết) qua giao diện: **không có request nào tới máy chủ**; tệp chạy pipeline giả rồi "Sẵn sàng" với 4 đoạn bịa; **tải lại trang thì tệp biến mất** | Demo/mock |
| Chi tiết, tiến trình (H9) | Có | Chưa có | Có | Tiến trình 4 bước do bộ đếm giờ 600 ms trong trình duyệt; tên tệp có "scan" luôn lỗi `ocrRequired` | Demo/mock |
| Xử lý bất đồng bộ | Có (80%) | Chưa có | Chưa có | API không có module tài liệu (`apps/api/src/modules/` chỉ có chat, llm và Module 1) | Chưa có |

Lưu ý hình: Hình 7–9 **không** có menu "Hỏi đáp tài liệu" nhưng có màn Tài liệu demo; không commit nào có tổ hợp này (`8db5547` chưa có màn Tài liệu, `d2d1ac1` có cả hai) → chụp từ bản chưa commit. Chưa xác minh.

### 3.4. Module 4 — Khai thác tài liệu bằng AI (Hình 10–14)

| Chức năng | Báo cáo | `develop` | Preview | Kiểm chứng | Kết luận |
|---|---|---|---|---|---|
| Hỏi–đáp, câu gợi ý (H10) | Có | Chưa có | Có | Không có request mạng khi hỏi | Demo/mock |
| Trích dẫn, thẻ nguồn, số trang, độ liên quan (H11) | Có | Chưa có | Có | Số trang, độ liên quan gõ cứng trong `fake-knowledge.ts`. Hỏi "Làm việc từ xa trên sao Hỏa được không?" vẫn trả lời quy định làm việc từ xa với cùng 3 nguồn | Demo/mock |
| Câu hỏi ngoài nội dung (H12) | Có | Chưa có | Có | "gửi xe" → "không tìm thấy" vì không khớp từ khóa nào | Demo/mock |
| Chọn phạm vi (H13) | Có | Chưa có | Có | Phạm vi chỉ VPN + hỏi nghỉ phép → "không tìm thấy" | Demo/mock |
| Hỏi tài liệu vừa tải lên | — | Chưa có | Có | Hỏi "Mật khẩu Wi-Fi phòng họp tầng 5 là gì?" (có trong `audit-sample.txt`) → trả lời **chính sách mật khẩu** của tài liệu khác, trích "Chinh-sach-bao-mat-thong-tin.pdf tr.6, 89%". Phạm vi vẫn "6 tài liệu", không gồm tệp mới | Demo/mock — **trả lời sai nguồn** |
| Tóm tắt chi tiết (H14) | Có | Chưa có | Có | Tóm tắt soạn sẵn cho 8 tài liệu mẫu; tệp mới dùng khung chung | Demo/mock |
| Truy xuất thật | — | Chưa có | Chưa có | Không có embedding, vector DB, LLM | Chưa có |

## 4. Checklist trải nghiệm cho khách hàng

**Cách mở**
- *Bản `develop` (Module 1):* chạy theo [README.md](../../README.md#chạy-dự-án), mở http://localhost:3000.
- *Bản preview (Module 2–4):* chưa có môi trường chung. Cách thử khả dụng: `git worktree add ../cat_gpt-preview origin/preview/module-2-4-demo`, chép `apps/api/.env` và `apps/web/.env` sang, `pnpm install`, `pnpm dev`, mở http://localhost:3000 (dừng bản `develop` trước nếu đang chạy cùng cổng).
- Đăng nhập bằng tài khoản admin trong `apps/api/.env`.

**Module 1 — `develop`**
- [ ] Mở `/login` → đổi ngôn ngữ và giao diện tối → giao diện đổi ngay, không cần tải lại.
- [ ] Mở `/profile` → tải ảnh JPG/PNG nhỏ → ảnh đại diện hiện ở góc dưới thanh bên.
- [ ] Mở `/profile` tab Phiên đăng nhập → thấy thiết bị hiện tại có nhãn "Thiết bị này".
- [ ] Mở `/admin/users` → tạo người dùng thử, khóa người đó → người đó đang đăng nhập bị đưa về màn đăng nhập ở thao tác kế tiếp.

**Module 2 — preview** (nội dung trả lời là văn bản mẫu)
- [ ] Mở `/chat` → bấm một câu gợi ý → chữ hiện dần từng cụm, có nút Dừng.
- [ ] Gửi câu hỏi rồi bấm Dừng giữa chừng → câu trả lời dừng, có nhãn "Đã dừng", tải lại trang vẫn còn.
- [ ] Bấm Tạo lại → câu trả lời mới thay câu cũ. Bấm Sao chép → dán ra được nội dung.
- [ ] Đổi tên, tìm kiếm, xóa một hội thoại trong cột trái → danh sách cập nhật đúng.

**Module 3–4 — preview** (toàn bộ là dữ liệu minh họa)
- [ ] Mở `/documents` → tải lên một tệp TXT bất kỳ → tệp chạy qua 4 bước rồi "Sẵn sàng". *Mong đợi của demo:* tải lại trang thì tệp biến mất.
- [ ] Mở `/ask` → bấm câu gợi ý "làm việc từ xa" → câu trả lời có số trích dẫn, bấm số để xem thẻ nguồn.
- [ ] Hỏi một câu về nội dung tệp vừa tải lên → *demo không đọc tệp*: hệ thống trả lời "không tìm thấy" hoặc trả lời theo tài liệu mẫu khác.
- [ ] Mở `/documents` → menu một tài liệu mẫu → "Tóm tắt bằng AI" → đổi Ngắn gọn/Chi tiết.

## 5. Checklist kiểm chứng của TL

### Checklist vòng 1

**Task hoặc yêu cầu** — Audit tiến độ theo báo cáo 27/10 · `develop` `a860437` · preview `b2a4b22` · vòng 1
**Kết luận** — Module 1 chạy thật trên `develop`; Module 2 streaming thật trên preview với LLM giả lập, chưa tích hợp; Module 3–4 chỉ là giao diện demo; không có căn cứ cho mốc 80%.

- [x] SHA hai nhánh — `git fetch origin develop preview/module-2-4-demo`; preview local trùng remote — bảng đầu báo cáo
- [x] Đọc bảng tiến độ, chú thích, Hình 1–14 — giải nén `.docx`, xem đủ 14 hình
- [x] Module 1 trên `develop` — 6 kiểm tra API/UI đạt (mục 3.1); code Module 1 giống hệt giữa hai nhánh — `git diff a860437 b2a4b22 -- apps/api/src/modules/{auth,sessions,users,me,admin-users,storage} apps/web/src/features/{auth,profile,admin-users} …` rỗng
- [ ] Module 1 khóa/mở khóa user khác — không chạy để tránh sửa dữ liệu thật; tài liệu Module 1 mục 7 ghi đã kiểm thử 23/10
- [x] Module 2 streaming từ API — đo 39/55 `delta` qua 41/57 lần đọc mạng (mục 3.2); code: `apps/api/src/modules/chat/chat.service.ts:133-135` (`for await … llm.stream` → `sse.send(delta)`), `sse-stream.ts`, `apps/web/src/features/chat/stream.ts` (đọc `ReadableStream`) @ `b2a4b22`
- [x] Module 2 nội dung là mock — `apps/api/src/modules/llm/llm.module.ts` (`useClass: MockLlmProvider`), `mock-llm.provider.ts`, `mock-answers.ts` @ `b2a4b22`; bản ghi DB 27/10 model `mock-1`
- [x] Module 2 dừng/tạo lại/lịch sử/tìm kiếm/xóa — mục 3.2
- [x] Module 3 không có backend — tải tệp qua giao diện: 0 request tới máy chủ; `apps/web/src/features/documents/use-fake-documents.ts` (state trong trình duyệt) @ `b2a4b22`; `apps/api/src/modules/` không có module tài liệu
- [x] Module 4 khớp từ khóa — `apps/web/src/features/ask/fake-knowledge.ts` `findAnswer()`; chạy hàm với tài liệu mẫu đã biết: trả lời sai nguồn (mục 3.4); giao diện cho cùng kết quả, 0 request mạng
- [x] Module 4 hiệu ứng chữ chạy là giả — `apps/web/src/features/ask/use-typewriter.ts`
- [x] `pnpm typecheck` / `pnpm lint` trên preview — 4/4 và 3/3 task thành công, 0 lỗi (khớp `ket-qua-tam-thoi.md` mục 2)
- [ ] Commit dùng để chụp Hình 1–14 — **chưa xác minh**: các commit preview cùng thời điểm 27/10 22:34, sau giờ chụp (phiên H3 lúc 22:08–22:18, hội thoại H6 lúc 21:53); H7–9 không khớp commit nào (mục 3.3)
- [ ] Nghiên cứu, phân tích thiết kế, chuẩn bị bảo vệ — chưa xác minh, tài liệu nằm ngoài repo
- [ ] Function Spec Module 3–4 — không có trong repo, nên không đối chiếu được tỷ lệ 80%
- [x] Đọc `docs/ket-qua-tam-thoi.md` (preview) — mô tả khớp kết quả kiểm chứng; tài liệu này đã ghi rõ Module 3–4 là "chỉ giao diện"
- [x] Dọn dữ liệu thử — 4 hội thoại audit đã xóa (204), avatar đã xóa, phiên curl đã đăng xuất, worktree và server tạm đã gỡ; tiến trình của khách hàng trên cổng 3000 không bị đụng
- [ ] Khách hàng và CTO review — chờ

**Kiểm tra đã chạy** — curl/script đo SSE; Node chạy `findAnswer`/`createFakeDocument`; trình duyệt trên `localhost:3100`; `git show`/`git diff` giữa `a860437` và `b2a4b22`; `pnpm typecheck`, `pnpm lint`.
**Trạng thái và bước tiếp theo** — Chờ Review. Sau khi chốt Q1–Q4, TL viết task cho bước 1–3 của mục 1.

#### Review vòng 1
Khách hàng (15/11/2026): giữ báo cáo tại đường dẫn này; dựa trên audit để chuẩn bị demo Chat ngay — fetch lại SHA, ghi phát hiện mới kèm bằng chứng; viết TL-001, SE-001, TL-002; plan và báo cáo tiến độ dẫn tới mục audit liên quan.

### Checklist vòng 2

**Task hoặc yêu cầu** — Audit tiến độ · `develop` `a860437` · preview `b2a4b22` · vòng 2
**Kết luận** — Hai nhánh không đổi so với vòng 1; kết luận vòng 1 giữ nguyên. Thêm hai phát hiện về Module 2 từ phân tích tích hợp (chi tiết và bằng chứng ở [TL-001](../tasks/TL-001-chat-integration-scope.md)).

- [x] Fetch lại SHA — `git fetch origin` 15/11/2026: `develop` `a860437`, preview `b2a4b22`, trùng vòng 1
- [x] Phát hiện mới 1: 3 commit Chat không tự đứng được — cherry-pick lên `develop` không xung đột nhưng `typecheck`/`build` web lỗi 41 TS2345 vì chuỗi dịch Chat nằm trong commit demo `d2d1ac1`; bổ sung chuỗi dịch, bố cục `/chat`, nhãn thanh bên → typecheck/lint/build đạt — [TL-001 mục 3, 6](../tasks/TL-001-chat-integration-scope.md#3-phát-hiện-mới-chat-phụ-thuộc-vào-commit-demo-d2d1ac1)
- [x] Phát hiện mới 2: giới hạn 20 tin/phút theo người dùng ([module-2-chat 4.6](../design/module-2-chat.md#46-giới-hạn-tần-suất)) chưa có trên preview — `git grep Throttle b2a4b22 -- apps/api/src` chỉ có `auth.controller.ts` và giới hạn chung 120/phút/IP ở `app.module.ts:25` — [TL-001 mục 5](../tasks/TL-001-chat-integration-scope.md#5-khoảng-trống-so-với-basic-design). Bảng mục 3.2 không có dòng giới hạn nên không đổi kết luận các dòng đã kiểm chứng
- [x] Mục 1 cập nhật tại chỗ: bước 1 dẫn tới TL-001/SE-001; Q1, Q4 gắn với D2 của plan
- [ ] Các mục chưa xác minh của vòng 1 (khóa user khác, commit chụp hình, tài liệu ngoài repo, Function Spec Module 3–4) — không đổi, không kiểm tra lại vòng này
- [ ] Khách hàng và CTO review — chờ

**Kiểm tra đã chạy** — `git fetch origin`; `git show --stat` 5 commit preview; cherry-pick + `pnpm typecheck` / `lint` / `build` trong worktree tạm (đã gỡ); `git grep` trên `b2a4b22`.
**Trạng thái và bước tiếp theo** — Chờ Review. Kế hoạch tiếp theo ở [plan.md](plan.md); tiến độ ở [demo-progress.md](../reports/demo-progress.md).
