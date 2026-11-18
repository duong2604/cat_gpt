"""Gắn nhãn đoạn đúng (gold) cho bộ câu hỏi TL-009.

Đầu vào: questions.src.json (câu hỏi + cụm bằng chứng nguyên văn), chunks.json (đoạn do chunkText của
ứng dụng sinh ra với DOCUMENT_CHUNK_SIZE=1000, DOCUMENT_CHUNK_OVERLAP=150). Đầu ra: questions.jsonl.
Mỗi cụm bằng chứng phải xuất hiện nguyên văn trong ít nhất một đoạn của đúng tệp, nếu không script dừng.
Chạy lại: python label.py <chunks.json>
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent


def norm(s: str) -> str:
    return ' '.join(s.split())


def main(chunks_path: str) -> None:
    chunks = json.loads(Path(chunks_path).read_text(encoding='utf-8'))
    src = json.loads((HERE / 'questions.src.json').read_text(encoding='utf-8'))
    out, problems = [], []
    for q in src:
        gold = []
        for ev in q.get('evidence', []):
            hits = [i for i, c in enumerate(chunks[q['file']]) if norm(ev) in norm(c)]
            if not hits:
                problems.append(f"{q['id']}: không tìm thấy bằng chứng {ev!r} trong {q['file']}")
            gold += [{'file': q['file'], 'chunkIndex': i} for i in hits]
        uniq = sorted({(g['file'], g['chunkIndex']) for g in gold})
        out.append({
            'id': q['id'], 'type': q['type'], 'question': q['question'],
            'gold': [{'file': f, 'chunkIndex': i} for f, i in uniq],
            'answer_points': q.get('answer_points', []),
        })
    if problems:
        sys.exit('\n'.join(problems))
    (HERE / 'questions.jsonl').write_text(
        ''.join(json.dumps(x, ensure_ascii=False) + '\n' for x in out), encoding='utf-8', newline='\n')
    n = {t: sum(1 for x in out if x['type'] == t) for t in ('single', 'multi', 'out_of_scope')}
    print(f'ok: {len(out)} câu {n}')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main(sys.argv[1])
