import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { type Paginated, type UserDto, UserRole } from '@cat-gpt/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { PaginatedUsersResponse, UserResponse } from '../users/dto/user.response.js';
import { AdminUsersService } from './admin-users.service.js';
import {
  CreateUserDto,
  ListUsersQueryDto,
  ResetPasswordDto,
  UpdateUserDto,
  UpdateUserStatusDto,
} from './dto/admin-users.dto.js';

@ApiTags('Admin - Users')
@ApiCookieAuth()
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách người dùng (tìm kiếm, lọc, phân trang)' })
  @ApiOkResponse({ type: PaginatedUsersResponse })
  list(@Query() query: ListUsersQueryDto): Promise<Paginated<UserDto>> {
    return this.service.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tài khoản người dùng' })
  @ApiCreatedResponse({ type: UserResponse })
  create(@CurrentUser() admin: AuthUser, @Body() dto: CreateUserDto): Promise<UserDto> {
    return this.service.create(admin, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết người dùng' })
  @ApiOkResponse({ type: UserResponse })
  get(@Param('id') id: string): Promise<UserDto> {
    return this.service.get(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin / vai trò người dùng' })
  @ApiOkResponse({ type: UserResponse })
  update(
    @CurrentUser() admin: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.service.update(admin, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Khóa / mở khóa tài khoản (khóa sẽ đăng xuất mọi thiết bị)' })
  @ApiOkResponse({ type: UserResponse })
  setStatus(
    @CurrentUser() admin: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserDto> {
    return this.service.setStatus(admin, id, dto.status);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đặt lại mật khẩu (đăng xuất mọi thiết bị của người dùng)' })
  @ApiNoContentResponse()
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto): Promise<void> {
    return this.service.resetPassword(id, dto);
  }
}
