import type { ChatStreamEvent } from '@cat-gpt/shared';

/** Gửi comment định kỳ để proxy/trình duyệt không cắt kết nối khi LLM "suy nghĩ" lâu. */
const HEARTBEAT_MS = 15_000;

/**
 * Chuyển một lượt chat thành phản hồi `text/event-stream` (Native Streaming Responses).
 * Đây là nơi duy nhất biết định dạng SSE: khối `data: <json>\n\n`, heartbeat `: ping\n\n`, header.
 *
 * - `run(emit)` chạy khi stream bắt đầu; mỗi event gửi qua `emit` (bỏ qua nếu client đã ngắt).
 * - Khi `run` xong, stream đóng.
 * - Client ngắt (NestJS gọi `cancel`, kể cả trước chunk đầu): dừng heartbeat và gọi `onCancel()`.
 *   `run` vẫn chạy tới khi kết thúc (đã hủy) để lưu trạng thái và nhả khóa.
 */
export function toSseResponse(
  run: (emit: (event: ChatStreamEvent) => void) => Promise<void>,
  onCancel: () => void,
): Response {
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let closed = false;
  const stop = () => {
    closed = true;
    clearInterval(heartbeat);
  };
  const stream = new ReadableStream<string>({
    start(controller) {
      const write = (text: string) => {
        if (!closed) controller.enqueue(text);
      };
      heartbeat = setInterval(() => write(': ping\n\n'), HEARTBEAT_MS);
      // run tự ghi log lỗi của nó; ở đây chỉ bảo đảm đóng stream và không để promise bị từ chối.
      void run((event) => write(`data: ${JSON.stringify(event)}\n\n`))
        .catch(() => undefined)
        .finally(() => {
        if (!closed) {
          stop();
          controller.close();
        }
      });
    },
    cancel() {
      stop();
      onCancel();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
