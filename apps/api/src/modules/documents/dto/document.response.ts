import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  type DocumentDto,
  DocumentStatus,
  type Paginated,
  type PaginationMeta,
} from '@cat-gpt/shared';

export class DocumentResponse implements DocumentDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() mimeType: string;
  @ApiProperty() size: number;
  @ApiProperty({ enum: Object.values(DocumentStatus) }) status: DocumentStatus;
  @ApiPropertyOptional() errorCode?: string;
  @ApiPropertyOptional() chunkCount?: number;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

class PaginationMetaResponse implements PaginationMeta {
  @ApiProperty() page: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() total: number;
  @ApiProperty() totalPages: number;
}

export class DocumentPageResponse implements Paginated<DocumentDto> {
  @ApiProperty({ type: [DocumentResponse] }) items: DocumentResponse[];
  @ApiProperty({ type: PaginationMetaResponse }) meta: PaginationMetaResponse;
}
