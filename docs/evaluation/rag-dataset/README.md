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

## Lịch sử nhãn

**Ký tự xuống dòng phải là LF.** Bộ chia đoạn tách đoạn văn theo hai lần xuống dòng LF. Trên Windows với `core.autocrlf=true`, tệp checkout ra CRLF, khiến số đoạn đổi từ 209 thành 175 và nhãn `chunkIndex` không còn khớp. `.gitattributes` trong thư mục này ép mọi tệp văn bản của bộ dữ liệu (tài liệu, nhãn, kết quả) luôn LF; đã kiểm trên clone `core.autocrlf=true`: 23/23 tệp LF, 209 đoạn. Bản checkout cũ đang có CRLF thì xóa 6 tệp `.txt` trong `docs/` rồi chạy `git checkout -- docs/evaluation/rag-dataset/docs` để lấy lại bản LF (không đổi nội dung repo). Kiểm: `git ls-files --eol docs/evaluation/rag-dataset/docs` phải ghi `w/lf`.

| Vòng | Ngày | Tệp | Thay đổi |
|---|---|---|---|
| 1 | 18/11/2026 | `questions.v1.jsonl`, `questions.src.v1.json` (bản lưu) | Một cụm bằng chứng (hoặc một cụm mỗi ý với câu `multi`) → 41 gold |
| 2 | 20/11/2026 | `questions.jsonl`, `questions.src.json` | Yêu cầu CTO: chấp nhận mọi đoạn **tự nó** trả lời được ý chính. Thêm cụm bằng chứng nguyên văn cho 7 câu → 56 gold. Lý do từng câu ở trường `label_note`. q38 thêm ý lần công nhận 2023 vào `answer_points` |

Câu đổi ở vòng 2 (chỉ số đoạn theo 209 đoạn LF):

| Câu | Gold vòng 1 | Gold vòng 2 | Đoạn thêm chứa |
|---|---|---|---|
| q23 | `wiki-ao-dai` 0 | 0, 8, 10 | #8 Lemur Cát Tường cải cách áo ngũ thân; #10 Cát Tường đưa ra mẫu Lemur (1934) |
| q26 | `wiki-vinh-ha-long` 8 | 1, 8, 10, 16, 70 | Mỗi đoạn nêu tổng số 1.969 đảo (chỉ #8 có "989 đảo có tên") |
| q27 | 4 | 4, 71 | #71 mục "Di sản thế giới lần 1", ngày 17/12/1994 |
| q31 | 4 | 4, 92 | #92 mục "Trong thi ca", Nguyễn Trãi, "Lộ nhập Vân Đồn" |
| q32 | `wiki-dong-bang-song-cuu-long` 0 | 0, 25 | #25 mục dân cư, 15,7 triệu người (2024) |
| q38 | 4 | 4, 71, 76, 77 | #71 lần 1 (1994, thẩm mỹ), #76 lần 2 (2000, tiêu chuẩn viii), #77 lần 3 (2023) |
| q39 | 8, 10 | 1, 8, 10, 16, 70 | Như q26 (ý 1.969 đảo); #10 có cả ý "40 đảo có dân" |
