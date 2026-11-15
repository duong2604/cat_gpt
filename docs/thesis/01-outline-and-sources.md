# 01 — Đề tài, phạm vi, bố cục chương và nguồn

Cơ sở: `origin/develop` @ `6ed0fbc` (15/11/2026) · Người lập: TL · Trạng thái: **Chờ Review (vòng 2, 15/11/2026)** — đã đọc đúng hai file khách hàng chỉ định
Nguồn chính: **đề cương do khách hàng chỉ định ngày 15/11/2026** — `D:\workspace\5250026_BuiVanDuong_LT_CNTT1_K29.1_Decuong DATN.docx` (sửa lần cuối 30/09/2026), bản chép: [sources/de-cuong-datn.md](sources/de-cuong-datn.md); quy định trình bày: [sources/quy-dinh-trinh-bay-datn.md](sources/quy-dinh-trinh-bay-datn.md). Những gì đề cương *dự kiến* khác với những gì *đã hiện thực* được ghi rõ ở mục 3.2.

## 1. Đề tài

| Mục | Nội dung (theo đề cương) |
|---|---|
| Tên đề tài | **Xây dựng hệ thống trợ lý AI nội bộ hỗ trợ hội thoại và khai thác thông tin từ tài liệu CAT GPT** (nguyên văn đề cương 30/09/2026). Lưu ý: bản đề cương 09/09/2026 và [overview-and-decisions.md](../project/overview-and-decisions.md) còn tên cũ có thêm "sử dụng mô hình ngôn ngữ lớn (LLM)" — báo cáo dùng tên trong đề cương được chỉ định |
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
| 1 — Xác thực & quản lý người dùng (Trọng tâm) | Đăng nhập/đăng xuất, thông tin cá nhân, đổi mật khẩu, quản lý phiên; admin quản lý tài khoản, khóa/mở khóa, phân quyền | 04/10 – 18/10/2026 |
| 2 — Trợ lý hội thoại (AI Chat) (Trọng tâm) | Tạo và quản lý hội thoại (đổi tên, xóa), gửi/nhận tin nhắn, streaming, lưu lịch sử | 19/10 – 01/11/2026 |
| 3 — Quản lý tài liệu (Trọng tâm) | Tải lên/xuống, metadata, tìm kiếm, xóa, trạng thái xử lý; pipeline bất đồng bộ bóc tách → chunking → embedding → vector DB | 02/11 – 15/11/2026 |
| 4 — Khai thác tài liệu bằng AI (RAG) (Trọng tâm) | Tóm tắt, hỏi–đáp kèm trích dẫn để hạn chế "ảo giác"; trọng tâm, tối ưu tiếng Việt | 16/11 – 29/11/2026 |
| — | Tối ưu RAG tiếng Việt; khung đánh giá | 30/11 – 06/12/2026 |
| — | Tích hợp, hoàn thiện giao diện, đóng gói và kiểm thử (ghi chú: Tối ưu) | 07/12 – 13/12/2026 |
| 5 — Dịch tài liệu (mở rộng) | Dịch đa ngôn ngữ, giữ định dạng (ưu tiên DOCX/TXT) | 14/12 – 31/12/2026 — **ngoài phạm vi cam kết** |
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

**Đã chốt 15/11/2026 (CTO):** bố cục 4 chương dưới đây (T2); Module 3–4 mô tả là **thiết kế và giao diện minh họa** (T3) — [TL-004](../tasks/TL-004-thesis-source-pack.md#quyết-định-còn-mở). Dựng theo quy định trình bày của Khoa CNTT (mục 8); quy định chỉ bắt buộc phần đầu và phần cuối.

| Phần | Nội dung đề xuất | Nguồn trong bộ |
|---|---|---|
| Lời cảm ơn | — | `CẦN BỔ SUNG` (sinh viên) |
| Mục lục; danh mục viết tắt, bảng, hình | Sinh ra từ Word | Danh mục hình: [04 mục 4](04-validation-and-results.md#4-danh-mục-hình) |
| **Mở đầu** | Lý do chọn đề tài; mục tiêu; đối tượng và phạm vi; phương pháp (phân tích yêu cầu → thiết kế → phát triển theo module, tích hợp qua review PR); cấu trúc báo cáo | Mục 1–4 ở trên |
| **Chương 1. Tổng quan và cơ sở lý thuyết** | 1.1 Bài toán trợ lý AI nội bộ; 1.2 LLM và kiến trúc Transformer; 1.3 RAG, embedding, CSDL vector (lý thuyết — nền cho Module 3–4); 1.4 Công nghệ web: Next.js, NestJS, MongoDB; 1.5 Xác thực JWT/phiên, SSE | Mục 7; `CẦN BỔ SUNG` khảo sát của sinh viên (G4) |
| **Chương 2. Phân tích yêu cầu và thiết kế hệ thống** | 2.1 Yêu cầu chức năng/phi chức năng; 2.2 Tác nhân, use case, ma trận quyền; 2.3 Kiến trúc tổng thể; 2.4 Thiết kế dữ liệu; 2.5 Thiết kế API; 2.6 Luồng xử lý tiêu biểu; 2.7 Module 3–4: thiết kế và giao diện minh họa (không trình bày là đã hiện thực) | [02](02-requirements-and-design.md) |
| **Chương 3. Hiện thực hệ thống** | 3.1 Môi trường và cấu trúc mã nguồn; 3.2 Module 1; 3.3 Module 2 (gồm provider LLM); 3.4 Giao diện | `03-implementation.md` (SE-008) |
| **Chương 4. Kiểm thử và đánh giá** | 4.1 Phương pháp, môi trường, phiên bản; 4.2 Ca kiểm thử theo vai; 4.3 Kết quả và hình minh họa; 4.4 Đánh giá so với mục tiêu | [04](04-validation-and-results.md) |
| **Kết luận và kiến nghị** | Kết quả đạt được (chỉ phần đã kiểm chứng); hạn chế; hướng phát triển (Module 3–5, Docker, đánh giá RAG) | [04 mục 5–6](04-validation-and-results.md#5-hạn-chế) |
| Tài liệu tham khảo | Chỉ tài liệu được trích dẫn trong báo cáo | Mục 7 |
| Phụ lục | Hướng dẫn cài đặt, danh sách API, biến môi trường | [README.md gốc](../../README.md#chạy-dự-án), [02 mục 6](02-requirements-and-design.md#6-hợp-đồng-api) |

**Quy định áp dụng theo phần** (mã Q ở mục 8):

| Phần | Quy định bắt buộc |
|---|---|
| Bìa, bìa phụ | Q15 |
| Lời cảm ơn, Mục lục, danh mục viết tắt/bảng/hình | Q1 (Mục lục bắt buộc; danh mục khi có), Q13 (danh mục viết tắt xếp ABC) |
| Mở đầu | Q1 (lý do chọn đề tài, nội dung giải quyết, phương pháp, cấu trúc); Q7 |
| Chương 1–4 | Q3–Q7 (trang, heading, đoạn văn); Q8–Q10 (đánh số và chú thích hình/bảng, ghi "Nguồn: …" khi lấy từ nguồn khác); Q13 |
| Chương 2 (sơ đồ thiết kế) | **Q12**: vẽ bằng phần mềm thiết kế, nộp file nguồn trên CD — danh mục sơ đồ [02 mục 9](02-requirements-and-design.md#9-sơ-đồ-file-nguồn-hiện-có-và-việc-cần-xuất--vẽ-lại) |
| Chương 4 (ảnh chụp màn hình) | Q8, Q9 (tên hình phía dưới, số theo chương); ảnh do hệ thống tự chụp, không phải hình sao chép |
| Kết luận và kiến nghị | Q1; Q7 |
| Tài liệu tham khảo | Q11 (chỉ tài liệu được trích dẫn); kiểu trích dẫn chọn thống nhất (mục 8, phần "Không có trong quy định") |
| Phụ lục | Q14 |

## 6. Nguồn sử dụng

### 6.1. Ngoài repo (bản gốc trên máy; bản chép đã lược thông tin cá nhân trong [sources/](sources/README.md))

| Nguồn | Vị trí | Ngày | Dùng cho | Ghi chú |
|---|---|---|---|---|
| Đề cương ĐATN — **bản khách hàng chỉ định** | `D:\workspace\5250026_BuiVanDuong_LT_CNTT1_K29.1_Decuong DATN.docx` (MD5 `cf7b9248…`) | Đề ngày 09/09/2026; file sửa lần cuối 30/09/2026 18:53 | Mục 1–3 | Bản chép: [sources/de-cuong-datn.md](sources/de-cuong-datn.md). **Căn cứ phê duyệt: không có trong file** — 4 ô ký trống, không chữ ký số/nhận xét → `CẦN BỔ SUNG` (sinh viên cung cấp bản ký hoặc xác nhận GVHD/Khoa). Các bản cũ ngày 09/09 (OneDrive, Downloads) không dùng |
| Báo cáo công việc 27/10/2026 | `Downloads/Bùi Văn Dương_Tài liệu báo cáo công việc.docx` | 27/10/2026 | Bối cảnh tiến độ, Hình 1–14 | Đã audit: [preview-progress-review.md](../project/preview-progress-review.md); mức "80%" của Module 3–4 không dùng |
| Quy định và hướng dẫn trình bày ĐATN — Khoa CNTT, ĐH GTVT | `C:\Users\duong\Downloads\Quy dinh va huong dan trinh bay DATN .signed.pdf` (MD5 `c972b9dc…`) | Ký số 23/09/2021 | Mục 5, 8 | Bản chép theo trang: [sources/quy-dinh-trinh-bay-datn.md](sources/quy-dinh-trinh-bay-datn.md) |
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

Nguồn cho **Chương 1** và các nhận định công nghệ ở Chương 2–3. Ưu tiên tài liệu gốc: bài báo (arXiv/hội nghị), chuẩn IETF/WHATWG, tài liệu chính thức của nhà phát triển. Kiểm tra ngày 15/11/2026: tiêu đề, tác giả đầu và ngày của mọi bài arXiv đối chiếu trực tiếp với trang arXiv; link tài liệu kỹ thuật kiểm tra mã HTTP (cột "KT"). Người viết Word chỉ đưa vào danh mục tài liệu **thực sự được trích dẫn** (quy định Khoa), định dạng trích dẫn thống nhất (đề xuất IEEE, đánh số theo thứ tự xuất hiện).

Cột **Luận điểm** là điều nguồn đó hỗ trợ — chỉ dùng nguồn cho đúng luận điểm này. KT: `200` = mở được; `chặn` = trang chặn truy cập tự động, mở bằng trình duyệt khi trích.

### 7.1. Mô hình ngôn ngữ lớn — mục 1.2

| # | Tác giả / tổ chức | Tiêu đề | Năm / phiên bản | Đường dẫn | Luận điểm | KT |
|---|---|---|---|---|---|---|
| R1 | A. Vaswani et al. | Attention Is All You Need | NeurIPS 2017; arXiv 12/06/2017 | https://arxiv.org/abs/1706.03762 | Kiến trúc Transformer dựa hoàn toàn trên cơ chế attention — nền của các LLM hiện nay | arXiv ✔ |
| R2 | T. B. Brown et al. | Language Models are Few-Shot Learners | NeurIPS 2020; arXiv 28/05/2020 | https://arxiv.org/abs/2005.14165 | Mô hình ngôn ngữ quy mô lớn (GPT-3) làm được nhiều tác vụ chỉ với chỉ dẫn và vài ví dụ trong prompt, không cần huấn luyện lại | arXiv ✔ |
| R3 | L. Ouyang et al. | Training language models to follow instructions with human feedback | NeurIPS 2022; arXiv 04/03/2022 | https://arxiv.org/abs/2203.02155 | Tinh chỉnh theo chỉ dẫn + phản hồi người (RLHF) giúp LLM làm theo yêu cầu người dùng — cơ sở của trợ lý hội thoại; giải thích vai trò *system prompt* | arXiv ✔ |
| R4 | Z. Ji et al. | Survey of Hallucination in Natural Language Generation | ACM Computing Surveys 2023; arXiv 08/02/2022 | https://arxiv.org/abs/2202.03629 | Hiện tượng "ảo giác": mô hình sinh nội dung trôi chảy nhưng sai/không có căn cứ — động lực cho RAG và trích dẫn nguồn (đề cương Module 4) | arXiv ✔ |
| R5 | D. Q. Nguyen, A. T. Nguyen | PhoBERT: Pre-trained language models for Vietnamese | Findings of EMNLP 2020; arXiv 2003.00744 | https://arxiv.org/abs/2003.00744 | Đặc thù xử lý tiếng Việt (tách từ, mô hình tiền huấn luyện riêng) — dùng khi nói về "tối ưu cho tiếng Việt" | arXiv ✔ |

### 7.2. RAG, embedding và cơ sở dữ liệu vector — mục 1.3 (nền lý thuyết cho Module 3–4, thiết kế dự kiến)

| # | Tác giả / tổ chức | Tiêu đề | Năm / phiên bản | Đường dẫn | Luận điểm | KT |
|---|---|---|---|---|---|---|
| R6 | P. Lewis et al. | Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks | NeurIPS 2020; arXiv 22/05/2020 | https://arxiv.org/abs/2005.11401 | Định nghĩa RAG: kết hợp bộ truy hồi văn bản với mô hình sinh để câu trả lời dựa trên tri thức bên ngoài, cập nhật được mà không huấn luyện lại | arXiv ✔ |
| R7 | Y. Gao et al. | Retrieval-Augmented Generation for Large Language Models: A Survey | arXiv 18/12/2023 | https://arxiv.org/abs/2312.10997 | Tổng quan quy trình RAG (đánh chỉ mục → truy hồi → sinh), các biến thể và phương pháp đánh giá — khung trình bày mục 1.3 | arXiv ✔ |
| R8 | V. Karpukhin et al. | Dense Passage Retrieval for Open-Domain Question Answering | EMNLP 2020; arXiv 10/04/2020 | https://arxiv.org/abs/2004.04906 | Truy hồi dày (dense) bằng vector nhúng vượt truy hồi theo từ khóa BM25 trên các bộ hỏi–đáp mở | arXiv ✔ |
| R9 | N. Reimers, I. Gurevych | Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks | EMNLP-IJCNLP 2019; arXiv 27/08/2019 | https://arxiv.org/abs/1908.10084 | Biểu diễn câu thành vector để so sánh ngữ nghĩa bằng độ tương đồng cosine — khái niệm *embedding* | arXiv ✔ |
| R10 | J. Chen et al. | M3-Embedding: Multi-Linguality, Multi-Functionality, Multi-Granularity Text Embeddings Through Self-Knowledge Distillation | arXiv 05/02/2024 | https://arxiv.org/abs/2402.03216 | Mô hình **bge-m3** (đề cương nêu): embedding đa ngôn ngữ, văn bản dài | arXiv ✔ |
| R11 | L. Wang et al. | Multilingual E5 Text Embeddings: A Technical Report | arXiv 08/02/2024 | https://arxiv.org/abs/2402.05672 | Mô hình **multilingual-e5** (đề cương nêu) | arXiv ✔ |
| R12 | Yu. A. Malkov, D. A. Yashunin | Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs | IEEE TPAMI 2020; arXiv 30/03/2016 | https://arxiv.org/abs/1603.09320 | Tìm kiếm láng giềng gần đúng HNSW — thuật toán chỉ mục phổ biến của CSDL vector | arXiv ✔ |
| R13 | S. Robertson, H. Zaragoza | The Probabilistic Relevance Framework: BM25 and Beyond | Foundations and Trends in IR, 2009 | https://doi.org/10.1561/1500000019 | Truy hồi theo từ khóa BM25 — mốc so sánh với truy hồi vector | chặn |
| R14 | C. D. Manning, P. Raghavan, H. Schütze | Introduction to Information Retrieval | Cambridge University Press, 2008 | https://nlp.stanford.edu/IR-book/ | Chỉ số đánh giá truy hồi (precision, recall…) — nền cho khung đánh giá đề cương nêu | hết thời gian chờ — mở lại |
| R15 | S. Es et al. | Ragas: Automated Evaluation of Retrieval Augmented Generation | arXiv 26/09/2023 | https://arxiv.org/abs/2309.15217 | Đánh giá chất lượng câu trả lời RAG (độ trung thực với ngữ cảnh, độ liên quan) | arXiv ✔ |
| R16 | N. F. Liu et al. | Lost in the Middle: How Language Models Use Long Contexts | TACL 2024; arXiv 06/07/2023 | https://arxiv.org/abs/2307.03172 | LLM dùng thông tin giữa ngữ cảnh dài kém hơn đầu/cuối — lý do giới hạn và chọn lọc đoạn truy hồi / lịch sử hội thoại | arXiv ✔ |
| R17 | Qdrant | Qdrant Documentation | truy cập 15/11/2026 | https://qdrant.tech/documentation/ | CSDL vector đề cương chọn | 200 |
| R18 | LangChain | Text splitters (concepts) | truy cập 15/11/2026 | https://js.langchain.com/docs/concepts/text_splitters | Chia đoạn (chunking) văn bản trước khi nhúng | 200 |
| R19 | LlamaIndex | LlamaIndex Documentation | truy cập 15/11/2026 | https://docs.llamaindex.ai/ | Thư viện RAG thay thế (đề cương nêu "LangChain hoặc LlamaIndex") | 200 |
| R20 | Ollama | ollama/ollama (GitHub) | truy cập 15/11/2026 | https://github.com/ollama/ollama | Chạy LLM nội bộ — phương án on-premise đề cương nêu | 200 |

### 7.3. Công nghệ web và hệ thống — mục 1.4

| # | Tác giả / tổ chức | Tiêu đề | Năm / phiên bản | Đường dẫn | Luận điểm | KT |
|---|---|---|---|---|---|---|
| R21 | R. T. Fielding | Architectural Styles and the Design of Network-based Software Architectures (Ch. 5 — REST) | Luận án TS, UC Irvine, 2000 | https://ics.uci.edu/~fielding/pubs/dissertation/top.htm | Kiểu kiến trúc REST cho API | 200 |
| R22 | NestJS | NestJS Documentation (Modules, Guards) | v12 dùng trong dự án; truy cập 15/11/2026 | https://docs.nestjs.com/ · https://docs.nestjs.com/guards | Tổ chức backend theo module; guard kiểm tra quyền trước khi vào controller | 200 |
| R23 | Vercel | Next.js Documentation (App Router; `rewrites`) | v16 dùng trong dự án; truy cập 15/11/2026 | https://nextjs.org/docs · https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites | Định tuyến App Router; chuyển `/api/*` sang backend cùng origin (D-11) | 200 |
| R24 | MongoDB | MongoDB Manual — Documents; TTL Indexes | truy cập 15/11/2026 | https://www.mongodb.com/docs/manual/core/document/ · https://www.mongodb.com/docs/manual/core/index-ttl/ | Mô hình tài liệu; TTL index tự xóa phiên hết hạn | 200 |
| R25 | Mongoose | Mongoose Documentation | v9 dùng trong dự án | https://mongoosejs.com/docs/ | ODM: schema, index | 200 |
| R26 | pnpm; Vercel | pnpm Workspaces; Turborepo Documentation | truy cập 15/11/2026 | https://pnpm.io/workspaces · https://turborepo.com/docs | Monorepo dùng chung gói `packages/shared` (D-01) | 200 |
| R27 | Redis; BullMQ; MinIO; Docker | Redis Docs; BullMQ Docs; MinIO Docs; Docker Compose | truy cập 15/11/2026 | https://redis.io/docs/latest/ · https://docs.bullmq.io/ · https://min.io/docs/minio/linux/index.html · https://docs.docker.com/compose/ | Công nghệ đề cương dự kiến cho Module 3 và triển khai — **chưa dùng**, chỉ trích ở thiết kế dự kiến/hướng phát triển | 200 |
| R28 | OpenAI | API Reference — Responses | truy cập 15/11/2026 | https://platform.openai.com/docs/api-reference/responses | Gọi LLM qua API dạng streaming (PR #4) | chặn |

### 7.4. Xác thực, bảo mật và truyền dữ liệu thời gian thực — mục 1.5

| # | Tác giả / tổ chức | Tiêu đề | Năm / phiên bản | Đường dẫn | Luận điểm | KT |
|---|---|---|---|---|---|---|
| R29 | M. Jones, J. Bradley, N. Sakimura (IETF) | JSON Web Token (JWT), RFC 7519 | 05/2015 | https://datatracker.ietf.org/doc/html/rfc7519 | Cấu trúc và chữ ký của access token | 200 |
| R30 | D. Hardt (IETF) | The OAuth 2.0 Authorization Framework, RFC 6749 (mục 1.5 Refresh Token) | 10/2012 | https://datatracker.ietf.org/doc/html/rfc6749 | Khái niệm refresh token dùng để lấy access token mới | 200 |
| R31 | T. Lodderstedt et al. (IETF) | Best Current Practice for OAuth 2.0 Security, RFC 9700 | 01/2025 | https://datatracker.ietf.org/doc/html/rfc9700 | Xoay vòng refresh token (rotation) và phát hiện token bị dùng lại | 200, đúng tiêu đề |
| R32 | A. Barth (IETF) | HTTP State Management Mechanism, RFC 6265 | 04/2011 | https://datatracker.ietf.org/doc/html/rfc6265 | Cookie `HttpOnly` không đọc được từ script — giảm rủi ro XSS lấy token | 200 |
| R33 | OWASP | Session Management Cheat Sheet | truy cập 15/11/2026 | https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html | Quản lý phiên phía máy chủ, thu hồi phiên | 200 |
| R34 | OWASP | Password Storage Cheat Sheet | truy cập 15/11/2026 | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html | Lưu mật khẩu bằng hàm băm chậm (bcrypt) | 200 |
| R35 | WHATWG | HTML Living Standard — Server-sent events | truy cập 15/11/2026 | https://html.spec.whatwg.org/multipage/server-sent-events.html | Định dạng luồng `text/event-stream` (event/data, comment heartbeat) dùng cho streaming câu trả lời | 200 |

### 7.5. Khảo sát cá nhân — sinh viên cần bổ sung

Bộ nguồn **không có** các nội dung sau; người viết Word để chỗ `[CẦN SINH VIÊN BỔ SUNG: …]`, không tự viết:

| # | Nội dung cần bổ sung | Dùng ở | Gợi ý dạng nguồn |
|---|---|---|---|
| S1 | Hiện trạng tra cứu tài liệu nội bộ ở đơn vị/bối cảnh đề tài (ai tra cứu, tài liệu loại gì, khó khăn) | Mở đầu (lý do chọn đề tài), 1.1 | Quan sát/phỏng vấn của sinh viên; nếu có số liệu thì ghi cách thu thập |
| S2 | So sánh với giải pháp sẵn có (chatbot công cộng, sản phẩm trợ lý doanh nghiệp) và lý do cần hệ thống nội bộ | 1.1 | Tài liệu chính thức của sản phẩm được so sánh — sinh viên chọn và trích |
| S3 | Kết quả khảo sát công nghệ giai đoạn 21–26/09/2026 (báo cáo 27/10 ghi "Hoàn thành", repo không có bản ghi): tiêu chí và lý do chọn Next.js, NestJS, MongoDB | 1.4, 2.3 | Ghi chép của sinh viên; quyết định D-01…D-11 trong repo là phần đã có |
| S4 | Tiêu chí chọn nhà cung cấp LLM (API so với chạy nội bộ: chi phí, quyền riêng tư dữ liệu, chất lượng tiếng Việt). Repo chỉ có quyết định dùng OpenAI cho PR #4, chưa có bảng so sánh | 1.2, 3.3 | Bảng so sánh của sinh viên; R20, R28 |
| S5 | So sánh mô hình embedding cho tiếng Việt — đề cương cam kết, **chưa có thực nghiệm**; chỉ được viết như kế hoạch | 1.3, hướng phát triển | Sau khi có Module 4; R10, R11, R15 |

## 8. Quy định trình bày của Khoa (áp dụng khi dựng Word)

Nguồn: [bản chép quy định](sources/quy-dinh-trinh-bay-datn.md) (PDF Khoa CNTT, ĐH GTVT, ký số 23/09/2021). Ký hiệu **QĐ tr. n §x** = trang n, mục x của PDF. Người viết Word đối chiếu bản gốc khi nộp.

| # | Quy định | Nội dung áp dụng | Dẫn nguồn |
|---|---|---|---|
| Q1 | Cấu trúc báo cáo | Lời cảm ơn → Mục lục (**bắt buộc**) → Danh mục từ viết tắt / bảng biểu / hình ảnh (khi có) → Mở đầu (lý do chọn đề tài, nội dung giải quyết, phương pháp, cấu trúc đồ án) → Chương 1…n (số chương tùy đề tài) → Kết luận và kiến nghị → Danh mục tài liệu tham khảo → Phụ lục (nếu có) | QĐ tr. 1 §1 |
| Q2 | Yêu cầu chung | Ngắn gọn, rõ ràng, mạch lạc; đánh số trang, bảng biểu, hình vẽ, đồ thị; in A4, bìa mềm, có trang bìa phụ | QĐ tr. 1 §2 |
| Q3 | Khổ giấy, lề, số trang | A4; lề trên 2,5 cm, dưới 2,5 cm, trái 3 cm, phải 2 cm; số trang ở **giữa, phía trên** đầu trang | QĐ tr. 1–2 §2.1 |
| Q4 | Heading 1 (chương) | Chương bắt đầu trang mới, đánh số 1, 2, 3…; Times New Roman 18 pt, đậm, Before 0 pt, After 12 pt, căn giữa | QĐ tr. 2 §2.2 |
| Q5 | Heading 2 (mục `n.x`) | Times New Roman 16 pt, đậm, Before/After 6 pt, căn trái, không thụt đầu dòng | QĐ tr. 2 §2.2 |
| Q6 | Heading 3 (tiểu mục `n.x.y`) | Times New Roman 14 pt, đậm, Before/After 6 pt, căn trái, không thụt; **chỉ chia tiểu mục khi mục có hơn 1 tiểu mục** | QĐ tr. 2 §2.2 |
| Q7 | Style Normal (đoạn văn) | Mọi đoạn cùng một style: căn đều hai bên, dòng đầu thụt 1 cm, Times New Roman 13 pt, giãn dòng 1,2 lines | QĐ tr. 2 §2.3 |
| Q8 | Đánh số bảng, hình, phương trình | Gắn số chương: Hình 1.4 = hình thứ 4 của Chương 1; Bảng 3.1 = bảng thứ 1 của Chương 3 | QĐ tr. 2 §2.4 |
| Q9 | Vị trí tên bảng, hình | Tên bảng **phía trên** bảng; tên hình **phía dưới** hình (ví dụ "Bảng 3.1. Bảng nhà xuất bản.", "Hình 3.2. Sơ đồ use case tổng quát."); bảng/đồ thị ngắn đặt liền đoạn nhắc tới lần đầu; bảng dài để trang riêng nhưng ngay sau đoạn nhắc tới | QĐ tr. 2–3 §2.4 |
| Q10 | Trích dẫn nguồn hình/bảng | Đồ thị, bảng lấy từ nguồn khác ghi đầy đủ "Nguồn: …"; nguồn đó phải có chính xác trong danh mục tài liệu tham khảo | QĐ tr. 2 §2.4 |
| Q11 | Danh mục tài liệu tham khảo | Chỉ gồm tài liệu được trích dẫn, sử dụng và đề cập để bàn luận trong đồ án | QĐ tr. 1 §1 |
| Q12 | Hình thiết kế và file nguồn sơ đồ | Hình thiết kế **vẽ bằng phần mềm thiết kế**; **file hình vẽ ghi vào CD nộp cùng đồ án**; nghiêm cấm dùng hình thiết kế sao chép từ tài liệu khác | QĐ tr. 2 §2.4 (Lưu ý) |
| Q13 | Viết tắt | Chỉ viết tắt thuật ngữ dùng nhiều lần; không viết tắt cụm dài, mệnh đề, cụm ít dùng; lần đầu viết đầy đủ kèm viết tắt trong ngoặc đơn; nhiều viết tắt thì có danh mục xếp ABC ở đầu đồ án | QĐ tr. 3 §2.5 |
| Q14 | Phụ lục | Nội dung minh họa/bổ sung: số liệu, mẫu biểu, tranh ảnh | QĐ tr. 3 §2.6 |
| Q15 | Bìa chính, bìa phụ | Khổ 210 × 297 mm; các dòng: trường, khoa, "ĐỒ ÁN TỐT NGHIỆP", "ĐỀ TÀI", tên đề tài, GVHD, sinh viên, MSV, lớp, khóa, "Hà Nội – 20.." | QĐ tr. 4 (bìa), tr. 5 (bìa phụ) |

**Bố cục 4 chương đã chốt phù hợp quy định:** Q1 để số chương tùy đề tài và chỉ bắt buộc các phần đầu/cuối; mục 5 có đủ Mở đầu, Chương 1–4, Kết luận và kiến nghị, Tài liệu tham khảo, Phụ lục.

**Không có trong quy định** (người viết Word tự chọn, thống nhất toàn bài; ghi lựa chọn vào task viết Word): kiểu trích dẫn trong văn bản và định dạng danh mục tài liệu tham khảo (đề xuất IEEE, đánh số [n]); style chú thích hình/bảng (cỡ chữ, căn); cách đánh số trang phần đầu (La Mã hay Ả Rập); trình bày đoạn mã nguồn.
