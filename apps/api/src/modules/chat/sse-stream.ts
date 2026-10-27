import type { Response } from 'express';
import type { ChatStreamEvent } from '@cat-gpt/shared';

/** Gửi comment định kỳ để proxy/trình duyệt không cắt kết nối khi LLM "suy nghĩ" lâu. */
const HEARTBEAT_MS = 15_000;

/**
 * Ghi Server-Sent Events lên Express Response.
 * Chỉ gọi `open()` sau khi đã kiểm tra quyền/dữ liệu xong: lỗi trước đó vẫn trả JSON bình thường.
 */
export class SseStream {
  private heartbeat?: NodeJS.Timeout;

  constructor(private readonly res: Response) {}

  /** `onClientClose` được gọi khi client ngắt kết nối trước khi stream kết thúc. */
  open(onClientClose: () => void): void {
    this.res.status(200);
    this.res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    // no-transform: chặn các lớp nén (compression, proxy) gom buffer làm mất hiệu ứng chữ chạy.
    this.res.setHeader('Cache-Control', 'no-cache, no-transform');
    this.res.setHeader('Connection', 'keep-alive');
    // Nginx mặc định buffer response; header này tắt buffer cho riêng endpoint SSE.
    this.res.setHeader('X-Accel-Buffering', 'no');
    this.res.flushHeaders();

    this.heartbeat = setInterval(() => this.res.write(': ping\n\n'), HEARTBEAT_MS);
    this.res.on('close', () => {
      clearInterval(this.heartbeat);
      if (!this.res.writableEnded) onClientClose();
    });
  }

  send(event: ChatStreamEvent): void {
    if (!this.res.writableEnded) this.res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  end(): void {
    clearInterval(this.heartbeat);
    if (!this.res.writableEnded) this.res.end();
  }
}
