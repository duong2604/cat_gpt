import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { SessionDto, UserDto } from '@cat-gpt/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { SessionResponse, UserResponse } from '../users/dto/user.response.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { MeService } from './me.service.js';

/** Giới hạn cứng của multer; kiểm tra chi tiết (2MB, magic bytes) nằm trong MeService. */
const UPLOAD_HARD_LIMIT_BYTES = 5 * 1024 * 1024;

@ApiTags('Me (tài khoản hiện tại)')
@ApiCookieAuth()
@Controller('me')
export class MeController {
  constructor(
    private readonly me: MeService,
    private readonly sessions: SessionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Thông tin tài khoản đang đăng nhập' })
  @ApiOkResponse({ type: UserResponse })
  getProfile(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return this.me.getProfile(user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật họ tên, số điện thoại, phòng ban' })
  @ApiOkResponse({ type: UserResponse })
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto): Promise<UserDto> {
    return this.me.updateProfile(user.userId, dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: UPLOAD_HARD_LIMIT_BYTES } }))
  @ApiOperation({ summary: 'Tải lên ảnh đại diện (JPG/PNG/WEBP, tối đa 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: UserResponse })
  uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<UserDto> {
    return this.me.updateAvatar(user.userId, file);
  }

  @Delete('avatar')
  @ApiOperation({ summary: 'Xóa ảnh đại diện' })
  @ApiOkResponse({ type: UserResponse })
  removeAvatar(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return this.me.removeAvatar(user.userId);
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đổi mật khẩu (các thiết bị khác sẽ bị đăng xuất)' })
  @ApiNoContentResponse()
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto): Promise<void> {
    return this.me.changePassword(user, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Danh sách phiên đăng nhập đang hoạt động' })
  @ApiOkResponse({ type: [SessionResponse] })
  listSessions(@CurrentUser() user: AuthUser): Promise<SessionDto[]> {
    return this.sessions.listActiveForUser(user.userId, user.sessionId);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đăng xuất một thiết bị khác' })
  @ApiNoContentResponse()
  revokeSession(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    return this.sessions.revokeOwn(user.userId, id, user.sessionId);
  }

  @Delete('sessions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đăng xuất tất cả thiết bị khác' })
  @ApiNoContentResponse()
  async revokeOtherSessions(@CurrentUser() user: AuthUser): Promise<void> {
    await this.sessions.revokeAllForUser(user.userId, user.sessionId);
  }
}
