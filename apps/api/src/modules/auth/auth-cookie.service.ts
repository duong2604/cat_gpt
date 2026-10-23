import { Injectable } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_COOKIE_PATH,
  REFRESH_TOKEN_COOKIE,
} from '../../common/constants.js';
import { AppConfigService } from '../../config/app-config.service.js';

/**
 * Quản lý cookie xác thực.
 * - httpOnly: JavaScript phía trình duyệt không đọc được → chống đánh cắp token qua XSS.
 * - sameSite=lax: chặn phần lớn CSRF (cookie không gửi kèm request POST từ site khác).
 * - Cookie refresh chỉ gửi tới /api/v1/auth/* để giảm bề mặt lộ token.
 */
@Injectable()
export class AuthCookieService {
  constructor(private readonly config: AppConfigService) {}

  private base(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.auth.cookieSecure,
      sameSite: 'lax',
    };
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const { accessTtlSeconds, refreshTtlDays } = this.config.auth;
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...this.base(),
      path: '/',
      maxAge: accessTtlSeconds * 1000,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.base(),
      path: REFRESH_COOKIE_PATH,
      maxAge: refreshTtlDays * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { ...this.base(), path: '/' });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { ...this.base(), path: REFRESH_COOKIE_PATH });
  }
}
