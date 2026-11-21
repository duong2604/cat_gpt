import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { ChatHiddenGuard } from './chat-hidden.guard.js';
import { ChatThrottlerGuard } from './chat-throttler.guard.js';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/chat.dto.js';
import { toSseResponse } from './sse-response.js';

const STREAM_DESCRIPTION =
  'Trả về `text/event-stream`. Mỗi sự kiện là một khối `data: <json>` theo kiểu `ChatStreamEvent`: ' +
  '`meta` → `delta` (nhiều lần) → `done`. Giới hạn 20 lần/phút/người dùng.';

/**
 * Các endpoint streaming. Pha trước stream (kiểm quyền, lưu tin USER) chạy trước khi tạo phản hồi:
 * lỗi ở đó ra JSON qua AllExceptionsFilter. Chỉ khi có lượt hợp lệ mới trả phản hồi SSE.
 */
@ApiTags('Chat - Streaming')
@ApiCookieAuth()
@UseGuards(ChatHiddenGuard)
@Controller()
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('chat/stream')
  @UseGuards(ChatThrottlerGuard)
  @ApiOperation({ summary: 'Gửi tin nhắn và nhận câu trả lời streaming', description: STREAM_DESCRIPTION })
  @ApiProduces('text/event-stream')
  async send(@CurrentUser() user: AuthUser, @Body() dto: SendMessageDto): Promise<Response> {
    const turn = await this.chat.prepareSend(user.userId, dto);
    return toSseResponse((emit) => this.chat.run(turn, emit), () => this.chat.cancel(turn));
  }

  @Post('conversations/:id/regenerate')
  @UseGuards(ChatThrottlerGuard)
  @ApiOperation({ summary: 'Tạo lại câu trả lời cuối (streaming)', description: STREAM_DESCRIPTION })
  @ApiProduces('text/event-stream')
  async regenerate(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<Response> {
    const turn = await this.chat.prepareRegenerate(user.userId, id);
    return toSseResponse((emit) => this.chat.run(turn, emit), () => this.chat.cancel(turn));
  }

  @Post('conversations/:id/stop')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dừng câu trả lời đang stream (phần đã sinh vẫn được lưu)' })
  @ApiNoContentResponse()
  stop(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    return this.chat.stop(user.userId, id);
  }
}
