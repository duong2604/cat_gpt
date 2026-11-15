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
import { type AdminUserDto, type Paginated, UserRole } from '@cat-gpt/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { AdminUsersService } from './admin-users.service.js';
import {
  AdminUserResponse,
  CreateUserDto,
  ListUsersQueryDto,
  PaginatedAdminUsersResponse,
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
  @ApiOkResponse({ type: PaginatedAdminUsersResponse })
  list(@Query() query: ListUsersQueryDto): Promise<Paginated<AdminUserDto>> {
    return this.service.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tài khoản người dùng' })
  @ApiCreatedResponse({ type: AdminUserResponse })
  create(@CurrentUser() admin: AuthUser, @Body() dto: CreateUserDto): Promise<AdminUserDto> {
    return this.service.create(admin, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết người dùng' })
  @ApiOkResponse({ type: AdminUserResponse })
  get(@Param('id') id: string): Promise<AdminUserDto> {
    return this.service.get(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin / vai trò người dùng' })
  @ApiOkResponse({ type: AdminUserResponse })
  update(
    @CurrentUser() admin: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<AdminUserDto> {
    return this.service.update(admin, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Khóa / mở khóa tài khoản (khóa sẽ đăng xuất mọi thiết bị)' })
  @ApiOkResponse({ type: AdminUserResponse })
  setStatus(
    @CurrentUser() admin: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<AdminUserDto> {
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
