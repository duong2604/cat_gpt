// Đánh giá RAG trên bộ dữ liệu TL-009 (SE-017).
// Chạy: node scripts/rag-eval.mjs --model text-embedding-3-small [--phase all|ingest|retrieval|answers]
// Cần `pnpm build` trước: dùng code đã biên dịch của ứng dụng (chunkText, EmbeddingService,
// VectorStoreService, buildRagSystemPrompt, RagService.verifyCitations, EnvironmentVariables).
// Không ghi collection sản phẩm (QDRANT_COLLECTION); chỉ ghi document_chunks_eval_<model>.
// Không in khóa API. text-embedding-3-large bị chặn cho tới khi có xác nhận quyền API (CTO 19/11/2026).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import OpenAI from 'openai';
import { QdrantClient } from '@qdrant/js-client-rest';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const API = path.resolve(HERE, '..');
const REPO = path.resolve(API, '../..');
const DATASET = path.join(REPO, 'docs/evaluation/rag-dataset');
const RESULTS = path.join(DATASET, 'results');
const TOP_K = 5;
const CHUNK_SIZE = 1000; // DOCUMENT_CHUNK_SIZE mặc định (env.validation.ts)
const CHUNK_OVERLAP = 150; // DOCUMENT_CHUNK_OVERLAP mặc định
const ALLOWED_MODELS = ['text-embedding-3-small'];

const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
};
const MODEL = arg('model', 'text-embedding-3-small');
const PHASE = arg('phase', 'all'); // all | ingest | retrieval | answers
if (!ALLOWED_MODELS.includes(MODEL) && process.env.RAG_EVAL_PERMISSION_CONFIRMED !== 'yes') {
  throw new Error(`Mô hình ${MODEL} chưa được phép chạy (chờ xác nhận quyền API). Không gọi mô hình này.`);
}

// Đọc .env của API; không in giá trị bí mật.
const envFile = Object.fromEntries(
  fs
    .readFileSync(path.join(API, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')];
    }),
);
const OPENAI_API_KEY = envFile.OPENAI_API_KEY;
const QDRANT_URL = envFile.QDRANT_URL;
const PRODUCT_COLLECTION = envFile.QDRANT_COLLECTION || 'document_chunks';
const EVAL_COLLECTION = `document_chunks_eval_${MODEL}`;
const LLM_MODEL = envFile.LLM_MODEL || 'gpt-5.4-mini';
const LLM_MAX_OUTPUT_TOKENS = Number(envFile.LLM_MAX_OUTPUT_TOKENS || 500);

const { chunkText } = await import('../dist/modules/documents/chunk-text.js');
const { EmbeddingService } = await import('../dist/modules/documents/embedding.service.js');
const { VectorStoreService } = await import('../dist/modules/documents/vector-store.service.js');
const { buildRagSystemPrompt } = await import('../dist/modules/rag/rag-prompt.js');
const { RagService } = await import('../dist/modules/rag/rag.service.js');
const { EnvironmentVariables } = await import('../dist/config/env.validation.js');
const SYSTEM_PROMPT = new EnvironmentVariables().LLM_SYSTEM_PROMPT; // prompt hệ thống mặc định của sản phẩm

const cfg = {
  documents: { embeddingModel: MODEL },
  llm: { openAiApiKey: OPENAI_API_KEY },
  qdrant: { url: QDRANT_URL, collection: EVAL_COLLECTION },
};
const embedding = new EmbeddingService(cfg);
const store = new VectorStoreService(cfg);
const qdrant = new QdrantClient({ url: QDRANT_URL });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY, maxRetries: 1 });

const norm = (s) => s.split(/\s+/).filter(Boolean).join(' ');
const questions = fs.readFileSync(path.join(DATASET, 'questions.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const evidenceSrc = JSON.parse(fs.readFileSync(path.join(DATASET, 'questions.src.json'), 'utf8'));
const evidenceById = new Map(evidenceSrc.map((s) => [s.id, (s.evidence ?? []).map(norm)]));
const docFiles = fs.readdirSync(path.join(DATASET, 'docs')).sort();
const docText = Object.fromEntries(docFiles.map((f) => [f, fs.readFileSync(path.join(DATASET, 'docs', f), 'utf8')]));
const docId = (file) => `eval-${file}`;
const fileOf = (id) => id.slice('eval-'.length);

async function chunkAll() {
  const chunks = {};
  for (const f of docFiles) chunks[f] = await chunkText(docText[f], CHUNK_SIZE, CHUNK_OVERLAP);
  return chunks;
}

// Gold theo bằng chứng trên chunker hiện tại: đoạn nào chứa một cụm bằng chứng nguyên văn.
const fileById = new Map(evidenceSrc.map((s) => [s.id, s.file]));
function goldFor(q, chunks) {
  const ev = evidenceById.get(q.id) ?? [];
  const file = fileById.get(q.id);
  if (!file || !chunks[file] || ev.length === 0) return [];
  const hits = [];
  chunks[file].forEach((c, i) => {
    const nc = norm(c);
    if (ev.some((e) => nc.includes(e))) hits.push(i);
  });
  return hits;
}

const sha = (o) => createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 16);

async function ingest(chunks) {
  if ((await qdrant.collectionExists(EVAL_COLLECTION)).exists) await qdrant.deleteCollection(EVAL_COLLECTION);
  const t0 = Date.now();
  let expected = 0;
  for (const f of docFiles) {
    const texts = chunks[f];
    const vectors = await embedding.embedAll(texts);
    await store.upsertChunks('eval', docId(f), texts.map((text, chunkIndex) => ({ chunkIndex, text, vector: vectors[chunkIndex] })));
    expected += texts.length;
  }
  const count = (await qdrant.count(EVAL_COLLECTION, { exact: true })).count;
  return { expectedPoints: expected, collectionPoints: count, ms: Date.now() - t0 };
}

async function retrieveAll(allDocIds) {
  const out = {};
  const t0 = Date.now();
  for (const q of questions) {
    const [v] = await embedding.embedAll([q.question]);
    const res = await store.search(v, { userId: 'eval', documentIds: allDocIds, limit: TOP_K });
    out[q.id] = res.map((r) => ({ file: fileOf(r.documentId), chunkIndex: r.chunkIndex, score: r.score, text: r.text }));
  }
  return { results: out, ms: Date.now() - t0 };
}

function quantiles(xs) {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const at = (p) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
  return { min: s[0], p25: at(0.25), median: at(0.5), p75: at(0.75), max: s[s.length - 1] };
}

function retrievalMetrics(results, golds) {
  const answerable = questions.filter((q) => q.type !== 'out_of_scope');
  const per = answerable.map((q) => {
    const g = golds[q.id];
    const hit = results[q.id].findIndex((r) => g.some((x) => x.file === r.file && x.chunkIndex === r.chunkIndex));
    return { id: q.id, first: hit >= 0 ? hit + 1 : null };
  });
  const hitAt = (k) => per.filter((p) => p.first !== null && p.first <= k).length / per.length;
  const mrr = per.reduce((acc, p) => acc + (p.first ? 1 / p.first : 0), 0) / per.length;
  const outOfScope = questions.filter((q) => q.type === 'out_of_scope');
  const top1Ans = answerable.map((q) => results[q.id][0]?.score).filter((x) => x !== undefined);
  const top1Out = outOfScope.map((q) => results[q.id][0]?.score).filter((x) => x !== undefined);
  return {
    answerableCount: answerable.length,
    hitAt1: hitAt(1),
    hitAt3: hitAt(3),
    hitAt5: hitAt(5),
    mrr,
    top1ScoreAnswerable: quantiles(top1Ans),
    top1ScoreOutOfScope: quantiles(top1Out),
    // điểm top-1 từng câu, để tính tỷ lệ theo ngưỡng RAG_MIN_SCORE (không đổi cấu hình)
    top1Scores: {
      answerable: Object.fromEntries(answerable.map((q) => [q.id, results[q.id][0]?.score ?? null])),
      outOfScope: Object.fromEntries(outOfScope.map((q) => [q.id, results[q.id][0]?.score ?? null])),
    },
    perQuestion: per,
  };
}

async function answerAll(results, golds) {
  const rows = [];
  const t0 = Date.now();
  for (const q of questions) {
    const srcs = results[q.id].map((r) => ({ documentId: docId(r.file), documentName: r.file, chunkIndex: r.chunkIndex, text: r.text }));
    const instructions = [SYSTEM_PROMPT, buildRagSystemPrompt(srcs)].join('\n\n');
    const s0 = Date.now();
    const resp = await openai.responses.create({
      model: LLM_MODEL,
      instructions,
      input: [{ role: 'user', content: q.question }],
      max_output_tokens: LLM_MAX_OUTPUT_TOKENS,
      store: false,
    });
    const text = resp.output_text ?? '';
    const verified = RagService.prototype.verifyCitations.call({ logger: { debug() {} } }, text, srcs);
    const cites = verified.citations.map((c) => ({ file: fileOf(c.documentId), chunkIndex: c.chunkIndex, n: c.n }));
    const g = golds[q.id];
    rows.push({
      id: q.id,
      type: q.type,
      refused: verified.insufficientEvidence,
      answer: text,
      endReason: resp.status === 'incomplete' ? 'max_output_tokens' : 'completed',
      citations: cites,
      citationsOnGold: cites.filter((c) => g.some((x) => x.file === c.file && x.chunkIndex === c.chunkIndex)).length,
      inputTokens: resp.usage?.input_tokens ?? 0,
      outputTokens: resp.usage?.output_tokens ?? 0,
      ms: Date.now() - s0,
    });
  }
  return { rows, ms: Date.now() - t0 };
}

function answerMetrics(rows) {
  const out = rows.filter((r) => r.type === 'out_of_scope');
  const ans = rows.filter((r) => r.type !== 'out_of_scope');
  const allCites = rows.reduce((a, r) => a + r.citations.length, 0);
  const goldCites = rows.reduce((a, r) => a + r.citationsOnGold, 0);
  return {
    refusalAccuracy: out.filter((r) => r.refused).length / out.length,
    outOfScopeCount: out.length,
    falseRefusal: ans.filter((r) => r.refused).length / ans.length,
    answerableCount: ans.length,
    citationPrecision: allCites === 0 ? null : goldCites / allCites,
    citationsTotal: allCites,
    citationsOnGold: goldCites,
    citationCoverage: ans.filter((r) => r.citationsOnGold > 0).length / ans.length,
    inputTokens: rows.reduce((a, r) => a + r.inputTokens, 0),
    outputTokens: rows.reduce((a, r) => a + r.outputTokens, 0),
    refusedAnswerableIds: ans.filter((r) => r.refused).map((r) => r.id),
  };
}

const productExists = async () => (await qdrant.collectionExists(PRODUCT_COLLECTION)).exists;
const productCount = async () => ((await productExists()) ? (await qdrant.count(PRODUCT_COLLECTION, { exact: true })).count : null);

const productBefore = await productCount();
const chunks = await chunkAll();
const golds = Object.fromEntries(questions.map((q) => [q.id, goldFor(q, chunks).map((i) => ({ file: fileById.get(q.id), chunkIndex: i }))]));
const labelMismatch = questions
  .filter((q) => {
    const ev = evidenceById.get(q.id) ?? [];
    return (q.gold ?? []).some((g) => !ev.some((e) => norm(chunks[g.file]?.[g.chunkIndex] ?? '').includes(e)));
  })
  .map((q) => q.id);
const report = {
  model: MODEL,
  llmModel: LLM_MODEL,
  evalCollection: EVAL_COLLECTION,
  productCollection: PRODUCT_COLLECTION,
  productPointsBefore: productBefore,
  chunkCounts: Object.fromEntries(docFiles.map((f) => [f, chunks[f].length])),
  labelMismatchStoredChunkIndex: labelMismatch,
  goldCounts: Object.fromEntries(questions.map((q) => [q.id, golds[q.id].length])),
  phase: PHASE,
};

if (PHASE === 'all' || PHASE === 'ingest') report.ingest = await ingest(chunks);

const allDocIds = docFiles.map(docId);
let retrievalResults = null;
if (PHASE === 'all' || PHASE === 'retrieval' || PHASE === 'answers') {
  const r1 = await retrieveAll(allDocIds);
  retrievalResults = r1.results;
  if (PHASE !== 'answers') {
    const r2 = await retrieveAll(allDocIds);
    const h = (r) => sha(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.map((x) => [x.file, x.chunkIndex])])));
    report.retrieval = {
      run1Ms: r1.ms,
      run2Ms: r2.ms,
      rankingHashRun1: h(r1.results),
      rankingHashRun2: h(r2.results),
      sameRanking: h(r1.results) === h(r2.results),
      metrics: retrievalMetrics(r1.results, golds),
    };
  }
}
if (PHASE === 'all' || PHASE === 'answers') {
  const a = await answerAll(retrievalResults, golds);
  report.answers = { ms: a.ms, metrics: answerMetrics(a.rows), rows: a.rows };
}

report.productPointsAfter = await productCount();
fs.mkdirSync(RESULTS, { recursive: true });
const outFile = path.join(RESULTS, `results-${MODEL}-${PHASE}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
const m = report.retrieval?.metrics;
console.log(
  JSON.stringify(
    {
      model: MODEL,
      phase: PHASE,
      ingest: report.ingest ?? null,
      productPointsBefore: productBefore,
      productPointsAfter: report.productPointsAfter,
      labelMismatchStoredChunkIndex: labelMismatch.length,
      retrieval: m ? { sameRanking: report.retrieval.sameRanking, hitAt1: m.hitAt1, hitAt3: m.hitAt3, hitAt5: m.hitAt5, mrr: m.mrr, top1ScoreAnswerable: m.top1ScoreAnswerable, top1ScoreOutOfScope: m.top1ScoreOutOfScope } : null,
      answers: report.answers ? report.answers.metrics : null,
      file: path.relative(REPO, outFile),
    },
    null,
    2,
  ),
);
