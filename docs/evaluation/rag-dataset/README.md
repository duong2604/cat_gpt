# Bộ dữ liệu đánh giá RAG tiếng Việt (TL-009)

Bộ dữ liệu cho [TL-009](../../tasks/TL-009-rag-evaluation-dataset.md). Script chạy đánh giá thuộc [SE-017](../../tasks/SE-017-rag-evaluation-script.md). Phương án so sánh mô hình: **A** (CTO chọn 18/11/2026) — `text-embedding-3-small` và `text-embedding-3-large`. Chưa chạy `-large` cho tới khi xác nhận quyền API.

## Tài liệu (`docs/`)

| Tệp | Nguồn | Giấy phép | Phiên bản | Số ký tự | Số đoạn |
|---|---|---|---|---|---|
| `wiki-pho.txt` | Wikipedia tiếng Việt — [Phở](https://vi.wikipedia.org/wiki/Ph%E1%BB%9F) | CC BY-SA 4.0 | revid 75647145 | 24.763 | 38 |
| `wiki-vinh-ha-long.txt` | Wikipedia tiếng Việt — [Vịnh Hạ Long](https://vi.wikipedia.org/wiki/V%E1%BB%8Bnh_H%E1%BA%A1_Long) | CC BY-SA 4.0 | revid 75723561 | 53.087 | 94 |
| `wiki-ao-dai.txt` | Wikipedia tiếng Việt — [Áo dài](https://vi.wikipedia.org/wiki/%C3%81o_d%C3%A0i) | CC BY-SA 4.0 | revid 75565615 | 18.627 | 32 |
| `wiki-dong-bang-song-cuu-long.txt` | Wikipedia tiếng Việt — [Đồng bằng sông Cửu Long](https://vi.wikipedia.org/wiki/%C4%90%E1%BB%93ng_b%E1%BA%B1ng_s%C3%B4ng_C%E1%BB%ADu_Long) | CC BY-SA 4.0 | revid 75642271 | 22.433 | 37 |
| `noi-bo-nghi-phep.txt` | Nhóm dự án tự soạn (quy định mẫu, số liệu giả định) | Cùng giấy phép repo | 18/11/2026 | 2.737 | 4 |
| `noi-bo-cong-tac-phi.txt` | Nhóm dự án tự soạn (quy trình mẫu, số liệu giả định) | Cùng giấy phép repo | 18/11/2026 | 2.618 | 4 |

Bài Wikipedia lấy bằng MediaWiki API (`prop=extracts&explaintext=1`), **đã sửa đổi**: bỏ các mục "Tham khảo", "Chú thích", "Liên kết ngoài", "Xem thêm", "Đọc thêm", "Ghi chú" và gộp dòng trống. Theo CC BY-SA 4.0, bản sửa đổi giữ cùng giấy phép và ghi nguồn như bảng trên. Hai tài liệu nội bộ là mô phỏng, không chứa dữ liệu thật của tổ chức nào.

## Câu hỏi

- `questions.src.json`: nguồn do TL soạn. Mỗi câu có `evidence` là **cụm nguyên văn** trong tài liệu, dùng để gắn nhãn tự động.
- `questions.jsonl`: đầu ra của `label.py`. Mỗi dòng: `id`, `type` (`single` / `multi` / `out_of_scope`), `question`, `gold` (`[{file, chunkIndex}]`), `answer_points` (ý bắt buộc, dùng cho rubric 0–2).

| Loại | Số câu | Ghi chú |
|---|---|---|
| `single` | 34 | Một ý, một đoạn |
| `multi` | 6 | Cần ≥ 2 ý; chỉ **q39** trải trên 2 đoạn (8 và 10), 5 câu còn lại có đủ ý trong một đoạn (tài liệu nội bộ ngắn) |
| `out_of_scope` | 10 | 3 câu gần chủ đề dễ bịa: o01 (bún chả, gần Phở), o02 (vịnh Nha Trang — tài liệu có nhắc nhưng không có số đảo), o03 (thai sản, gần nghỉ phép), o07 (giá vé Hạ Long). Đã kiểm không có đáp án trong tài liệu |

Giới hạn: không có câu hỏi xuyên nhiều tài liệu (một hội thoại có thể chọn tới 5 tài liệu). Bổ sung khi SE-017 cần đo trường hợp này.

## Gắn nhãn và tái lập

Nhãn `chunkIndex` phụ thuộc tham số chia đoạn: `DOCUMENT_CHUNK_SIZE=1000`, `DOCUMENT_CHUNK_OVERLAP=150`, bộ chia `RecursiveCharacterTextSplitter` qua `chunkText` của ứng dụng. Đổi tham số thì phải gắn nhãn lại.

1. Sinh đoạn bằng chính code ứng dụng, sau khi `pnpm --filter @cat-gpt/api build`, từ thư mục `apps/api`:
   ```
   node --input-type=module -e "import {readFileSync,readdirSync,writeFileSync} from 'node:fs'; import {chunkText} from './dist/modules/documents/chunk-text.js'; const d='../../docs/evaluation/rag-dataset/docs', r={}; for (const f of readdirSync(d).sort()) r[f]=await chunkText(readFileSync(d+'/'+f,'utf8'),1000,150); writeFileSync('chunks.json', JSON.stringify(r));"
   ```
2. `python label.py <đường dẫn chunks.json>`. Script dừng nếu có cụm bằng chứng không nằm nguyên văn trong đoạn nào.

## Kiểm chứng trên Qdrant thật (AC2 của TL-009)

18/11/2026, TL tải 6 tài liệu bằng tài khoản thử A lên API build từ `develop` @ `b4c17be`, OpenAI `text-embedding-3-small` thật. Kết quả:
- Cả 6 tài liệu `READY`; `chunkCount` = số point Qdrant = số đoạn tính cục bộ (tổng 209).
- Nội dung `text` của từng point khớp đoạn cục bộ theo `chunkIndex`: 0 khác biệt.
- Đã xóa sau khi kiểm: Mongo 0, MinIO 0, Qdrant 0 (đếm trực tiếp).

Vì vậy nhãn `{file, chunkIndex}` đối chiếu được trực tiếp với payload Qdrant sau khi tải lên.

## Chỉ số và rubric

Định nghĩa: [TL-009 — Kế hoạch bộ dữ liệu](../../tasks/TL-009-rag-evaluation-dataset.md#kế-hoạch-bộ-dữ-liệu-tl-chuẩn-bị-18112026). Gồm hit@k (k = 1, 3, 5), MRR, refusal accuracy, false refusal, citation precision / coverage, và rubric 0–2 theo `answer_points`.
