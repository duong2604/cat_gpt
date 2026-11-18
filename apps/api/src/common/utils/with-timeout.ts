/**
 * Giới hạn thời gian chờ một promise. Chỉ chặn việc *chờ* (await) — không dừng được
 * công việc CPU đồng bộ đang chạy bên trong promise đó (ví dụ vòng lặp bên trong
 * một thư viện bóc tách PDF/DOCX). Dùng cho các lệnh gọi mạng/IO (Redis, v.v.).
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error as Error);
      },
    );
  });
}
