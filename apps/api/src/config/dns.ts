import dns from 'node:dns';

/**
 * Áp DNS_SERVERS (phân tách bằng dấu phẩy) cho tiến trình. Chuỗi rỗng = giữ nguyên DNS hệ thống
 * (không còn ghi đè ngầm như trước — F07/SE-F7).
 */
export function applyDnsServers(value: string): void {
  const servers = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length > 0) dns.setServers(servers);
}

/** DNS hệ thống đang là loopback (127.x / ::1) — trường hợp gây lỗi SRV của mongodb+srv trên một số máy. */
export function isSystemDnsLoopback(): boolean {
  return dns.getServers().every((s) => s.startsWith('127.') || s === '::1');
}

/** Lỗi phân giải SRV (querySrv) ở bất kỳ tầng nào trong chuỗi `cause`. */
export function isSrvDnsError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 6 && current; depth++) {
    const e = current as { message?: unknown; syscall?: unknown; cause?: unknown };
    if (e.syscall === 'querySrv') return true;
    if (typeof e.message === 'string' && e.message.includes('querySrv')) return true;
    current = e.cause;
  }
  return false;
}
