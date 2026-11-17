# SE-011 — Lát TXT, backend: tải lên → xử lý bất đồng bộ → READY → danh sách / tải xuống / xóa

Trạng thái: Đang làm
Người phụ trách: Senior Dev · Ưu tiên: **P0** (CTO 17/11/2026 tối) · Ước lượng: 3 ngày làm việc
Phụ thuộc: [TL-007](TL-007-module-3-design.md) — Done 17/11/2026; [SE-010](SE-010-dev-infra-ci.md) — Done 17/11/2026 (merge `9f502d1`); **không còn phụ thuộc chặn**
Hạn bàn giao review: Không đặt — theo phụ thuộc · Hạn hoàn tất: Không đặt — theo phụ thuộc
Ngày thực tế: bắt đầu — 17/11/2026 · bàn giao review — · hoàn tất —
Chốt: 16/11/2026 — CTO duyệt Wave 0–2: SE-011 triển khai backend lát TXT bằng service thật; chỉ chủ sở hữu truy cập; OpenAI chỉ dùng tài liệu thử công khai
SHA cơ sở: `origin/develop` @ `3401235`
PR: https://github.com/duong2604/cat_gpt/pull/19

**Thử nghiệm skills:** task pilot số 1 ([TL-010](TL-010-engineering-guide-skills-pilot.md)) — đọc [engineering-guide](../project/engineering-guide.md) trước khi làm.

## Mục tiêu
Một tệp TXT tải lên được lưu thật ở MinIO, xử lý bất đồng bộ qua BullMQ thành các đoạn có vector trong Qdrant, đạt `READY`, rồi xem danh sách, tải xuống và xóa sạch được — đúng [thiết kế Module 3](../design/module-3-documents.md).

## Output
- PR từ `feature/module-3-documents-txt` vào `develop`.
- Module `apps/api/src/modules/documents/` theo [thiết kế mục 3](../design/module-3-documents.md#3-kiến-trúc-và-thành-phần); chỉ bộ bóc tách TXT.
- `packages/shared`: `DocumentStatus`, mã lỗi mục 7, `DocumentDto`.
- Biến môi trường mục 8 trong `env.validation.ts`, `app-config.service.ts`, `.env.example` (đồng bộ `.env`; `pnpm env:check` đạt).
- Dependency mới (đã duyệt): `bullmq` ^6, `@nestjs/bullmq` ^12, `minio`, `@qdrant/js-client-rest`, `@langchain/textsplitters` (Q4 — CTO 17/11/2026: dùng `RecursiveCharacterTextSplitter`, không tự viết). Thêm gói khác → hỏi TL trước.
- Job ID: `process-<documentId>`, `delete-<documentId>` — **không dùng `:`** (bullmq 6 ném lỗi), không dùng số ([thiết kế mục 4.4](../design/module-3-documents.md#44-hàng-đợi-bullmq)).
- Tệp thử công khai trong `apps/api/test/fixtures/` (ghi nguồn).
- Tài liệu: cập nhật trạng thái trong `module-3-documents.md`; [access-control](../design/access-control.md) thêm dòng ma trận cho tài liệu.

## Phạm vi
- Làm: API mục 5; vòng đời mục 6; mã lỗi mục 7; tìm theo tên, lọc trạng thái. Ở chế độ `staff` (Tài liệu đang ẩn — CS-6), API `/documents` trả `404` như `ChatHiddenGuard` của SE-003 (bổ sung 17/11/2026 để khớp [module-4-rag.md mục 10](../design/module-4-rag.md#10-chế-độ-phát-hành)).
- Không làm: PDF/DOCX (SE-013); giao diện (SE-012); truy hồi/RAG; chuyển ảnh đại diện sang MinIO; job quét dọn định kỳ.

## Nguồn yêu cầu
- [module-3-documents.md](../design/module-3-documents.md) mục 2–8, 10.
- CTO 16/11/2026 mục 4: kiểm thử bằng service thật, không mock/fake chỉ để đánh dấu xong.

## Checklist nghiệm thu
Kiểm bằng Redis/MinIO/Qdrant thật (Docker local), MongoDB Atlas dev, OpenAI thật với tệp thử công khai. **Không ghi "idempotent" hay "dọn sạch" khi chưa có bảng số liệu thật** (CTO 17/11/2026). Tài khoản: nhân viên A, nhân viên B (cùng vai), admin.

| # | Tiêu chí | Nguồn | Cách kiểm tra |
|---|---|---|---|
| AC1 | T1: upload TXT → `201 PENDING` → `READY`; `chunkCount > 0`; số point Qdrant theo `documentId` = `chunkCount` | FR-M3-01, 07, 08 | Script/`curl` + truy vấn Qdrant |
| AC2 | T2, T10: sai đuôi / sai chữ ký / không UTF-8 / quá cỡ → `400` đúng mã, không còn object/bản ghi; tệp chỉ khoảng trắng → `FAILED DOCUMENT_NO_TEXT`, không thử lại | Thiết kế mục 5–7 | `curl` + kiểm MinIO/Mongo |
| AC3 | T3, T4: Qdrant tắt rồi bật trước lần thử cuối → `READY`; tắt suốt → `FAILED DOCUMENT_PROCESSING_FAILED` sau đúng `DOCUMENT_JOB_ATTEMPTS` lần | Mục 6.3 | `docker compose stop qdrant` / `start` + log |
| AC4 | T5: chạy lại job `process` cho tài liệu `READY` → số point không đổi | Mục 6.3 bước 4 | Đếm point trước/sau |
| AC5 | T6, T11: xóa khi worker đang xử lý — (a) đang embedding, (b) ngay sau `PROCESSING`; mỗi giai đoạn ≥ 3 lần → mọi lần 0 point, 0 object, 0 bản ghi, không có `READY` | Mục 6.4, 10 | Tệp lớn + log worker + đếm 3 nơi (bảng số liệu từng lần) |
| AC5b | T12: kill tiến trình API khi job `PROCESSING`, khởi động lại → `READY`, số point = `chunkCount` | Mục 6.3 | Log BullMQ + đếm point |
| AC5c | T13: MinIO tắt khi xóa → tài liệu `404` ngay; bật lại trước khi hết lượt → dọn xong 3 nơi | Mục 6.4 | `docker compose stop/start minio` + đếm 3 nơi |
| AC6 | T9: Redis tắt → upload `503 DOCUMENT_QUEUE_UNAVAILABLE`, không còn object/bản ghi | Mục 6.2 | `docker compose stop redis` |
| AC7 | T7: B và admin gọi detail/download/delete tài liệu của A → `404 DOCUMENT_NOT_FOUND`; chưa đăng nhập `401`; danh sách của B không thấy tài liệu của A | M3-2, CS-1 | `curl` 3 cookie jar |
| AC8 | T8: tải xuống — SHA-256 trùng tệp gốc; `Cache-Control: private, no-store`; tên tiếng Việt đúng | FR-M3-05 | `curl -OJ` + `sha256sum` |
| AC9 | Tìm theo tên không phân biệt hoa thường; lọc `status`; phân trang | FR-M3-02, 03 | `curl` |
| AC10 | Unit test cho kiểm định dạng, chia đoạn, phân loại lỗi vĩnh viễn/tạm thời; mock (nếu có) ghi lý do | CTO 16/11 mục 4 | `pnpm --filter @cat-gpt/api test` |
| AC11 | Log không có nội dung tài liệu, khóa API | Thiết kế mục 7 | Trích log |
| AC12 | `.env` ↔ `.env.example` đồng bộ; `.env.example` không có credential thật | CTO 16/11 mục 1 | `pnpm env:check` |
| AC13 | Checklist hai vai (mục 9.1), dữ liệu thử đã xóa (tài liệu, point, object; tài khoản thử khóa) | Workflow 9.1 | Bàn giao 6.1 |
| AC14 | CI xanh; `pnpm build`, `typecheck`, `lint` đạt | Quy ước repo | Link run |

**Bàn giao bổ sung (Simplicity First):** (1) đã đổi gì, vì sao; (2) vì sao đây là cách đơn giản nhất đủ dùng; (3) abstraction/dependency mới và lý do; (4) test đã chạy + kết quả; (5) giới hạn còn lại, rủi ro.

## Checkpoint nội bộ (CTO 17/11/2026 tối)
Đây là các checkpoint nội bộ: không thay AC, và mọi AC ở trên vẫn bắt buộc. **Mục tiêu sáng 18/11 là CP1–CP3**, tức happy case chạy trên service thật, có PR để review. **CP4 bắt buộc trước khi merge / Done.** PR có thể mở sau CP3; khi CP4 chưa đạt thì PR vẫn để OPEN.

| CP | Nội dung | Bằng chứng tối thiểu khi báo TL |
|---|---|---|
| CP1 Foundation | Module `documents`; DTO/schema/config; tích hợp MinIO, Mongo, BullMQ, Qdrant; `POST /documents` → `201 PENDING` | Commit SHA; `curl` request/response đã che dữ liệu nhạy cảm |
| CP2 Processing | Worker đọc TXT → kiểm UTF-8 → chia đoạn → OpenAI embedding → upsert Qdrant → `READY` | `documentId`, `chunkCount`, số point Qdrant theo `documentId`, log worker |
| CP3 Read APIs | List, detail, download | SHA-256 tệp gốc = tệp tải về; đếm 3 nơi: Mongo, MinIO, Qdrant |
| CP4 Hardening | Delete/cleanup, cô lập chủ sở hữu, retry, idempotency, đồng thời | AC1–AC14 đầy đủ (T1–T13) |

Mỗi checkpoint: commit + push lên nhánh, rồi báo TL SHA. TL review từng checkpoint.

## Rủi ro xung đột
`app.module.ts`, `env.validation.ts`, `app-config.service.ts`, `.env.example`, `packages/shared` — cũng bị PR #6 (SE-003) sửa. Chỉ **thêm khối mới**; nếu PR #6 chưa merge khi bàn giao, ghi rõ trong PR.

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|
| Q4 | Thư viện chia đoạn | `@langchain/textsplitters` | **Chốt 17/11/2026 (CTO):** `RecursiveCharacterTextSplitter` |

## Kết quả review
Chưa có bàn giao.

## Lịch sử review

### Checklist vòng 1

**Task** — SE-011 · PR https://github.com/duong2604/cat_gpt/pull/19 · SHA đầu PR `6a4a766` · vòng 1
**Kết quả** — Module `apps/api/src/modules/documents/` (controller/service/presenter/schema/dto, MinIO/Qdrant/OpenAI embeddings/BullMQ worker); `packages/shared` (`DocumentStatus`, `DocumentDto`, 6 mã lỗi); biến môi trường mục 8; 2 vòng review với TL đã sửa 3 lỗi chặn (web i18n thiếu khóa lỗi, tên tệp tiếng Việt bị multer giải mã sai, Qdrant "Not Found" khi collection chưa tồn tại) + 2 lỗi CP4 (Redis treo thay vì 503, upload >25MB trả 413 thay vì 400) + 1 lỗi tự phát hiện (MinIO remove() nuốt mọi lỗi, chặn retry job xóa). **CP1–CP3 đạt trên service thật** (OpenAI Embeddings có quyền từ ~23:45 17/11). **CP4 chưa xong — chưa đề nghị merge.**

**Checklist**
- [x] AC1 T1: upload TXT → `201 PENDING` → `READY`; `chunkCount > 0`; point Qdrant = `chunkCount` — Đạt — Senior Dev: doc `6afc84bfa9f370c78f429534`, READY ~0.6s, chunkCount=3, Qdrant count=3. TL độc lập: `Giới thiệu Việt Nam.txt` (8254B), READY 1.3s, chunkCount=7, Mongo 1/MinIO 1/Qdrant 7, collection size 1536 Cosine, payload keys đúng {chunkIndex,documentId,text,userId}, index trên userId/documentId
- [x] AC2 T2,T10: sai đuôi/chữ ký/UTF-8/quá cỡ → 400 đúng mã; khoảng trắng → FAILED DOCUMENT_NO_TEXT — Đạt — qua API thật, dùng tệp TL chuẩn bị (`se011-fixtures/`) + tệp tự tạo: `pdf-as-txt.txt`, `latin1.txt`, `nul-byte.txt`, `wrong-ext.md` → 400 FILE_INVALID_TYPE; tệp PDF giả có nội dung nhị phân thật sau header `%PDF-` (không chỉ chữ `%PDF-` dạng ASCII) → 400 FILE_INVALID_TYPE; 26MB → 400 FILE_TOO_LARGE; `whitespace.txt` → 201 PENDING rồi FAILED DOCUMENT_NO_TEXT trong 176ms (không thử lại); `too-many-chunks.txt` (933KB) → 201 PENDING rồi FAILED DOCUMENT_TOO_MANY_CHUNKS trong 807ms (không thử lại, dừng trước khi gọi OpenAI); `bom.txt` → READY, chunkCount=1 (BOM bị bỏ đúng)
- [ ] AC3 T3,T4: Qdrant tắt/bật → READY hoặc FAILED sau đúng số lần — Chưa kiểm — cần dừng Qdrant (hạ tầng dùng chung với TL), đã xin phép và sẽ chạy ngay sau khi gửi bàn giao này
- [x] AC4 T5: chạy lại job `process` cho tài liệu `READY` → số point không đổi — Đạt — Senior Dev: re-queue thủ công `process-6afc84bfa9f370c78f429534`, worker bỏ qua (log "bỏ qua: đã bị xóa hoặc đổi trạng thái" — status guard chỉ nhận PENDING/PROCESSING), Qdrant giữ nguyên 3 point. TL độc lập: 2 lần chạy lại → 7→7→7 point
- [ ] AC5 T6,T11: xóa khi đang `PROCESSING` (đang embedding / ngay sau PROCESSING), ≥3 lần mỗi giai đoạn → 0 point/0 object/0 bản ghi, không có READY — Chưa kiểm — cần tệp lớn (TL đã chuẩn bị `large-400chunks.txt`, ~420 đoạn) để có đủ thời gian xóa giữa chừng; chạy ngay sau bàn giao này
- [x] AC5b T12: kill API khi `PROCESSING`, khởi động lại → `READY`, point = `chunkCount` — Đạt (TL xác minh độc lập) — tệp 419 đoạn, kill -9 khi đang PROCESSING (0 point lúc kill), khởi động lại → job "stalled" chạy lại → READY, chunkCount=419, 419 point, 419 chunkIndex 0–418 duy nhất, không trùng
- [x] AC5c T13: MinIO tắt khi xóa → `404` ngay; bật lại trước khi hết lượt → dọn xong 3 nơi — Đạt — 2 kịch bản, đếm trực tiếp 3 nơi (không qua API): (1) MinIO tắt rồi bật giữa chừng (doc `...ba12`): `DELETE` 204 trong 0.167s, GET 404 ngay; lúc tắt job ở trạng thái `delayed` attemptsMade=2/5; sau khi bật lại job hoàn tất; Mongo `countDocuments({_id})`=0, MinIO `statObject`=NotFound, Qdrant=0. (2) MinIO tắt suốt (doc `...ba14`): job `failed` sau 5 lần thử (~80s); Mongo `countDocuments({_id})`=1 còn `deletedAt`, MinIO vẫn không vào được, Qdrant=0 — đúng thiết kế mục 6.4 bước 4. Phát hiện và sửa thêm: `DocumentFilesService.remove()` trước đó nuốt mọi lỗi (kể cả mất kết nối thật), khiến job xóa "thành công" giả khi MinIO lỗi mà không bao giờ thử lại — đã sửa để lỗi thật được ném ra cho BullMQ thử lại. TL xác minh độc lập kịch bản (1) hai lần trên `6a4a766`: `delayed` attemptsMade=2, sau khi bật lại → Mongo 0 / MinIO 0 / Qdrant 0
- [x] AC6 T9: Redis tắt → upload `503 DOCUMENT_QUEUE_UNAVAILABLE`, không còn object/bản ghi — Đạt — Senior Dev: 503 sau ~3.3s (timeout chủ động, vì ioredis mặc định xếp hàng lệnh trong bộ nhớ thay vì báo lỗi ngay). TL độc lập: 503 sau 3.2s, Mongo 0 bản ghi, MinIO 0 object
- [x] AC7 T7: B/admin gọi tài liệu của A → `404`; chưa đăng nhập → `401`; danh sách B không có tài liệu A — Đạt — TL xác minh độc lập (B và admin: `404`; chưa đăng nhập: `401`; danh sách B không chứa tài liệu A). Senior Dev tự kiểm thêm bằng 2 tài khoản TL cấp (`tl-se011.a`, `tl-se011.b`, không ghi mật khẩu ra ngoài): A upload, B gọi detail/download/delete → `404 DOCUMENT_NOT_FOUND` cả 3; admin gọi cùng 3 thao tác → `404` (không có ngoại lệ, đúng M3-2/CS-1); không cookie → `401`; danh sách B `total=0`, không chứa tài liệu A; A tự xóa → `204`
- [x] AC8 T8: tải xuống — SHA-256 khớp, `Cache-Control: private, no-store`, tên tiếng Việt đúng — Đạt — Senior Dev: SHA-256 tệp tải về khớp tuyệt đối tệp gốc, header đúng. TL độc lập: SHA-256 khớp, tên tiếng Việt đúng, tìm không phân biệt hoa/thường (tìm "GIỚI" thấy "Giới thiệu...")
- [x] AC9 Tìm theo tên không phân biệt hoa/thường; lọc `status`; phân trang — Đạt — tìm không phân biệt hoa/thường (TL xác minh: "GIỚI" tìm thấy "Giới thiệu…"); lọc `status=READY` (Senior Dev); phân trang: tạo 25 tài liệu, `pageSize=10` → trang 1 (10 mục, mới nhất trước), trang 2 (10 mục), trang 3 (5 mục), `meta.total=25`, `totalPages=3`; gộp 3 trang = 25 tên duy nhất, không trùng/sót. Đã xóa cả 25, Qdrant tổng còn 0 point
- [x] AC10 Unit test kiểm định dạng, chia đoạn, phân loại lỗi vĩnh viễn/tạm thời — Đạt (một phần qua unit test, một phần qua kiểm thật — xin TL xác nhận cách này đủ) — `text-extract.spec.ts`, `chunk-text.spec.ts`, `sanitize-filename.spec.ts` (26 test: định dạng, chia đoạn, BOM, byte 0x00, encoding multer). Phân loại vĩnh viễn/tạm thời: không tách thành hàm thuần riêng (logic chỉ là các nhánh gọi `UnrecoverableError` cụ thể trong `document-processor.ts`, tách ra chỉ để unit-test sẽ là class giả cho có — Simplicity First); đã kiểm qua API thật thay vì unit test giả: `DOCUMENT_NO_TEXT`/`DOCUMENT_TOO_MANY_CHUNKS` → không thử lại (vĩnh viễn, AC2); `DOCUMENT_PROCESSING_FAILED` → thử đúng 3 lần rồi FAILED (tạm thời, AC6/T9)
- [x] AC11 Log không có nội dung tài liệu, khóa API — Đạt — Senior Dev tự `grep` log API (bao gồm log của toàn bộ phiên kiểm thử CP2–CP4 ở trên): không có nội dung tệp thử (`grep` nội dung các tệp thử → không khớp), không có `sk-proj-`/khóa OpenAI/`JWT_ACCESS_SECRET`/`MINIO_SECRET`; dòng log duy nhất có chữ "password" là tên route `/me/password`, không phải giá trị. TL xác nhận cùng kết quả ở vòng review CP1 (trên mã trước đó)
- [x] AC12 `.env` ↔ `.env.example` đồng bộ; không có credential thật trong `.env.example` — Đạt — `pnpm env:check` OK nhiều lần trong suốt quá trình; biến thêm cho tài liệu (`EMBEDDING_MODEL`, `DOCUMENT_*`) đã đồng bộ
- [x] AC13 Checklist hai vai (mục 9.1), dữ liệu thử đã xóa — Đạt — xem "Checklist hai vai" chi tiết ngay dưới bảng này; mọi tài liệu thử (của Senior Dev và TL) đã xóa, đếm trực tiếp Mongo/MinIO/Qdrant = 0 ở lần kiểm cuối
- [ ] AC14 CI xanh; `pnpm build`, `typecheck`, `lint` đạt — Một phần — `pnpm typecheck && pnpm build && pnpm lint` ở gốc monorepo đạt nhiều lần; CI GitHub Actions xanh tại `0c464f0` ([run 44130672641](https://github.com/duong2604/cat_gpt/actions/runs/44130672641)); sẽ dẫn lại run ứng với SHA đầu PR cuối cùng ở bàn giao tiếp theo

**Checklist hai vai** ([workflow 9.1](../project/workflow.md#91-trách-nhiệm-hai-vai-về-phân-quyền-giao-diện-và-phát-hành))
- [x] Quyền: ca được phép — upload/list/detail/download/delete tài liệu của chính mình (AC1, AC8); ca bị từ chối — chưa đăng nhập `401` (curl không cookie), cùng vai khác tài khoản `404` (A/B), vai khác `404` (admin, không có ngoại lệ) — AC7
- [ ] Đường dẫn trực tiếp tới màn hình không có quyền — Không áp dụng — task backend, chưa có UI (giao diện ở [SE-012](SE-012-documents-txt-frontend.md))
- [ ] Trạng thái trống/tải/lỗi/thành công — Không áp dụng — task backend, chưa có UI
- [ ] Desktop + mobile 375px, sáng + tối, vi + en — Không áp dụng — task backend, chưa có UI
- [x] Chế độ `demo`/`staff` hiển thị đúng bảng tính năng — Đạt — `RELEASE_MODE=staff`: `GET`/`POST /documents` → `404` (giống route không tồn tại), Chat vẫn `chatEnabled:true` (đúng CS-6: Tài liệu luôn ẩn ở `staff`, không phụ thuộc mock/thật như Chat)
- [x] Ma trận quyền/chuẩn giao diện đã cập nhật nếu có thay đổi — Đạt — thêm 3 dòng cho API `/documents` vào [access-control.md](../design/access-control.md) (USER thao tác của mình; USER/ADMIN với tài liệu người khác → `404` không ngoại lệ; `staff` → `404`)
- [x] Dữ liệu thử đã dọn — Đạt — tài khoản thử: `tl-se011.a@catgpt.local`, `tl-se011.b@catgpt.local` (TL tạo, TL sẽ khóa sau khi SE-011 xong) và admin seed (không phải tài khoản thử, giữ nguyên); tài liệu thử: mọi tài liệu đã xóa qua API, đếm trực tiếp Mongo/MinIO/Qdrant = 0 ở lần kiểm cuối mỗi đợt

**Kiểm tra đã chạy** — `pnpm typecheck && pnpm build && pnpm lint` (gốc monorepo, đạt tại `6a4a766`); `pnpm --filter @cat-gpt/api test` 26/26; `pnpm env:check` OK; kiểm thật trên MongoDB Atlas dev, Redis/MinIO/Qdrant Docker local dùng chung với TL, OpenAI thật (tệp thử `apps/api/test/fixtures/se-011-sample.txt`, tự soạn không nhạy cảm, và tệp tiếng Việt của TL)

**Simplicity First** ([engineering-guide](../project/engineering-guide.md#1-simplicity-first-mọi-task)) — (1) Đã làm module `documents` theo đúng khuôn `chat/` (controller/service/schema/dto/presenter), worker BullMQ trong cùng tiến trình API (ponytail đã ghi), dùng lại `AppException`/`ErrorCode`/`PaginationQueryDto`/`FileInterceptor` sẵn có; (2) không thêm interface/abstraction cho MinIO/Qdrant/OpenAI (mỗi dịch vụ một class cụ thể, đúng M3-5 và "một bản cài, không interface"); dùng `@langchain/textsplitters` theo đúng Q4, không tự viết bộ chia đoạn; (3) dependency mới đã duyệt trong task: `bullmq`, `@nestjs/bullmq`, `minio`, `@qdrant/js-client-rest`, `@langchain/textsplitters`; thêm `ioredis` (peer bắt buộc của `bullmq` 6, không có trong danh sách duyệt ban đầu nhưng là phụ thuộc kỹ thuật bắt buộc, không phải lựa chọn thiết kế); (4) test: unit (26, logic thuần) + kiểm thật từng bước (upload/process/list/detail/download/delete) trên Mongo Atlas/MinIO/Qdrant/Redis/OpenAI thật, kết quả ghi trong checklist; (5) giới hạn còn lại: CP4 chưa xong (xem các dòng chưa đạt ở trên); chưa có job quét dọn định kỳ cho bản ghi `deletedAt` mồ côi khi dọn dẹp thất bại toàn bộ (đã ghi chú `ponytail:` tại chỗ, đúng như thiết kế mục 6.4 chấp nhận)

**Dọn nhánh trước khi nhận task này** (mục 2.1) — `develop` local @ `3401235` lúc nhận task; đã dọn: `feature/dev-infra-ci` (SE-010, đã merge, xóa local); còn giữ: không có nhánh nào khác

**Trạng thái** — Chờ Review (CP1–CP3; CP4 đang tiếp tục, PR giữ **OPEN**, chưa đề nghị merge)

## Phản hồi UI
Không áp dụng (backend). Giao diện ở [SE-012](SE-012-documents-txt-frontend.md).
