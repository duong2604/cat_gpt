import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { ConversationDto, CursorPage, MessageDto } from '@cat-gpt/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { toConversationDto, toMessageDto } from './chat.presenter.js';
import { ChatService } from './chat.service.js';
import { ConversationsService } from './conversations.service.js';
import { ListConversationsQueryDto, RenameConversationDto } from './dto/chat.dto.js';
import {
  ConversationPageResponse,
  ConversationResponse,
  MessageResponse,
} from './dto/chat.response.js';

@ApiTags('Chat - Conversations')
@ApiCookieAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversations: ConversationsService,
    private readonly chat: ChatService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách hội thoại của tôi (mới hoạt động lên đầu, phân trang cursor)' })
  @ApiOkResponse({ type: ConversationPageResponse })
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListConversationsQueryDto,
  ): Promise<CursorPage<ConversationDto>> {
    return this.conversations.list(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết hội thoại' })
  @ApiOkResponse({ type: ConversationResponse })
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<ConversationDto> {
    return toConversationDto(await this.conversations.getOwnedOrThrow(user.userId, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Đổi tên hội thoại' })
  @ApiOkResponse({ type: ConversationResponse })
  async rename(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: RenameConversationDto,
  ): Promise<ConversationDto> {
    return toConversationDto(await this.conversations.rename(user.userId, id, dto.title));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa hẳn hội thoại và toàn bộ tin nhắn' })
  @ApiNoContentResponse()
  async delete(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    await this.conversations.delete(user.userId, id);
    this.chat.abort(id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Lịch sử tin nhắn của hội thoại' })
  @ApiOkResponse({ type: [MessageResponse] })
  async messages(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<MessageDto[]> {
    const conversation = await this.conversations.getOwnedOrThrow(user.userId, id);
    return (await this.conversations.listMessages(conversation._id)).map(toMessageDto);
  }
}
