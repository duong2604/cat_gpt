import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module.js';
import { RagService } from './rag.service.js';

@Module({
  imports: [DocumentsModule],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
