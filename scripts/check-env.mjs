#!/usr/bin/env node
// SE-010: phát hiện .env lệch .env.example, và env.validation.ts khai báo biến
// thiếu trong .env.example. Chỉ in TÊN biến, không bao giờ in giá trị.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Tên biến khớp `regex` (nhóm bắt đầu tiên) trên từng dòng của một file. */
function namesMatching(path, regex) {
  const names = new Set();
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = regex.exec(line);
    if (m) names.add(m[1]);
  }
  return names;
}

/** Tên biến trong một .env/.env.example — gồm cả dòng mẫu đã comment `# KEY=`. */
const namesInEnvFile = (path) => namesMatching(path, /^#?\s*([A-Z][A-Z0-9_]*)\s*=/);

// ponytail: so khớp theo khuôn "2 dấu cách thụt + TÊN_BIẾN + : hoặc =" thay vì
// phân tích cú pháp TypeScript thật — đủ dùng khi mọi thuộc tính của
// EnvironmentVariables đều viết UPPER_SNAKE_CASE trên một dòng riêng (đúng quy
// ước hiện tại). Nếu sau này có decorator/thuộc tính nhiều dòng phá vỡ khuôn
// này, thay bằng cách import EnvironmentVariables và đọc qua
// Reflect/class-validator thay vì regex.
const namesInEnvValidation = (path) => namesMatching(path, /^\s{2}([A-Z][A-Z0-9_]*)\??\s*[:=]/);

function diff(a, b) {
  return [...a].filter((x) => !b.has(x)).sort();
}

let ok = true;
let apiExampleNames;

// 1. Mỗi apps/*/.env.example có .env cùng thư mục → so tên biến hai chiều.
const appsDir = join(ROOT, 'apps');
for (const app of readdirSync(appsDir)) {
  const example = join(appsDir, app, '.env.example');
  const envFile = join(appsDir, app, '.env');
  if (!existsSync(example)) continue;
  const exampleNames = namesInEnvFile(example);
  if (app === 'api') apiExampleNames = exampleNames;
  if (!existsSync(envFile)) {
    console.log(`[env:check] apps/${app}: không có .env, bỏ qua bước 1`);
    continue;
  }
  const envNames = namesInEnvFile(envFile);
  const missing = diff(exampleNames, envNames);
  const extra = diff(envNames, exampleNames);
  if (missing.length === 0 && extra.length === 0) {
    console.log(`[env:check] apps/${app}: .env khớp .env.example`);
  } else {
    ok = false;
    console.log(`[env:check] apps/${app}: .env LỆCH .env.example`);
    if (missing.length > 0) console.log(`  thiếu trong .env: ${missing.join(', ')}`);
    if (extra.length > 0) console.log(`  thừa trong .env: ${extra.join(', ')}`);
  }
}

// 2. Biến khai báo trong env.validation.ts phải có mặt trong apps/api/.env.example.
const validationNames = namesInEnvValidation(join(appsDir, 'api', 'src', 'config', 'env.validation.ts'));
const missingInExample = diff(validationNames, apiExampleNames);
if (missingInExample.length === 0) {
  console.log('[env:check] env.validation.ts khớp apps/api/.env.example');
} else {
  ok = false;
  console.log('[env:check] env.validation.ts có biến KHÔNG có trong apps/api/.env.example');
  console.log(`  thiếu trong .env.example: ${missingInExample.join(', ')}`);
}

if (!ok) {
  console.error('[env:check] THẤT BẠI');
  process.exit(1);
}
console.log('[env:check] OK');
