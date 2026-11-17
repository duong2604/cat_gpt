import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DocumentStatus } from '@cat-gpt/shared';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { Trim } from '../../../common/validation/transforms.js';

export class ListDocumentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Tìm theo tên tệp (không phân biệt hoa thường)' })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(255)
  q?: string;

  @ApiPropertyOptional({ enum: Object.values(DocumentStatus) })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}
