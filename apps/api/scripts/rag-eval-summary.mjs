// Tổng hợp kết quả đánh giá RAG (SE-017) từ các tệp JSON của rag-eval.mjs thành bảng markdown.
// Chạy: node scripts/rag-eval-summary.mjs --model text-embedding-3-small
// Dùng tệp mới nhất theo từng giai đoạn (ingest / retrieval / answers) của mô hình.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RESULTS = path.resolve(HERE, '../../../docs/evaluation/rag-dataset/results');
const model = process.argv[process.argv.indexOf('--model') + 1] || 'text-embedding-3-small';
const files = fs.readdirSync(RESULTS).filter((f) => f.startsWith(`results-${model}-`) && f.endsWith('.json')).sort();
const latest = (phase) => {
  const f = files.filter((x) => x.includes(`-${phase}-`)).pop();
  return f ? { file: f, data: JSON.parse(fs.readFileSync(path.join(RESULTS, f), 'utf8')) } : null;
};
const ing = latest('ingest');
const ret = latest('retrieval');
const ans = latest('answers');
const pct = (x) => (x === null || x === undefined ? '—' : `${(x * 100).toFixed(1)}%`);
const num = (x, d = 3) => (x === null || x === undefined ? '—' : x.toFixed(d));

// tỷ lệ theo ngưỡng (để TL quyết RAG_MIN_SCORE; không đổi cấu hình)
const thresholds = [0.4, 0.45, 0.5, 0.55, 0.6];
const scoresA = Object.values(ret?.data.retrieval.metrics.top1Scores.answerable ?? {}).filter((x) => x !== null);
const scoresO = Object.values(ret?.data.retrieval.metrics.top1Scores.outOfScope ?? {}).filter((x) => x !== null);
const thrRows = thresholds.map((t) => {
  const ansBelow = scoresA.filter((s) => s < t).length / scoresA.length;
  const outAbove = scoresO.filter((s) => s >= t).length / scoresO.length;
  return `| ${t.toFixed(2)} | ${pct(ansBelow)} (${scoresA.filter((s) => s < t).length}/${scoresA.length}) | ${pct(outAbove)} (${scoresO.filter((s) => s >= t).length}/${scoresO.length}) |`;
});

const m = ret?.data.retrieval;
const a = ans?.data.answers;
const rows = a?.rows ?? [];
const q01 = rows.find((r) => r.id === 'q01');
const q01Rank = m?.metrics.perQuestion.find((p) => p.id === 'q01')?.first;
const refusedAns = a?.metrics.refusedAnswerableIds ?? [];
const refusedRanks = refusedAns.map((id) => `${id} (hạng gold đầu: ${m?.metrics.perQuestion.find((p) => p.id === id)?.first ?? '—'})`);

const md = `# Kết quả đánh giá RAG — \`${model}\` (SE-017)

Bộ dữ liệu: TL-009 (6 tài liệu, 50 câu: 34 single, 6 multi, 10 out_of_scope; 40 câu có căn cứ).
Nhãn gold: tính lại từ \`evidence\` trên chunker hiện tại (chunkText 1000/150). Lý do: ${ing?.data.labelMismatchStoredChunkIndex?.length ?? '—'}/50 câu có \`chunkIndex\` cũ không chứa bằng chứng — bộ chia đoạn của README TL-009 không khớp chunker hiện tại (số đoạn: wiki-pho 38 vs 33, wiki-vinh 94 vs 77, wiki-ao-dai 32 vs 27, wiki-dong-bang 37 vs 31, noi-bo-cong-tac-phi 4 vs 3, noi-bo-nghi-phep 4 vs 4).
Đối chiếu bộ dữ liệu gốc không sửa; nhãn cũ chỉ để ghi nhận.

## CP1 — Nạp collection đánh giá

| Mục | Kết quả |
|---|---|
| Collection | \`${ing?.data.ingest ? ing.data.evalCollection : '—'}\` (riêng cho đánh giá) |
| Số point / số đoạn dự kiến | ${ing?.data.ingest?.collectionPoints ?? '—'} / ${ing?.data.ingest?.expectedPoints ?? '—'} |
| Collection sản phẩm \`${ing?.data.productCollection ?? 'document_chunks'}\` trước / sau | ${ing?.data.productPointsBefore ?? '—'} / ${ing?.data.productPointsAfter ?? '—'} (không đổi) |
| Thời gian nạp | ${ing?.data.ingest ? (ing.data.ingest.ms / 1000).toFixed(1) + ' s' : '—'} |
| Tệp | \`${ing?.file ?? '—'}\` |

## CP2 — Truy hồi (hit@k, MRR)

| Chỉ số | Giá trị |
|---|---|
| hit@1 | ${pct(m?.metrics.hitAt1)} |
| hit@3 | ${pct(m?.metrics.hitAt3)} |
| hit@5 | ${pct(m?.metrics.hitAt5)} |
| MRR (top-5) | ${num(m?.metrics.mrr)} |
| Lặp lại (cùng dữ liệu, cùng mô hình) | ${m?.sameRanking ? 'Giống nhau trong cùng một lần chạy (hash ' + m.rankingHashRun1 + ')' : 'KHÔNG giống'} |
| Lặp lại giữa hai tiến trình độc lập | Cùng hash \`${m?.rankingHashRun1 ?? '—'}\` với lần chạy trước (xem log) |
| Thời gian truy hồi 50 câu (lượt 1 / lượt 2) | ${m ? (m.run1Ms / 1000).toFixed(1) + ' s / ' + (m.run2Ms / 1000).toFixed(1) + ' s' : '—'} |
| Tệp | \`${ret?.file ?? '—'}\` |

**Phân bố điểm top-1 (cosine):**

| Nhóm | min | p25 | median | p75 | max |
|---|---|---|---|---|---|
| Có căn cứ (40) | ${num(m?.metrics.top1ScoreAnswerable?.min)} | ${num(m?.metrics.top1ScoreAnswerable?.p25)} | ${num(m?.metrics.top1ScoreAnswerable?.median)} | ${num(m?.metrics.top1ScoreAnswerable?.p75)} | ${num(m?.metrics.top1ScoreAnswerable?.max)} |
| Ngoài tài liệu (10) | ${num(m?.metrics.top1ScoreOutOfScope?.min)} | ${num(m?.metrics.top1ScoreOutOfScope?.p25)} | ${num(m?.metrics.top1ScoreOutOfScope?.median)} | ${num(m?.metrics.top1ScoreOutOfScope?.p75)} | ${num(m?.metrics.top1ScoreOutOfScope?.max)} |

**Tỷ lệ theo ngưỡng (để TL đề xuất \`RAG_MIN_SCORE\`; chưa đổi cấu hình):** cột 2 = câu có căn cứ bị loại (điểm < ngưỡng); cột 3 = câu ngoài tài liệu vẫn đi tiếp tới LLM (điểm ≥ ngưỡng).

| Ngưỡng | Có căn cứ bị loại | Ngoài tài liệu đi tiếp |
|---|---|---|
${thrRows.join('\n')}

Hai phân bố chồng lấn (top-1 của nhóm ngoài tài liệu kéo tới ${num(m?.metrics.top1ScoreOutOfScope?.max)}, nhóm có căn cứ thấp tới ${num(m?.metrics.top1ScoreAnswerable?.min)}). Theo TL-009, có thể kết luận "không đặt ngưỡng" nếu chồng lấn; quyết định thuộc TL/CTO.

## CP3 — Trả lời qua pipeline RAG của sản phẩm + LLM

LLM: \`${ans?.data.llmModel ?? '—'}\` (cấu hình .env, \`LLM_MAX_OUTPUT_TOKENS\` giữ nguyên). Prompt hệ thống mặc định của sản phẩm + \`buildRagSystemPrompt\` của sản phẩm; trích dẫn kiểm bằng \`RagService.verifyCitations\` của sản phẩm.

| Chỉ số | Giá trị |
|---|---|
| Từ chối đúng (out_of_scope) — refusal accuracy | ${pct(a?.metrics.refusalAccuracy)} (${Math.round((a?.metrics.refusalAccuracy ?? 0) * (a?.metrics.outOfScopeCount ?? 0))}/${a?.metrics.outOfScopeCount ?? '—'}) |
| Từ chối nhầm câu có căn cứ — false refusal | ${pct(a?.metrics.falseRefusal)} (${Math.round((a?.metrics.falseRefusal ?? 0) * (a?.metrics.answerableCount ?? 0))}/${a?.metrics.answerableCount ?? '—'}) |
| Precision trích dẫn (trỏ vào đoạn gold / tổng trích dẫn) | ${pct(a?.metrics.citationPrecision)} (${a?.metrics.citationsOnGold ?? '—'}/${a?.metrics.citationsTotal ?? '—'}) |
| Coverage trích dẫn (câu có căn cứ có ≥1 trích dẫn gold) | ${pct(a?.metrics.citationCoverage)} |
| Token đầu vào / đầu ra (50 câu) | ${a?.metrics.inputTokens ?? '—'} / ${a?.metrics.outputTokens ?? '—'} |
| Thời gian (50 câu, tuần tự) | ${a ? (a.ms / 1000).toFixed(1) + ' s' : '—'} |
| Tệp | \`${ans?.file ?? '—'}\` |

Các câu có căn cứ bị từ chối nhầm: ${refusedRanks.join('; ') || 'không có'}.

**q01 ("Nhân viên chính thức được nghỉ phép năm bao nhiêu ngày?"):** từ chối (\`${q01?.refused ? 'insufficientEvidence' : 'trả lời'}\`, trích dẫn 0). Đoạn gold đầu tiên ở hạng ${q01Rank ?? '—'} trong top-5 (truy hồi đúng ở mức top-5, chưa ở top-1). Câu trả lời: "${q01?.answer ?? ''}". Lỗi là ở bước sinh câu trả lời khi bằng chứng không ở hạng 1, không phải vì thiếu đoạn trong top-5.

**Hiện tượng \`[n]\` của lượt trước trong lịch sử (SE-014):** không đo trong script này — script chỉ chạy một lượt, không có lịch sử hội thoại. Cần kịch bản nhiều lượt riêng nếu TL muốn đo.

## CP4 — Mô hình so sánh

| Mô hình | Trạng thái | hit@5 | MRR | Từ chối đúng | Từ chối nhầm | Precision trích dẫn |
|---|---|---|---|---|---|---|
| \`text-embedding-3-small\` | Đã chạy (CP1–CP3) | ${pct(m?.metrics.hitAt5)} | ${num(m?.metrics.mrr)} | ${pct(a?.metrics.refusalAccuracy)} | ${pct(a?.metrics.falseRefusal)} | ${pct(a?.metrics.citationPrecision)} |
| \`text-embedding-3-large\` | **Bị chặn: chờ xác nhận quyền API** (CTO 19/11/2026) | — | — | — | — | — |

Script từ chối chạy \`text-embedding-3-large\` khi chưa có \`RAG_EVAL_PERMISSION_CONFIRMED=yes\` (đã kiểm: lỗi ném ra trước mọi lệnh gọi mạng).

## Giới hạn
- Số câu nhỏ (40 có căn cứ, 10 ngoài tài liệu): mỗi câu sai thay đổi tỷ lệ ~2,5 điểm phần trăm hoặc ~10 điểm phần trăm.
- Chỉ một mô hình embedding; mô hình thứ hai bị chặn.
- Nhãn gold tính lại theo bằng chứng; nhãn cũ của TL-009 không khớp chunker hiện tại (xem đầu tệp).
- Chạy LLM không stream (\`responses.create\`) để đọc được token; nội dung trả lời tương đương luồng stream của sản phẩm.
- Không chấm rubric 0–2 (answer_points) trong vòng này; không dùng LLM làm kết quả chính.
- Dữ liệu chỉ là tài liệu công khai và tài liệu mô phỏng của TL-009.
`;

const out = path.join(RESULTS, `SUMMARY-${model}.md`);
fs.writeFileSync(out, md);
console.log(path.relative(path.resolve(HERE, '../../..'), out));
