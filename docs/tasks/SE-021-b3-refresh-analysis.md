# SE-021 · PR-B3 — Phân tích đăng xuất và xoay refresh token (TL-F1), CHƯA CODE

Trạng thái: báo cáo phân tích cho TL và CTO. Chưa có thay đổi code.
Căn cứ: `origin/develop` @ `310ee02` (sau merge #38, #39, #40). Đối chiếu: mô phỏng logic bằng Node (đồng hồ giả), không chạy API.
Người lập: Senior Dev · vòng 1 của B3.

## 1. Logic hiện tại (develop 310ee02)

| Thành phần | File:dòng | Ghi chú |
|---|---|---|
| Định dạng refresh token | `modules/sessions/refresh-token.ts:19-27` | `<sessionId>.<secret>`; parse chỉ kiểm định dạng ObjectId, không kiểm secret |
| So sánh hash | `refresh-token.ts:29-33` | SHA-256 hex, `timingSafeEqual` |
| Schema phiên | `modules/sessions/schemas/session.schema.ts:12-18, 29-37` | Lưu `tokenHash` (hiện tại) và `previousTokenHash` (ngay trước). **Không lưu lịch sử** |
| Hằng ân hạn | `common/constants.ts:21` | `REFRESH_REUSE_GRACE_MS = 30_000` |
| Phân loại token trình lên | `sessions.service.ts:29-37` (`classifyPresented`) | `current` / `grace` (khớp `previousTokenHash`, `rotatedAt` ≤ 30 s) / `reuse` (còn lại) |
| Xoay token | `sessions.service.ts:77-102` (`rotate`) | `reuse` → `revoke(sessionId)` và 401 (dòng 83-87). CAS trên `tokenHash` (dòng 89-101) |
| Tải phiên để xoay | `sessions.service.ts:105-111` (`findRotatable`) | Không có phiên / bị thu hồi / hết hạn → 401, không thu hồi |
| Đổi token có điều kiện | `sessions.service.ts:114-134` (`swapToken`) | `findOneAndUpdate({_id, revokedAt:null, tokenHash: session.tokenHash})` |
| Thu hồi | `sessions.service.ts:163-168` (`revoke`) | Chỉ theo `sessionId`; **không kiểm secret** |
| Refresh ở tầng auth | `modules/auth/auth.service.ts:54-75` | Gọi `rotate` trước; nếu user bị khóa → `revoke` (dòng 64-68) |
| Logout | `auth/auth.service.ts:78-81` | Parse token → `revoke(sessionId)`. **Không kiểm secret**; luôn không ném lỗi |
| Controller refresh | `auth/auth.controller.ts:45-56` | Lỗi bất kỳ → xóa cookie rồi ném lại |
| Controller logout | `auth/auth.controller.ts:63-66` | `@Public()`; xóa cookie sau khi gọi service |
| Kiểm phiên mỗi request | `auth/jwt.strategy.ts` (`validate` → `findActive`) | Thu hồi có hiệu lực ngay trên mọi request |
| Cookie refresh | `auth/auth-cookie.service.ts` | `httpOnly`, `sameSite=lax`, `path=/api/v1/auth` |
| Thời hạn | `config/env.validation.ts:67, 72` | Access 900 s (15 phút); refresh 7 ngày |
| Log | `sessions.service.ts:84` | Ghi `sessionId` (không ghi secret) khi phát hiện dùng lại |

Kết luận về trạng thái: CAS (B2) chỉ xử lý **đua đồng thời**. Với tuần tự, hành vi không đổi so với trước B2.

## 2. Phân loại token trình lên (theo yêu cầu CTO, không mặc định "khớp = an toàn")

Server chỉ biết hai hash (`tokenHash`, `previousTokenHash`). Mỗi trường hợp dưới đây được xếp theo **những gì server thực sự quan sát được**.

| Loại | Định nghĩa | Hiện server xử lý | Phân biệt được không? |
|---|---|---|---|
| (i) Hiện tại | secret khớp `tokenHash` | Xoay, cấp token mới | Có |
| (ii) Cũ trong cửa sổ đồng thời | khớp `previousTokenHash`, `rotatedAt` ≤ 30 s | Xoay tiếp (ân hạn), cấp token mới | Có, nhưng **không** phân biệt được với replay trong 30 s (xem (v)) |
| (iii) Secret sai | sessionId đúng, secret không khớp hash nào server từng lưu (có thể là bịa) | `reuse` → **thu hồi phiên** | Về nguyên tắc **không**: server không lưu lịch sử, không chứng minh được token từng hợp lệ |
| (iv) Token thật nhưng đã cũ | secret từng hợp lệ, nay không còn là current/previous | `reuse` → **thu hồi phiên** | Không phân biệt được với (iii) khi không có lịch sử hash |
| (v) Bị đánh cắp / phát lại | kẻ tấn công giữ token hợp lệ trước nạn nhân | (ii) trong 30 s: **cấp token mới cho kẻ tấn công**; (iv) sau 30 s: thu hồi (kẻ tấn công và nạn nhân cùng mất phiên) | Chỉ khi nạn nhân dùng lại — không có tín hiệu tức thời |

Hệ quả quan trọng:
- Khớp secret **không** chứng minh người gửi là nạn nhân: trong 30 s sau mỗi lần xoay, token "previous" vẫn được chấp nhận và được đổi lấy token mới (K3, dưới đây).
- Không có cách nào, chỉ với dữ liệu hiện tại, phân biệt (iii) với (iv). Đây là lý do thu hồi khi `reuse` vừa là cơ chế chống replay vừa là đường DoS khi biết `sessionId`.

## 3. Mô phỏng các kịch bản (logic `develop` 310ee02, đồng hồ giả)

Kết quả đầu ra (không đổi qua các lần chạy):

| Kịch bản | Kết quả hiện tại | Đánh giá |
|---|---|---|
| K1: response xoay bị mất; trình duyệt giữ token cũ; thử lại sau +5 s | Cấp token mới (grace) | Đúng |
| K2: như K1 nhưng thử lại sau +31 s | **Thu hồi phiên** | **Đăng xuất nhầm** (mạng chậm/mất response) |
| K3: kẻ tấn công replay token cũ sau +10 s | **Cấp token mới** cho kẻ tấn công | Rủi ro: ân hạn cho phép đổi token cũ lấy chuỗi refresh mới |
| K3b: kẻ tấn công dùng tiếp token vừa nhận | Cấp token mới | Chuỗi refresh bền vững của kẻ tấn công |
| K4: secret sai, sessionId đúng, gọi `/auth/refresh` | **Thu hồi phiên** | Cho phép người biết `sessionId` làm đăng xuất nạn nhân (DoS) |
| K5: secret sai, sessionId đúng, gọi `/auth/logout` | **Thu hồi phiên** (không kiểm secret) | Lỗ hổng TL-F1 (logout). Người biết `sessionId` đăng xuất được người khác |

Ghi chú về K4/K5: `sessionId` không phải bí mật tuyệt đối. Nơi lộ: log cảnh báo `sessions.service.ts:84`; ObjectId có phần thời gian dự đoán được. Access token có `sid` nhưng nằm trong cookie `httpOnly` và chỉ người giữ cookie đọc được (base64 payload). `/me/sessions` chỉ trả cho chính chủ.

## 4. Timeline các request đồng thời và tuần tự

| # | Tình huống | Diễn biến server | Kết quả hiện tại | Ghi chú |
|---|---|---|---|---|
| T1 | Hai tab refresh cùng lúc (cùng cookie h0) | Một bên CAS thắng (h1), bên thua đọc lại, grace → h2 | Cả hai 204, phiên sống (đã kiểm ở B2) | Đúng |
| T2 | Tab mở sau 15 phút (access hết hạn) | Trình duyệt có cookie mới nhất → xoay bình thường | Đúng | Cookie dùng chung giữa các tab |
| T3 | Response xoay bị mất, thử lại trong 30 s | Grace | Đúng (K1) | |
| T4 | Response xoay bị mất, thử lại sau 30 s | `reuse` → thu hồi | **Đăng xuất nhầm** (K2) | Mạng chậm hoặc timeout phía client |
| T5 | Kẻ tấn công replay token vừa bị thay, trong 30 s | Grace → cấp token mới | **Chiếm chuỗi refresh** (K3) | Cửa sổ 30 s sau mỗi lần xoay |
| T6 | Kẻ tấn công replay sau 30 s | `reuse` → thu hồi | Cả hai mất phiên | Ngăn chặn đúng nhưng gây đăng xuất nạn nhân |
| T7 | Người có `sessionId` gửi secret sai tới `/auth/refresh` | `reuse` → thu hồi (K4) | Đăng xuất nạn nhân | Chỉ cần `sessionId` |
| T8 | Người có `sessionId` gọi `/auth/logout` với secret bất kỳ | Thu hồi (K5) | Đăng xuất nạn nhân | Không cần token |
| T9 | Đua giữa xoay và thu hồi (rotate đồng thời logout) | CAS thua → đọc lại; phiên đã thu hồi → 401 | Không lỗi | |
| T10 | Hai đăng nhập cùng trình duyệt; cookie bị ghi đè | Phiên cũ mất refresh cookie | 401 khi xoay (không thu hồi) | Có thể gây nhầm nhưng không mở rộng quyền |
| T11 | Đua: secret sai gửi đồng thời với xoay hợp lệ | Lần đọc đầu: `reuse` → thu hồi. Nếu đọc sau CAS thua: 401 không thu hồi | **Không nhất quán** (phụ thuộc thời điểm) | Cần thống nhất (xem phương án) |

## 5. Phương án tối thiểu

### Nhóm A — sửa lỗi, không làm yếu bảo mật (TL duyệt được)

**A1. Logout chỉ thu hồi khi secret khớp (current hoặc grace).**
- Thay đổi: `auth.service.ts:78-81` — parse → gọi phân loại; chỉ `revoke` khi là `current` hoặc `grace`; ngược lại không thu hồi. Vẫn xóa cookie.
- Tác dụng: K5 và T8 không còn thu hồi được bằng `sessionId`. Không làm yếu cơ chế chống replay (logout không phải cơ chế phát hiện).
- Đánh đổi (phải ghi rõ): nếu trình duyệt giữ token đã quá 30 s (T4) rồi người dùng bấm đăng xuất, cookie bị xóa nhưng phiên trên server **còn sống** đến khi hết hạn (7 ngày) hoặc người dùng thu hồi trong `/me/sessions`. Đây là "phiên mồ côi", không phải lỗ hổng mới (phiên đó vẫn chỉ dùng được với token còn hợp lệ — hiện không có token nào trong trình duyệt).
- Kiểm: K5 phải cho `NOT REVOKED`; logout hợp lệ với token hiện tại phải thu hồi.

**A2. Thống nhất xử lý `reuse` trong đua (T11).** Chỉ là cách đọc lại trong CAS: lần đầu và lần sau cùng dùng một quy tắc. Không đổi kết quả tuần tự. Cần TL chọn: (a) giữ thu hồi cho cả hai (nhất quán với tuần tự), hoặc (b) không thu hồi cho cả hai (xem nhóm B2 — làm yếu chống replay). **Đề xuất (a)** — giữ hành vi hiện tại, chỉ ghi nhận.

**A3 (tùy chọn, TL quyết — thay đổi hành vi nhỏ).** Ân hạn không xoay thêm: khi `grace`, chỉ cấp access token, **không** cấp refresh token mới và không đổi `tokenHash`.
- Tác dụng: K3/K3b không còn đổi token cũ lấy chuỗi refresh bền vững; kẻ tấn công chỉ có access token tối đa 15 phút. Hai tab vẫn hoạt động (cookie của tab thắng là current).
- Đánh đổi: response của nhánh grace không có Set-Cookie refresh (vẫn 204). Cần kiểm lại T1 (ai là current sau đua).
- Không sửa K2 (vẫn 30 s).

### Nhóm B — cần CTO (thay đổi chính sách hoặc tăng rủi ro)

**B1. Kéo dài ân hạn hoặc cơ chế thử lại an toàn cho K2/T4.** Hai hướng:
- Tăng `REFRESH_REUSE_GRACE_MS` (ví dụ 2–5 phút): tăng cửa sổ replay (K3) tương ứng.
- Lưu tạm token vừa cấp (mã hóa, TTL ngắn) để trả lại khi client thử lại: thêm dữ liệu nhạy cảm vào DB — rủi ro mới, cần CTO duyệt.

**B2. Phân biệt secret sai (iii) với token cũ thật (iv).** Cần lưu lịch sử hash (ví dụ N hash gần nhất, có thời gian) — thay đổi schema và chính sách:
- Nếu không có lịch sử: buộc chọn giữa (a) giữ thu hồi cho mọi `reuse` (DoS khi biết `sessionId`, K4), hoặc (b) chỉ 401 không thu hồi (mất phát hiện replay token cũ — làm yếu containment).
- Có lịch sử: `reuse` với token **đã từng hợp lệ** → thu hồi; secret chưa từng thấy → 401 không thu hồi. Đây là phương án đề xuất, nhưng là thay đổi schema và phải có CTO duyệt.

**B3. Chấp nhận rủi ro replay mới** (nếu CTO chọn A3 hoặc B1 hướng tăng ân hạn): ghi vào rủi ro dự án.

**B4. Ngừng ghi `sessionId` trong log cảnh báo** (`sessions.service.ts:84`): giảm nguy cơ lộ định danh. Thay đổi nhỏ nhưng ảnh hưởng vận hành (khó điều tra) — CTO quyết.

## 6. Đề xuất cho TL

- Duyệt **A1** (sửa logout). Chặn K5 với ảnh hưởng nhỏ (đã ghi phiên mồ côi).
- Quyết định **A3** (không xoay thêm trong ân hạn): có lợi về bảo mật, thay đổi hành vi nhỏ.
- Trình CTO **B1** và **B2** — hai quyết định về ân hạn và lịch sử hash; không làm trong B3 nếu CTO chưa duyệt.
- Kiểm chứng đề xuất trước khi code: kịch bản K3, K4, K5 (với tên, email và token thử; không dùng tài khoản thật) và T1, T4 trên API thật. Dữ liệu thử dọn theo ID đã ghi.

## 7. Câu hỏi cho CTO

1. Chấp nhận phiên mồ côi khi đăng xuất với token đã quá 30 s (A1)? Hay muốn đăng xuất luôn thu hồi phiên bằng `sessionId` (giữ lỗ hổng K5)?
2. Chấp nhận `reuse` không thu hồi khi secret chưa từng thấy (B2b), hay yêu cầu lưu lịch sử hash (B2a)?
3. Ân hạn: giữ 30 s, tăng, hay chuyển sang "chỉ cấp access token" (A3)?
4. Có chấp nhận ghi `sessionId` vào log không (B4)?

## 8. Phạm vi đã kiểm và chưa kiểm

- Đã kiểm: đọc code tại `310ee02` (các dòng nêu trên); mô phỏng logic K1–K5 khớp với nhánh tương ứng.
- Chưa kiểm: chạy API thật cho K2–K5 (sẽ làm sau khi có quyết định); kiểm tra nhiều instance (lưu trạng thái đua không liên quan đến Redis); hành vi trình duyệt thật khi response bị mất.
