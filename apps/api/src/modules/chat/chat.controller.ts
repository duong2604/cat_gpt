import { Body, Controller, HttpCode, HttpStatus, Param, Post, Res } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/chat.dto.js';
import { SseStream } from './sse-stream.js';

const STREAM_DESCRIPTION =
  'Trả về `text/event-stream`. Mỗi sự kiện là một dòng `data: <json>` theo kiểu `ChatStreamEvent`: ' +
  '`meta` → `delta` (nhiều lần) → `done`. Giới hạn 20 lần/phút/người dùng.';

/**
 * Các endpoint streaming dùng `@Res()` của Express (không dùng `@Sse()` vì decorator đó chỉ hỗ trợ GET).
 * Lỗi xảy ra trước khi mở stream vẫn đi qua AllExceptionsFilter và trả JSON như bình thường.
 */
@ApiTags('Chat - Streaming')
@ApiCookieAuth()
@Controller()
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('chat/stream')
  @ApiOperation({ summary: 'Gửi tin nhắn và nhận câu trả lời streaming', description: STREAM_DESCRIPTION })
  @ApiProduces('text/event-stream')
  send(
    @CurrentUser() user: AuthUser,
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.chat.send(user.userId, dto, new SseStream(res));
  }

  @Post('conversations/:id/regenerate')
  @ApiOperation({ summary: 'Tạo lại câu trả lời cuối (streaming)', description: STREAM_DESCRIPTION })
  @ApiProduces('text/event-stream')
  regenerate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.chat.regenerate(user.userId, id, new SseStream(res));
  }

  @Post('conversations/:id/stop')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dừng câu trả lời đang stream (phần đã sinh vẫn được lưu)' })
  @ApiNoContentResponse()
  stop(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    return this.chat.stop(user.userId, id);
  }
}
