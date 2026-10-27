import type { Request } from 'express';

export interface RequestMeta {
  ip: string | null;
  userAgent: string | null;
}

/** Thông tin thiết bị để hiển thị trong danh sách phiên đăng nhập. */
export function getRequestMeta(req: Request): RequestMeta {
  const userAgent = req.headers['user-agent'];
  return {
    ip: req.ip ?? null,
    userAgent: userAgent ? userAgent.slice(0, 512) : null,
  };
}
