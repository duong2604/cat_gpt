import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CHAT_MAX_MESSAGE_LENGTH, CONVERSATION_TITLE_MAX_LENGTH } from '@cat-gpt/shared';
import { Trim } from '../../../common/validation/transforms.js';

export const CONVERSATIONS_PAGE_SIZE = 30;

export class ListConversationsQueryDto {
  @ApiPropertyOptional({ description: 'Tìm theo tiêu đề' })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ description: 'Giá trị nextCursor của trang trước' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cursor?: string;

  @ApiPropertyOptional({ default: CONVERSATIONS_PAGE_SIZE, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = CONVERSATIONS_PAGE_SIZE;
}

export class RenameConversationDto {
  @ApiProperty({ maxLength: CONVERSATION_TITLE_MAX_LENGTH })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CONVERSATION_TITLE_MAX_LENGTH)
  title: string;
}

export class SendMessageDto {
  @ApiPropertyOptional({ description: 'Bỏ trống để bắt đầu hội thoại mới' })
  @IsOptional()
  @IsMongoId()
  conversationId?: string;

  @ApiProperty({ maxLength: CHAT_MAX_MESSAGE_LENGTH })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CHAT_MAX_MESSAGE_LENGTH)
  content: string;
}
