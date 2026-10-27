import { type ApiErrorBody, type ChatStreamEvent, ErrorCode } from "@cat-gpt/shared";
import { recoverFromUnauthorized } from "@/lib/api/client";
import { ApiError, NETWORK_ERROR } from "@/lib/api/errors";

const API_BASE = "/api/v1";

/**
 * Gọi endpoint SSE bằng `fetch` (EventSource chỉ hỗ trợ GET, axios không đọc được stream trên trình duyệt).
 * - Gặp 401 → refresh token một lần rồi gửi lại (dùng chung cơ chế với axios).
 * - Lỗi HTTP trước khi mở stream → ném ApiError mang mã lỗi của API.
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
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += value;
      // Mỗi sự kiện SSE kết thúc bằng một dòng trống; dòng bắt đầu bằng ":" là heartbeat.
      let end: number;
      while ((end = buffer.indexOf("\n\n")) >= 0) {
        const raw = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (raw.startsWith("data: ")) onEvent(JSON.parse(raw.slice(6)) as ChatStreamEvent);
      }
    }
  } catch (error) {
    if (signal.aborted) return;
    throw error instanceof ApiError ? error : new ApiError(NETWORK_ERROR);
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
