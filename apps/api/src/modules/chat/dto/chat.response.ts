import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  type ConversationDto,
  type MessageDto,
  MessageRole,
  MessageStatus,
} from '@cat-gpt/shared';

/** Các lớp mô tả response cho Swagger (dữ liệu thực tế là DTO từ shared). */
export class ConversationResponse implements ConversationDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() lastMessageAt: string;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

export class ConversationPageResponse {
  @ApiProperty({ type: [ConversationResponse] }) items: ConversationResponse[];
  @ApiPropertyOptional({ type: String, nullable: true }) nextCursor: string | null;
}

export class MessageResponse implements MessageDto {
  @ApiProperty() id: string;
  @ApiProperty() conversationId: string;
  @ApiProperty({ enum: Object.values(MessageRole) }) role: MessageRole;
  @ApiProperty() content: string;
  @ApiProperty({ enum: Object.values(MessageStatus) }) status: MessageStatus;
  @ApiPropertyOptional({ type: String, nullable: true }) model: string | null;
  @ApiProperty() createdAt: string;
}
