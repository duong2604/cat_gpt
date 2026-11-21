import { type ApiErrorBody, type ChatStreamEvent, ErrorCode } from "@cat-gpt/shared";
import { recoverFromUnauthorized } from "@/lib/api/client";
import { ApiError, NETWORK_ERROR } from "@/lib/api/errors";

const API_BASE = "/api/v1";

/**
 * Gọi endpoint SSE bằng `fetch` (EventSource chỉ hỗ trợ GET, axios không đọc được stream trên trình duyệt).
 * - Gặp 401 → refresh token một lần rồi gửi lại (dùng chung cơ chế với axios), trước khi stream mở.
 * - Lỗi HTTP trước khi mở stream → ném ApiError mang mã lỗi của API.
 * - Mất kết nối giữa chừng → ném lỗi mạng; không tự gửi lại POST.
 * - Bị hủy qua `signal` → kết thúc êm, không ném lỗi.
 */
export async function streamChat(
  path: string,
  body: unknown,
  onEvent: (event: ChatStreamEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await post(path, body, signal);
    if (res.status === 401 && (await recoverFromUnauthorized(await errorCode(res)))) {
      res = await post(path, body, signal);
    }
  } catch (error) {
    if (signal.aborted) return;
    throw error instanceof ApiError ? error : new ApiError(NETWORK_ERROR);
  }

  if (!res.ok || !res.body) throw new ApiError((await errorCode(res)) ?? ErrorCode.INTERNAL_ERROR);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  const parser = new SseParser(onEvent);
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      parser.feed(value);
    }
  } catch (error) {
    if (signal.aborted) return;
    throw error instanceof ApiError ? error : new ApiError(NETWORK_ERROR);
  }
}

/**
 * Bộ phân tích SSE theo đặc tả (text/event-stream), đọc theo từng dòng:
 * - Dòng kết thúc bằng `\r\n`, `\n` hoặc `\r`. `\r` kết thúc dòng ngay (kể cả cuối chunk); cờ `afterCR`
 *   nhớ rằng vừa gặp `\r`, để `\n` ngay sau (có thể nằm ở chunk sau) bị bỏ qua.
 * - Dòng trống kết thúc một event. Dòng bắt đầu bằng `:` là comment (heartbeat) và bị bỏ qua.
 * - Trường `data` (nhiều dòng nối bằng `\n`), `event` (tên). `id` và `retry` được đọc rồi bỏ.
 * - Event không có tên hoặc tên `message` → JSON.parse → onEvent. Tên `error` → onEvent lỗi chung.
 *   Tên khác → bỏ qua.
 */
class SseParser {
  /** Phần dòng chưa kết thúc (có thể trải qua nhiều chunk). */
  private pending = "";
  /** Vừa gặp `\r`: nếu ký tự kế tiếp là `\n` thì bỏ qua (CRLF). */
  private afterCR = false;
  private data: string[] = [];
  private eventName = "";

  constructor(private readonly onEvent: (event: ChatStreamEvent) => void) {}

  feed(chunk: string): void {
    let lineStart = 0;
    for (let i = 0; i < chunk.length; i++) {
      const c = chunk[i];
      if (this.afterCR) {
        this.afterCR = false;
        if (c === "\n") {
          lineStart = i + 1;
          continue;
        }
      }
      if (c !== "\r" && c !== "\n") continue;
      this.line(this.pending + chunk.slice(lineStart, i));
      this.pending = "";
      lineStart = i + 1;
      this.afterCR = c === "\r";
    }
    this.pending += chunk.slice(lineStart);
  }

  private line(line: string): void {
    if (line === "") {
      this.dispatch();
      return;
    }
    if (line.startsWith(":")) return;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "data") this.data.push(value);
    else if (field === "event") this.eventName = value;
  }

  private dispatch(): void {
    const { data, eventName } = this;
    this.data = [];
    this.eventName = "";
    if (data.length === 0) return;
    if (eventName === "error") {
      this.onEvent({ type: "error", code: ErrorCode.INTERNAL_ERROR });
      return;
    }
    if (eventName !== "" && eventName !== "message") return;
    this.onEvent(JSON.parse(data.join("\n")) as ChatStreamEvent);
  }
}

function post(path: string, body: unknown, signal: AbortSignal): Promise<Response> {
  return fetch(API_BASE + path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
}

async function errorCode(res: Response): Promise<ErrorCode | undefined> {
  try {
    const code = ((await res.clone().json()) as Partial<ApiErrorBody>).code;
    return code && code in ErrorCode ? code : undefined;
  } catch {
    return undefined;
  }
}
