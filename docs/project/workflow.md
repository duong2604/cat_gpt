# Quy trình làm việc

Nguồn quy trình duy nhất cho **Team Leader (TL)** và **Senior Dev**. `CLAUDE.md` và [docs/README.md](../README.md) chỉ tóm tắt và dẫn về đây.

## 1. Vai trò

| Vai | Trách nhiệm | Không làm |
|---|---|---|
| Khách hàng (chủ dự án) | Cùng CTO chốt phạm vi, deadline và quyết định mở trong [plan.md](plan.md); chốt ưu tiên; review trải nghiệm; duyệt tài liệu TL soạn | — |
| CTO | Cùng khách hàng chốt phạm vi và deadline; duyệt tài liệu TL soạn; tra cứu chi tiết kỹ thuật trong hồ sơ task | — |
| TL | Phân tích nghiệp vụ, tư vấn giải pháp; ghi lại và điều phối [plan.md](plan.md); **giao task** (ID, người phụ trách, ưu tiên, hạn — mục 3.1); **nghiệm thu kỹ thuật** (mục 9), review PR, chuyển `Sẵn sàng` / `Cần sửa` / `Done`, merge PR task đã chốt vào `develop`; cập nhật [context.md](context.md) và [báo cáo tiến độ](../reports/demo-progress.md) (mục 11); báo cáo khách hàng và CTO | Viết code tính năng; tự quyết phạm vi hoặc deadline; merge khi còn tiêu chí chưa đạt; merge vào `main`; tự tích hợp tài liệu của chính TL khi khách hàng chưa giao quyền cho đợt đó |
| Senior Dev | Nhận task theo mục 3.1, triển khai, mở PR nhắm vào `develop`, tự kiểm tra, bàn giao cho TL theo mục 6.1 | Mở rộng phạm vi; tự tạo task; chuyển `Done`; merge |

`develop` là nguồn đối chiếu trạng thái. Code chỉ có trên nhánh feature/preview chưa được tính là xong. Tài liệu TL soạn giữ `Chờ Review` tới khi khách hàng và CTO xác nhận. TL chỉ commit và tích hợp tài liệu của chính mình khi khách hàng giao quyền rõ cho đợt đó (ví dụ đợt 15/11/2026); đã tích hợp không có nghĩa là đã duyệt.

## 2. Luồng

```
TL viết task (Nháp) ─► Khách hàng + CTO chốt ─► TL: Sẵn sàng ─► Senior Dev: Đang làm ─► PR → develop + checklist ─► Chờ Review
                                                                                                                   │
          ┌──── Cần sửa ◄── TL review PR: tiêu chí chưa đạt / chưa xác minh ◄───────────────────────────────────────┤
          │                                                                                                        │ đạt hết
          └─► Senior Dev sửa tại chỗ, checklist vòng mới ─► Chờ Review                                               ▼
                       TL merge ─► TL xác minh trên develop ─► Done ─► báo cáo khách hàng (6.3) + CTO
                       (merge bị chặn → giữ Chờ Review, báo lý do)
                                                                     │
                       Phản hồi UI của khách hàng (mục 10) ◄─────────┘
```

1. **Viết task.** TL `git fetch origin develop`, ghi SHA cơ sở, viết task theo mục 5 với nguồn và cách kiểm tra cho từng tiêu chí (mục 9), ghi người phụ trách, ưu tiên, ước lượng, phụ thuộc và hạn (mục 3.1). Câu hỏi chưa chốt ghi vào "Quyết định còn mở". Trạng thái `Nháp`.
2. **Chốt và Sẵn sàng.** Khách hàng (cùng CTO với phạm vi và deadline) trả lời quyết định mở và ghi ngày vào dòng `Chốt:`. Khi phạm vi đã duyệt và mọi phụ thuộc chặn đã xong hoặc đã rõ, TL chuyển `Sẵn sàng`. Dòng `Chốt:` cũng cho phép TL merge PR của task khi review đạt.
3. **Nhận và triển khai.** Senior Dev nhận task theo mục 3.1, chuyển `Đang làm`, tạo nhánh `feature/module-<n>-<tên>` (hoặc `fix/…`, `docs/…`) từ SHA cơ sở, commit theo Conventional Commits.
4. **Bàn giao.** Senior Dev mở PR nhắm vào `develop`, ghi bàn giao theo mục 6.1 vào "Lịch sử review" của task, chuyển `Chờ Review`.
5. **Review PR.** TL ghi SHA đầu PR đã review, đối chiếu từng tiêu chí với diff và bằng chứng, kiểm tra PR nhắm `develop`, check bắt buộc đã pass (nếu repo có cấu hình) và merge được (`gh pr view <số> --json baseRefName,headRefOid,mergeable,mergeStateStatus,statusCheckRollup`). Ghi review theo mục 6.2. Chưa đạt → `Cần sửa` + prompt theo mục 7.
6. **Merge.** Không vướng điều kiện chặn ở [mục 9.2](#92-điều-kiện-chặn-merge), mọi tiêu chí và check bắt buộc đạt → TL kiểm tra SHA đầu PR vẫn trùng SHA đã review (khác thì review lại phần thay đổi), rồi `gh pr merge <số> --merge --match-head-commit <sha>` (merge commit như PR #1; không squash/rebase, không push thẳng, không merge `main`). Bị chặn → giữ `Chờ Review`, báo lý do cụ thể (thông báo lỗi, `mergeStateStatus`) cho khách hàng và Senior Dev.
7. **Xác nhận và Done.** TL `git fetch origin develop`, xác nhận merge commit trên `origin/develop`, xác minh lại các tiêu chí trên `develop`, ghi link PR, SHA merge và kết quả vào "Kết quả review", chuyển `Done`, cập nhật [context.md](context.md), cập nhật [docs/tasks/README.md](../tasks/README.md), báo cáo khách hàng theo mục 6.3 và CTO theo mục 6.2.
8. **Dọn nhánh.** Ngay sau bước 7, TL dọn bản local của mình theo mục 2.1 và ghi kết quả vào review (mục 6.2). Senior Dev dọn bản local của mình theo mục 2.1 trước khi nhận task mới (mục 3.1).

### 2.1. Dọn nhánh và worktree sau merge

Áp dụng từ SE-001. Chỉ dọn nhánh/worktree của task đã `Done` mà PR đã có trên `origin/develop`.

1. `git fetch --prune origin`.
2. `git status --porcelain` rỗng (working tree sạch) → `git switch develop` rồi `git merge --ff-only origin/develop`. Không sạch → **dừng, không dọn**; ghi lý do (file nào đang sửa) và dọn ở phiên sau.
3. Mỗi nhánh local của task (nhánh PR và nhánh tài liệu `docs/…` của đợt đó): kiểm tra `git merge-base --is-ancestor <nhánh> origin/develop` rồi `git branch -d <nhánh>`. Không dùng `-D`; `-d` từ chối nghĩa là còn commit chưa lên `develop` → giữ và ghi lý do.
4. Worktree của task (`git worktree list`): `git worktree remove <đường dẫn>`, rồi `git worktree prune`. Windows báo "Filename too long" → `robocopy <thư mục rỗng> <đường dẫn> /MIR`, xóa thư mục, rồi `git worktree prune`.
5. Nhánh trên remote: chỉ **TL** xóa, sau khi nhánh đã nằm trong `origin/develop` — `git push origin --delete <nhánh>`. Senior Dev không xóa nhánh remote.
6. **Không bao giờ xóa:** `develop`, `main`, `preview/module-2-4-demo`, nhánh của task chưa `Done` (ghi lý do giữ).

Ghi vào checklist (TL: mẫu 6.2; Senior Dev: mẫu 6.1 của lần bàn giao kế tiếp) một dòng: `develop` local đã cập nhật tới SHA nào; nhánh/worktree nào đã dọn (local, remote); nhánh/worktree nào còn giữ và lý do.

## 3. Nơi lưu task

**Đã chốt (15/11/2026):** task lưu bằng Markdown trong `docs/tasks/`, không dùng GitHub Issues.

- **Task ID:** `TL-<nnn>` cho task của TL, `SE-<nnn>` cho task của Senior Dev; số tăng dần, không dùng lại. Mỗi task một file `docs/tasks/<ID>-<kebab-case-tên>.md`. Hai hồ sơ lập trước quy ước này (`2026-11-15-…`) giữ ID và đường dẫn cũ để không đổi đường dẫn review.
- [docs/tasks/README.md](../tasks/README.md) là mục lục task theo ID, tên, người phụ trách, ưu tiên, hạn bàn giao review, hạn hoàn tất, trạng thái và tiến độ; mỗi dòng dẫn tới task gốc. Cập nhật mỗi khi tạo task, đổi trạng thái hoặc đổi hạn.
- Mỗi task bắt buộc có các mục: **Nguồn yêu cầu**, **Checklist nghiệm thu**, **Kết quả review**, **Lịch sử review**, **Phản hồi UI** (mẫu ở mục 5).
- Tài liệu TL soạn để khách hàng/CTO phê duyệt cũng có một file trong `docs/tasks/` làm hồ sơ theo dõi phê duyệt.
- Mọi báo cáo (mục 6) dẫn tới đúng file task hoặc tài liệu, để tìm lại được từ báo cáo.

Quy ước tài liệu đi kèm:

- Yêu cầu nghiệp vụ (Function Spec) và thiết kế (Basic Design) nằm trong tài liệu từng module `docs/design/module-<n>-<tên>.md`; không tách `docs/requirements/`.
- Đề cương gốc của đồ án được giữ ngoài repo.

### 3.1. Phân công và nhận task

- **TL giao task:** ghi trong file task và mục lục: người phụ trách (`TL` / `Senior Dev`), ưu tiên (`P1` cao nhất → `P3`), ước lượng (ngày làm việc), phụ thuộc, hạn bàn giao review, hạn hoàn tất. Hạn do khách hàng và CTO chốt; chưa chốt thì ghi `Chờ chốt`.
- **Senior Dev nhận task khi bắt đầu phiên:**
  1. `git fetch origin develop`, ghi SHA. Task trước của mình đã `Done` → dọn bản local theo [mục 2.1](#21-dọn-nhánh-và-worktree-sau-merge) trước khi nhận task mới.
  2. Mở [docs/tasks/README.md](../tasks/README.md). Có task giao cho Senior Dev đang `Cần sửa` hoặc `Đang làm` → tiếp tục task đó (`Cần sửa` trước).
  3. Nếu không, lấy task `Sẵn sàng` giao cho Senior Dev có ưu tiên cao nhất (cùng ưu tiên: hạn bàn giao review sớm hơn, rồi ID nhỏ hơn).
  4. Chuyển `Đang làm` ở cả file task và mục lục, ghi ngày bắt đầu.
  5. Không có task phù hợp → báo TL; không tự tạo task, không nhận task `Nháp`.

## 4. Trạng thái và quyền chuyển

| Từ → Sang | Ai chuyển | Điều kiện |
|---|---|---|
| `Nháp` → `Sẵn sàng` | TL | Có dòng `Chốt:` (phạm vi đã duyệt); phụ thuộc chặn đã xong hoặc đã rõ |
| `Sẵn sàng` → `Đang làm` | Người phụ trách | Nhận theo mục 3.1 |
| `Đang làm` → `Chờ Review` | Senior Dev | Đã mở PR nhắm `develop` và ghi bàn giao đủ checklist (mục 6.1) |
| `Đang làm` → `Chờ Review` (task `TL-`) | TL | Đã gửi báo cáo ngắn + checklist (mục 6) cho khách hàng/CTO |
| `Chờ Review` → `Cần sửa` | TL | Có tiêu chí chưa đạt hoặc chưa xác minh; kèm prompt sửa lại (mục 7) |
| `Cần sửa` → `Chờ Review` | Senior Dev | Đã sửa tại chỗ, ghi checklist vòng mới (mục 8) |
| `Chờ Review` → `Done` | **Chỉ TL** | Đã merge, ghi link PR + SHA merge, mọi tiêu chí có bằng chứng đạt trên `develop` |
| `Chờ Review` → `Done` (task `TL-`) | **Chỉ TL** | Khách hàng/CTO đã xác nhận kết quả (ghi ngày vào "Kết quả review"); phần tài liệu đã có trên `develop` |
| `Done` → `Cần sửa` | TL | Phản hồi UI cho thấy hành vi lệch yêu cầu đã duyệt (mục 10) |

Review đạt nhưng merge bị chặn thì task giữ `Chờ Review`. `Done` nghĩa là TL đã nghiệm thu kỹ thuật và xác nhận tích hợp, không phải khách hàng đã duyệt trải nghiệm.

## 5. Mẫu task

```markdown
# <ID> — <Tên task>

Trạng thái: Nháp
Người phụ trách: <TL | Senior Dev> · Ưu tiên: <P1 | P2 | P3> · Ước lượng: <n ngày làm việc>
Phụ thuộc: <task ID / quyết định, hoặc Không>
Hạn bàn giao review: <ngày | Chờ chốt> · Hạn hoàn tất: <ngày | Chờ chốt>
Ngày thực tế: bắt đầu <…> · bàn giao review <…> · hoàn tất <…>
Chốt: <ngày, do khách hàng ghi>
SHA cơ sở: `origin/develop` @ `<sha>`
PR: <link, Senior Dev ghi khi bàn giao>

## Mục tiêu
<Một đoạn: vấn đề nghiệp vụ và kết quả mong muốn.>

## Output
- <File, endpoint, màn hình hoặc tài liệu phải có khi xong>

## Phạm vi
- Làm: <...>
- Không làm: <...>

## Nguồn yêu cầu
- Yêu cầu/quyết định đã duyệt: <link heading, ví dụ docs/design/module-2-chat.md#3-câu-hỏi-cần-sinh-viên-xác-nhận>
- Function Spec: <link heading>
- Basic Design: <link heading>

## Checklist nghiệm thu
| # | Tiêu chí | Nguồn (yêu cầu / FS / BD) | Cách kiểm tra |
|---|---|---|---|
| AC1 | <Hành vi kiểm chứng được> | <link heading> | <lệnh, kịch bản UI> |
| AC2 | `pnpm build`, `pnpm typecheck`, `pnpm lint` đạt | Quy ước repo | Chạy lệnh |

## Quyết định còn mở
| # | Câu hỏi | Đề xuất mặc định | Chốt |
|---|---|---|---|

## Kết quả review
<TL cập nhật tại chỗ: kết luận mới nhất cho từng AC, SHA đã review, link PR, SHA merge trên develop.>

## Lịch sử review
### Checklist vòng 1
<Bàn giao theo mục 6.1 hoặc 6.2>
#### Review vòng 1
<Review của TL / khách hàng / CTO>

## Phản hồi UI
<Khách hàng ghi theo mục 10. Chưa có thì để "Chưa có".>
```

## 6. Báo cáo và checklist

Checklist bắt buộc với **mọi** lần bàn giao, kể cả sửa lại: Senior Dev khi bàn giao cho TL; TL khi review task của Senior Dev và khi hoàn thành bất kỳ nhiệm vụ nào của mình (task `TL-`, việc khách hàng hoặc CTO giao). Mỗi dòng ghi **tiêu chí — kết quả — bằng chứng**. Mục chưa đạt hoặc chưa xác minh: để trống ô, ghi lý do. Thiếu checklist thì bàn giao chưa đủ để review. Mọi báo cáo dẫn tới file task hoặc tài liệu; chi tiết kỹ thuật ghi trong hồ sơ task.

TL hoàn thành nhiệm vụ: gửi báo cáo ngắn (6.2 cho CTO, 6.3 cho khách hàng) + checklist. Phần có giao diện ghi từng dòng theo dạng **mở ở đâu → làm gì → sẽ thấy gì**, kèm link task để truy vết.

### 6.1. Mẫu bàn giao của Senior Dev

```markdown
**Task** — <task ID> · PR <link> · SHA đầu PR `<sha>` · vòng <n>
**Kết quả** — <1–3 dòng, file/màn hình thay đổi>
**Checklist**
- [x] AC1 <tiêu chí> — <kết quả thực tế> — <bằng chứng: lệnh + đầu ra, ảnh, file:dòng>
- [ ] AC2 <tiêu chí> — <chưa đạt / chưa kiểm tra: lý do>
**Kiểm tra đã chạy** — <lệnh và kết quả>
**Dọn nhánh trước khi nhận task này** (mục 2.1) — `develop` local @ `<sha>`; đã dọn: <nhánh/worktree>; còn giữ: <nhánh — lý do> (task đầu tiên hoặc không có gì để dọn: ghi "Không có")
**Trạng thái** — Chờ Review
```

### 6.2. Mẫu review và báo cáo kỹ thuật của TL

Dùng khi review task của Senior Dev và khi báo cáo kỹ thuật cho CTO hoặc bàn giao việc được giao.

```markdown
**Task hoặc yêu cầu** — <task ID / tên ngắn> · PR <link> · SHA đã review `<sha>` · vòng <n>
**Kết luận** — <Đạt / Cần sửa / Bị chặn merge: lý do>
**Checklist**
- [x] AC1 <tiêu chí> — Đạt — <bằng chứng TL tự kiểm tra>
- [ ] AC2 <tiêu chí> — Chưa đạt — <bằng chứng / bước tái hiện>
**Kiểm tra đã chạy** — <lệnh và kết quả>
**Dọn nhánh sau merge** (mục 2.1, khi task `Done`) — `develop` local @ `<sha>`; đã dọn: <nhánh local / remote / worktree>; còn giữ: <nhánh — lý do>
**Trạng thái và bước tiếp theo** — <Chờ Review | Cần sửa | Done>, hồ sơ: <link task>
```

### 6.3. Mẫu báo cáo TL cho khách hàng

Viết bằng ngôn ngữ dễ hiểu, không thuật ngữ kỹ thuật. Chi tiết kỹ thuật để trong hồ sơ task.

```markdown
**<Tên tính năng>** — <Đã xong và đã đưa vào develop / Đang chờ duyệt> · Hồ sơ: <link task>

**Làm được gì** — <1–3 câu theo góc nhìn người dùng>
**Mở ở đâu** — <đường dẫn trang, ví dụ http://localhost:3000/chat; hoặc: chưa có môi trường để thử, cách thử khả dụng là …>

**Thử trên giao diện**
- [ ] Mở <trang> → <làm gì> → <sẽ thấy gì>
- [ ] Mở <trang> → <làm gì> → <sẽ thấy gì>

**Cần anh/chị chốt** — <chỉ câu hỏi ảnh hưởng trải nghiệm, phạm vi hoặc ưu tiên; không có thì ghi "Không có">
```

Không có giao diện để thử (ví dụ tài liệu) thì bỏ phần "Thử trên giao diện" và ghi cách xem nội dung.

## 7. Yêu cầu sửa lại

Khi chuyển `Cần sửa`, TL ghi vào task một prompt giao thẳng cho Senior Dev:

```markdown
**Yêu cầu sửa lại — <task ID>** (review vòng <n>, SHA đã review `<sha>`)

1. **AC<k> chưa đạt:** <trích đúng tiêu chí>
   - Bằng chứng / bước tái hiện: <lệnh, đầu ra, ảnh, file:dòng>
   - Kết quả mong đợi: <...>
   - Cách kiểm tra lại: <lệnh hoặc kịch bản>

Sau khi sửa: cập nhật cùng PR, thêm checklist vòng <n+1> theo mục 8, chuyển task về `Chờ Review`.
```

## 8. Bàn giao lại

Áp dụng cho Senior Dev với task `Cần sửa` và TL với tài liệu chờ phê duyệt.

1. **Cập nhật tại chỗ.** Sửa trên cùng tài liệu, file task, nhánh và PR. Giữ nguyên task ID và đường dẫn review; không tạo bản sao hay PR mới.
2. **Giữ lịch sử.** Thêm `### Checklist vòng <n>` (và `#### Review vòng <n>`) vào cuối "Lịch sử review". Không sửa hoặc xóa checklist và nhận xét các vòng trước.
3. **Checklist vòng mới bắt buộc**, đối chiếu: từng yêu cầu sửa của vòng trước (kết quả + bằng chứng); các tiêu chí đã đạt nhưng bị ảnh hưởng (kết quả kiểm tra lại); mục thiếu hoặc chưa xác minh (để trống + lý do). Với PR: ghi SHA đầu PR mới.
4. **Gửi ngắn gọn.** Chỉ gồm link hồ sơ (task/tài liệu/PR), checklist vòng mới, vị trí lịch sử (anchor `#checklist-vòng-<n>`). Checklist cũ chưa có đường dẫn thì đính kèm ngay dưới checklist mới. Không gửi lại toàn văn tài liệu.
5. **Review lại trên cùng hồ sơ.** TL đối chiếu checklist mới với nhận xét các vòng trước, ghi `Review vòng <n>` và cập nhật "Kết quả review", rồi tiếp tục mục 2 bước 5–7. Tài liệu của TL: khách hàng và CTO review trên cùng tài liệu và lịch sử.

## 9. Nghiệm thu kỹ thuật (TL)

- **Khi soạn task:** mỗi tiêu chí ghi nguồn yêu cầu hoặc quyết định đã duyệt, mục Function Spec và Basic Design áp dụng, và cách kiểm tra. Các nội dung nằm chung trong tài liệu module thì dẫn tới đúng heading (ví dụ `docs/design/module-1-auth.md#21-token-so-sánh-và-lựa-chọn`).
- **Nguồn chưa rõ hoặc mâu thuẫn:** ghi câu hỏi cụ thể vào "Quyết định còn mở" (nêu các nguồn đang lệch) và để khách hàng chốt trước khi kết luận tiêu chí đó đạt.
- **Khi review:** mỗi tiêu chí có kết luận riêng và bằng chứng TL tự kiểm tra; không dựa duy nhất vào báo cáo của Senior Dev.

### 9.1. Trách nhiệm hai vai về phân quyền, giao diện và phát hành

Chuẩn áp dụng: [ma trận phân quyền](../design/access-control.md) và [chuẩn giao diện + tiêu chí phát hành](../design/ui-release-standards.md).

| Việc | Senior Dev | TL |
|---|---|---|
| Phân quyền | Mọi endpoint mới mặc định yêu cầu đăng nhập; dữ liệu cá nhân lọc theo `userId` người gọi; quyền quản trị tài khoản không mở quyền đọc nội dung Chat/tài liệu; cập nhật ma trận khi thêm màn hình/API | Viết tiêu chí quyền vào task; tự kiểm tra ca được phép và bị từ chối bằng **hai tài khoản cùng vai** + một tài khoản khác vai; ghi chính sách chưa rõ vào "Quyết định còn mở" |
| Giao diện | Theo chuẩn mục 1 của tài liệu giao diện; tự kiểm tra trạng thái trống/tải/lỗi/thành công, desktop + mobile 375px, sáng + tối, vi + en | Kiểm tra lại trên UI; ghi phản hồi theo mục 10 |
| Chế độ phát hành | Tính năng chưa sẵn sàng phải ẩn được ở chế độ `staff`; không đổi hành vi chế độ `demo` đã chốt | Đối chiếu bảng tính năng theo chế độ trước khi merge |
| Dữ liệu thử | Tạo tài khoản/dữ liệu thử có tên nhận diện được; xóa hoặc khóa sau kiểm tra, ghi lại trong checklist | Như Senior Dev |

**Checklist hai vai** — thêm vào checklist bàn giao (Senior Dev, mẫu 6.1) và review (TL, mẫu 6.2) của mọi task có API hoặc giao diện; mục không áp dụng ghi "Không áp dụng — lý do":
- [ ] Quyền: ca được phép — <lệnh/ảnh>; ca bị từ chối (chưa đăng nhập `401`, sai vai `403`, dữ liệu người khác `404`) — <lệnh/ảnh>
- [ ] Đường dẫn trực tiếp tới màn hình không có quyền hiển thị đúng thông báo — <ảnh>
- [ ] Trạng thái trống / tải / lỗi / thành công — <ảnh hoặc file:dòng>
- [ ] Desktop + mobile 375px, sáng + tối, vi + en — <ảnh>
- [ ] Chế độ `demo` / `staff` hiển thị đúng bảng tính năng — <ảnh hoặc "Không áp dụng">
- [ ] Ma trận quyền / chuẩn giao diện đã cập nhật nếu có thay đổi — <link diff>
- [ ] Dữ liệu thử đã dọn — <tài khoản/dữ liệu, cách dọn>

### 9.2. Điều kiện chặn merge

TL **không merge** (giữ `Chờ Review` hoặc chuyển `Cần sửa`) khi có một trong các điều sau:
1. Có tiêu chí chưa đạt hoặc chưa xác minh, hoặc thiếu checklist hai vai cho task có API/giao diện.
2. Lỗi phân quyền: đọc/sửa được dữ liệu của người khác, vai `USER` gọi được API quản trị, endpoint mới không yêu cầu đăng nhập mà không có lý do đã duyệt.
3. Chính sách quyền liên quan còn ở "Quyết định còn mở" mà task đã cài hành vi khác đề xuất mặc định.
4. `pnpm build`, `pnpm typecheck` hoặc `pnpm lint` lỗi; PR chứa thay đổi ngoài phạm vi.
5. Thay đổi hành vi chế độ `demo` trong khi bản demo đang chốt (đến hết buổi demo), trừ khi sửa lỗi chặn demo và khách hàng đồng ý.
6. SHA đầu PR khác SHA đã review, PR không nhắm `develop`, hoặc `mergeStateStatus` không phải `CLEAN`.
7. Tài liệu thiết kế/ma trận quyền chưa khớp code.

Phát hiện lỗi chặn demo hoặc lỗi phân quyền ở bất kỳ đâu: TL báo khách hàng + CTO ngay (ảnh hưởng, phạm vi, đề xuất xử lý), không chờ báo cáo cuối ngày.

## 10. Phản hồi UI

- Khách hàng thử theo checklist ở báo cáo 6.3 và ghi phản hồi vào mục "Phản hồi UI" của cùng task (TL ghi hộ nếu khách hàng phản hồi qua tin nhắn), kèm ngày.
- **Lệch yêu cầu đã duyệt** → TL mở lại task (`Done` → `Cần sửa`) với prompt theo mục 7.
- **Muốn đổi hoặc thêm hành vi** → TL ghi thành yêu cầu tiếp theo (task mới ở trạng thái `Nháp`, dẫn ngược về task cũ) để khách hàng chốt ưu tiên; task cũ giữ `Done`.

## 11. Theo dõi tiến độ

- **Hai hạn riêng:** *hạn bàn giao review* (task sang `Chờ Review`) và *hạn hoàn tất* (task `Done`). Khách hàng và CTO chốt hạn trong [plan.md](plan.md); chưa chốt ghi `Chờ chốt`.
- **Cột Tiến độ** trong [docs/tasks/README.md](../tasks/README.md):
  - Task đang mở — so ngày dự kiến với hạn gần nhất chưa qua: `Đúng kế hoạch` (dự kiến ≤ hạn); `Có nguy cơ trễ` (dự kiến > hạn, hoặc phụ thuộc chặn chưa xong khi còn ≤ 1 ngày làm việc); `Quá hạn` (đã qua hạn mà chưa đạt mốc). Hạn `Chờ chốt` → `Chưa đánh giá (chờ chốt hạn)`.
  - Task đã xong — ghi ngày thực tế và kết luận so với hạn hoàn tất: `Sớm`, `Đúng hạn` hoặc `Trễ`.
  - Senior Dev đã bàn giao nhưng task chưa `Done` → ghi rõ "Senior Dev đã bàn giao <ngày>; chờ TL review" hoặc "… chờ tích hợp", để biết ai giữ bước tiếp theo.
- **Báo cáo tiến độ** ở [docs/reports/demo-progress.md](../reports/demo-progress.md), theo mốc của plan. Giai đoạn demo: TL cập nhật cuối mỗi ngày làm việc và ngay khi phát hiện nguy cơ trễ mốc. Mỗi lần thêm một mục mới ở đầu, giữ các mục cũ.

## 12. Nguyên tắc chung

Nguyên tắc đã thống nhất (hỏi trước code sau, ưu tiên demo sớm, đầu chờ cho phần chưa tích hợp, tách lớp rõ ràng) và quy ước Git xem [overview-and-decisions.md](overview-and-decisions.md) mục 2 và 4.
