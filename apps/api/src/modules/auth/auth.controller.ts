import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { UserDto } from '@cat-gpt/shared';
import { REFRESH_TOKEN_COOKIE } from '../../common/constants.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { getRequestMeta } from '../../common/utils/request-meta.js';
import { UserResponse } from '../users/dto/user.response.js';
import { UserPresenter } from '../users/user.presenter.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: AuthCookieService,
    private readonly presenter: UserPresenter,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập bằng email và mật khẩu (giới hạn 5 lần/phút/IP)' })
  @ApiOkResponse({ type: UserResponse })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const { user, tokens } = await this.auth.login(dto, getRequestMeta(req));
    this.cookies.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return this.presenter.toDto(user);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cấp lại access token bằng refresh token trong cookie' })
  @ApiNoContentResponse()
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    try {
      const tokens = await this.auth.refresh(
        req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined,
        getRequestMeta(req),
      );
      this.cookies.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    } catch (error) {
      this.cookies.clearAuthCookies(res);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đăng xuất phiên hiện tại' })
  @ApiNoContentResponse()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined);
    this.cookies.clearAuthCookies(res);
  }
}
