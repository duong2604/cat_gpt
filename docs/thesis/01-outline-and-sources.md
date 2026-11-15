# 01 — Đề tài, phạm vi, bố cục chương và nguồn

Cơ sở: `origin/develop` @ `6ed0fbc` (15/11/2026) · Người lập: TL · Trạng thái: Chờ Review (vòng 1)
Nguồn chính: đề cương đồ án ngày 09/09/2026 (ngoài repo — mục 6). Những gì đề cương *dự kiến* khác với những gì *đã hiện thực* được ghi rõ ở mục 3.2.

## 1. Đề tài

| Mục | Nội dung (theo đề cương) |
|---|---|
| Tên đề tài | Xây dựng hệ thống trợ lý AI nội bộ hỗ trợ hội thoại và khai thác thông tin từ tài liệu sử dụng mô hình ngôn ngữ lớn (LLM) — CAT GPT |
| Sinh viên | Bùi Văn Dương — MSV 5250026 — lớp CNTT1, khóa K29.1, hệ liên thông, ngành Công nghệ thông tin |
| Giảng viên hướng dẫn | ThS. Bùi Minh Thảo — Bộ môn KHMT và Trí tuệ nhân tạo, Khoa Công nghệ thông tin |
| Đơn vị | Khoa Công nghệ thông tin, Trường Đại học Giao thông vận tải |
| Mã nguồn | https://github.com/duong2604/cat_gpt |

Thông tin liên lạc trong đề cương (SĐT, email) cố ý không chép vào repo.

## 2. Mục tiêu

**Bài toán** (đề cương): nhân viên mất nhiều thời gian tra cứu tri thức nằm rải rác trong tài liệu nội bộ. Hệ thống cần một trợ lý AI nội bộ để hội thoại với LLM, quản lý tài liệu, tóm tắt và hỏi–đáp theo nội dung tài liệu (RAG), đồng thời **dữ liệu được xử lý trong phạm vi kiểm soát của tổ chức**.

**Kết quả dự kiến theo đề cương** — kèm tình trạng tại SHA cơ sở (chi tiết: [README mục 3](README.md#3-trạng-thái-module-tại-sha-cơ-sở)):

| # | Kết quả dự kiến | Tình trạng 15/11/2026 |
|---|---|---|
| K1 | Hệ thống web gồm 4 module (1–4), giao diện trực quan | Module 1–2 đã tích hợp; Module 3–4 chỉ có demo |
| K2 | Trợ lý hội thoại phản hồi thời gian thực (streaming) | Đã tích hợp (nội dung mẫu); LLM thật đã kiểm thử trên PR #4 |
| K3 | Quản lý tài liệu + pipeline embedding tự động | Chỉ có demo giao diện |
| K4 | Tóm tắt, hỏi–đáp RAG có trích dẫn, tối ưu tiếng Việt | Chỉ có demo giao diện |
| K5 | Khung đánh giá: bộ hỏi–đáp tiếng Việt, chỉ số truy hồi, so sánh embedding | Chưa có |
| K6 | Triển khai Docker, vận hành on-premise | Chưa có (chạy local bằng `pnpm dev`) |
| K7 | Bàn giao mã nguồn, hướng dẫn cài đặt/sử dụng, báo cáo | Mã nguồn + hướng dẫn cài đặt có ([README.md](../../README.md)); báo cáo đang soạn |

## 3. Phạm vi

### 3.1. Phạm vi theo đề cương

| Module | Nội dung | Kế hoạch đề cương |
|---|---|---|
| 1 — Xác thực & quản lý người dùng | Đăng nhập/đăng xuất, thông tin cá nhân, đổi mật khẩu, quản lý phiên; admin quản lý tài khoản, khóa/mở khóa, phân quyền | 04/10 – 18/10/2026 |
| 2 — Trợ lý hội thoại (AI Chat) | Tạo và quản lý hội thoại (đổi tên, xóa), gửi/nhận tin nhắn, streaming, lưu lịch sử | 19/10 – 01/11/2026 |
| 3 — Quản lý tài liệu | Tải lên/xuống, metadata, tìm kiếm, xóa, trạng thái xử lý; pipeline bất đồng bộ bóc tách → chunking → embedding → vector DB | 02/11 – 15/11/2026 |
| 4 — Khai thác tài liệu bằng AI (RAG) | Tóm tắt, hỏi–đáp kèm trích dẫn để hạn chế "ảo giác"; trọng tâm, tối ưu tiếng Việt | 16/11 – 29/11/2026 |
| — | Tối ưu RAG tiếng Việt; khung đánh giá | 30/11 – 06/12/2026 |
| — | Tích hợp, hoàn thiện giao diện, đóng gói Docker, kiểm thử | 07/12 – 13/12/2026 |
| 5 — Dịch tài liệu (mở rộng) | Dịch đa ngôn ngữ, giữ định dạng (ưu tiên DOCX/TXT) | 14/12 – 31/12/2026, nếu còn thời gian |
| — | Viết báo cáo, chuẩn bị bảo vệ | 04/10 – 31/12/2026, song song |

**Giới hạn theo đề cương:** PDF dạng text, DOCX, TXT; không OCR ảnh/scan; sản phẩm ở mức **nguyên mẫu (prototype)** phục vụ minh họa và đánh giá, chưa triển khai quy mô sản xuất lớn.

### 3.2. Công nghệ: đề cương dự kiến và thực tế

| Hạng mục | Đề cương | Thực tế tại SHA cơ sở | Nguồn |
|---|---|---|---|
| Ngôn ngữ | TypeScript | TypeScript 6 | [overview mục 3](../project/overview-and-decisions.md#phiên-bản-thực-tế-khi-khởi-tạo) |
| Frontend | Next.js (React) | Next.js 16 App Router, React 19, Tailwind 4, shadcn/ui, TanStack Query, next-intl | D-06…D-08 |
| Backend | NestJS | NestJS 12 + Mongoose 9, class-validator, Swagger, helmet, throttler | D-05, D-09 |
| CSDL | MongoDB | MongoDB Atlas M0 (có thể đổi sang Mongo Docker qua `MONGODB_URI`) | D-03 |
| Tổ chức mã nguồn | — | Monorepo pnpm + Turborepo: `apps/api`, `apps/web`, `packages/shared` | D-01 |
| Xác thực & giao tiếp | JWT, REST, SSE | JWT access/refresh trong cookie httpOnly; REST `/api/v1`; SSE cho Chat | [module-1-auth §2](../design/module-1-auth.md#2-quyết-định-kỹ-thuật--lý-do), [module-2-chat §4.4](../design/module-2-chat.md#44-giao-thức-sse) |
| LLM | Qua API hoặc Ollama | `MockLlmProvider` trên `develop`; OpenAI Responses API trên PR #4 (chưa tích hợp); Ollama chưa làm | README mục 3 |
| Redis + BullMQ, MinIO, Qdrant, LangChain/LlamaIndex, embedding đa ngữ | Có | **Chưa dùng** — thuộc Module 3–4. Lưu tệp hiện là `LocalStorageProvider` (đầu chờ MinIO) | D-04, M1-07 |
| Docker, Docker Compose, Nginx | Có | **Chưa dùng** — chạy local; Next.js rewrites đóng vai trò proxy cùng origin (D-11) | D-04, D-11 |

Khi viết Word: chương Công nghệ trình bày **công nghệ đã dùng**; các công nghệ chưa dùng đưa vào thiết kế Module 3–4 (dự kiến) hoặc hướng phát triển.

## 4. Đối tượng sử dụng

| Tác nhân | Vai trò hệ thống | Mô tả |
|---|---|---|
| Nhân viên | `USER` | Hội thoại với trợ lý, quản lý hồ sơ và phiên đăng nhập của mình. Chỉ thấy dữ liệu của mình |
| Quản trị viên | `ADMIN` | Như nhân viên + quản lý tài khoản (tạo, sửa, đổi vai trò, khóa/mở, đặt lại mật khẩu). **Không** đọc được hội thoại của người khác |
| Khách (chưa đăng nhập) | — | Chỉ vào được trang đăng nhập; không có tự đăng ký (admin tạo tài khoản) |

Chi tiết quyền: [02 mục 3](02-requirements-and-design.md#3-tác-nhân-và-phân-quyền).

## 5. Đề xuất bố cục chương

**Tạm thời** — dựng theo quy định trình bày của Khoa CNTT (mục 8), chờ sinh viên/GVHD xác nhận (T2 trong [TL-004](../tasks/TL-004-thesis-source-pack.md#quyết-định-còn-mở)). Quy định chỉ bắt buộc phần đầu và phần cuối; số chương tùy đề tài.

| Phần | Nội dung đề xuất | Nguồn trong bộ |
|---|---|---|
| Lời cảm ơn | — | `CẦN BỔ SUNG` (sinh viên) |
| Mục lục; danh mục viết tắt, bảng, hình | Sinh ra từ Word | Danh mục hình: [04 mục 4](04-validation-and-results.md#4-danh-mục-hình) |
| **Mở đầu** | Lý do chọn đề tài; mục tiêu; đối tượng và phạm vi; phương pháp (phân tích yêu cầu → thiết kế → phát triển theo module, tích hợp qua review PR); cấu trúc báo cáo | Mục 1–4 ở trên |
| **Chương 1. Tổng quan và cơ sở lý thuyết** | 1.1 Bài toán trợ lý AI nội bộ; 1.2 LLM và kiến trúc Transformer; 1.3 RAG, embedding, CSDL vector (lý thuyết — nền cho Module 3–4); 1.4 Công nghệ web: Next.js, NestJS, MongoDB; 1.5 Xác thực JWT/phiên, SSE | Mục 7; `CẦN BỔ SUNG` khảo sát của sinh viên (G4) |
| **Chương 2. Phân tích yêu cầu và thiết kế hệ thống** | 2.1 Yêu cầu chức năng/phi chức năng; 2.2 Tác nhân, use case, ma trận quyền; 2.3 Kiến trúc tổng thể; 2.4 Thiết kế dữ liệu; 2.5 Thiết kế API; 2.6 Luồng xử lý tiêu biểu; 2.7 Thiết kế dự kiến Module 3–4 (đánh dấu rõ là dự kiến) | [02](02-requirements-and-design.md) |
| **Chương 3. Hiện thực hệ thống** | 3.1 Môi trường và cấu trúc mã nguồn; 3.2 Module 1; 3.3 Module 2 (gồm provider LLM); 3.4 Giao diện | `03-implementation.md` (SE-008) |
| **Chương 4. Kiểm thử và đánh giá** | 4.1 Phương pháp, môi trường, phiên bản; 4.2 Ca kiểm thử theo vai; 4.3 Kết quả và hình minh họa; 4.4 Đánh giá so với mục tiêu | [04](04-validation-and-results.md) |
| **Kết luận và kiến nghị** | Kết quả đạt được (chỉ phần đã kiểm chứng); hạn chế; hướng phát triển (Module 3–5, Docker, đánh giá RAG) | [04 mục 5–6](04-validation-and-results.md#5-hạn-chế) |
| Tài liệu tham khảo | Chỉ tài liệu được trích dẫn trong báo cáo | Mục 7 |
| Phụ lục | Hướng dẫn cài đặt, danh sách API, biến môi trường | [README.md gốc](../../README.md#chạy-dự-án), [02 mục 6](02-requirements-and-design.md#6-hợp-đồng-api) |

## 6. Nguồn sử dụng

### 6.1. Ngoài repo (trên máy sinh viên; không đưa vào repo)

| Nguồn | Vị trí | Ngày | Dùng cho | Ghi chú |
|---|---|---|---|---|
| Đề cương ĐATN | `OneDrive/Desktop/5250026_BuiVanDuong_LT_CNTT1_K29.1_Decuong DATN.docx` | 09/09/2026 16:29 | Mục 1–3 | Bản mới nhất trong 4 file đề cương tìm thấy (các bản cùng ngày: `Downloads/Decuong_DATN_TroLyAI_NoiBo.docx`, `… (1).docx`, `OneDrive/Desktop/5250026_BuiVanDuong.docx`). **Chưa xác nhận là bản đã duyệt** (T1). Có ô ký của Khoa/Bộ môn/GVHD, chưa thấy chữ ký trong file |
| Báo cáo công việc 27/10/2026 | `Downloads/Bùi Văn Dương_Tài liệu báo cáo công việc.docx` | 27/10/2026 | Bối cảnh tiến độ, Hình 1–14 | Đã audit: [preview-progress-review.md](../project/preview-progress-review.md); mức "80%" của Module 3–4 không dùng |
| Quy định và hướng dẫn trình bày ĐATN — Khoa CNTT, ĐH GTVT | `Downloads/Quy dinh va huong dan trinh bay DATN .signed.pdf` | Ký số 23/09/2021 | Mục 5, 8 | Bản PDF ký số |
| Mẫu Word của trường | — | — | — | **Không tìm thấy**; quy định trên có mẫu bìa và quy cách style, dùng thay mẫu |

### 6.2. Trong repo

| Nguồn | Nội dung |
|---|---|
| [overview-and-decisions.md](../project/overview-and-decisions.md) | Quyết định kiến trúc D-01…D-11, sự cố môi trường |
| [context.md](../project/context.md) | Phạm vi, trạng thái module, bản đồ mã nguồn |
| [module-1-auth.md](../design/module-1-auth.md), [module-2-chat.md](../design/module-2-chat.md) | Function Spec + Basic Design Module 1–2 |
| [access-control.md](../design/access-control.md), [ui-release-standards.md](../design/ui-release-standards.md) | Ma trận quyền đã xác minh; chuẩn UI và tiêu chí phát hành |
| [preview-progress-review.md](../project/preview-progress-review.md) | Audit so với báo cáo 27/10 |
| Hồ sơ task [docs/tasks/](../tasks/README.md) | Bằng chứng kiểm thử theo vòng: SE-001, SE-002, SE-007 (PR #4), TL-003 |
| PR #1–#4 trên GitHub | Diff, SHA |

## 7. Tài liệu tham khảo đề xuất

Dùng cho Chương 1 và các nhận định công nghệ. Ngày truy cập: 15/11/2026. Người viết Word chỉ đưa vào danh mục những tài liệu thực sự được trích dẫn và mở lại link trước khi nộp.

**Bài báo khoa học**
1. A. Vaswani et al., "Attention Is All You Need," *NeurIPS*, 2017. arXiv:1706.03762. https://arxiv.org/abs/1706.03762 — kiến trúc Transformer.
2. T. Brown et al., "Language Models are Few-Shot Learners," *NeurIPS*, 2020. arXiv:2005.14165. https://arxiv.org/abs/2005.14165 — LLM quy mô lớn.
3. P. Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," *NeurIPS*, 2020. arXiv:2005.11401. https://arxiv.org/abs/2005.11401 — RAG (nền cho Module 4).

**Chuẩn và khuyến nghị bảo mật**
4. M. Jones, J. Bradley, N. Sakimura, "JSON Web Token (JWT)," RFC 7519, IETF, 2015. https://datatracker.ietf.org/doc/html/rfc7519
5. D. Hardt, "The OAuth 2.0 Authorization Framework," RFC 6749, IETF, 2012 (mục 1.5 Refresh Token). https://datatracker.ietf.org/doc/html/rfc6749
6. T. Lodderstedt et al., "Best Current Practice for OAuth 2.0 Security," RFC 9700, IETF, 2025 (refresh token rotation). https://datatracker.ietf.org/doc/html/rfc9700
7. A. Barth, "HTTP State Management Mechanism," RFC 6265, IETF, 2011 (cookie `HttpOnly`). https://datatracker.ietf.org/doc/html/rfc6265
8. OWASP, "Session Management Cheat Sheet." https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
9. OWASP, "Password Storage Cheat Sheet" (bcrypt). https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
10. WHATWG, "HTML Living Standard — Server-sent events." https://html.spec.whatwg.org/multipage/server-sent-events.html

**Tài liệu công nghệ**
11. NestJS Documentation. https://docs.nestjs.com/
12. Next.js Documentation. https://nextjs.org/docs
13. MongoDB Manual — TTL Indexes. https://www.mongodb.com/docs/manual/core/index-ttl/
14. Mongoose Documentation. https://mongoosejs.com/docs/
15. pnpm Workspaces. https://pnpm.io/workspaces · Turborepo Documentation. https://turborepo.com/docs
16. OpenAI API Reference — Responses. https://platform.openai.com/docs/api-reference/responses (chỉ trích khi trình bày phần PR #4 / SE-007)

`CẦN BỔ SUNG`: tài liệu khảo sát của sinh viên về embedding đa ngữ (bge-m3, multilingual-e5), Qdrant, LangChain/LlamaIndex — đề cương nhắc tới nhưng repo chưa có nguồn khảo sát (G4).

## 8. Quy định trình bày của Khoa (tóm tắt để dựng Word)

Nguồn: quy định PDF ở mục 6.1. Tóm tắt để người viết Word dựng style; đối chiếu bản gốc khi nộp.

- **Bố cục:** Lời cảm ơn → Mục lục (bắt buộc) → Danh mục viết tắt / bảng / hình (nếu có) → Mở đầu (lý do chọn đề tài, nội dung, phương pháp, cấu trúc) → Chương 1…n → Kết luận và kiến nghị → Danh mục tài liệu tham khảo (chỉ tài liệu được trích dẫn) → Phụ lục (nếu có).
- **Trang:** A4; lề trên 2,5 cm, dưới 2,5 cm, trái 3 cm, phải 2 cm; số trang ở giữa, phía trên.
- **Đề mục:** chương sang trang mới, Heading 1 Times New Roman 18 pt đậm, căn giữa (trước 0, sau 12 pt); mục `n.x` Heading 2 16 pt đậm, căn trái (trước/sau 6 pt); tiểu mục `n.x.y` Heading 3 14 pt đậm. Chỉ chia tiểu mục khi có từ 2 tiểu mục trở lên.
- **Đoạn văn:** Times New Roman 13 pt, căn đều hai bên, thụt đầu dòng 1 cm, giãn dòng 1,2.
- **Bảng, hình:** đánh số theo chương (Hình 3.2, Bảng 3.1); tên bảng ở **trên**, tên hình ở **dưới**; hình/bảng lấy từ nguồn khác ghi "Nguồn: …" và có trong danh mục tài liệu tham khảo. **Hình thiết kế phải tự vẽ bằng phần mềm thiết kế, file hình nộp kèm; cấm sao chép hình thiết kế từ tài liệu khác** (xem G9).
- **Viết tắt:** chỉ viết tắt thuật ngữ dùng nhiều lần; lần đầu viết đầy đủ kèm viết tắt trong ngoặc; nhiều viết tắt thì có danh mục xếp ABC.
- **Bìa:** mẫu bìa chính và bìa phụ (tên trường, khoa, "ĐỒ ÁN TỐT NGHIỆP", tên đề tài, GVHD, sinh viên, MSV, lớp, khóa, "Hà Nội – năm").
