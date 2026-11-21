import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../../config/app-config.service.js';
import { LlmModule } from '../llm/llm.module.js';
import { DocumentFilesService } from './document-files.service.js';
import { DocumentProcessor } from './document-processor.js';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { DocumentSummaryService } from './document-summary.service.js';
import { DocumentsHiddenGuard } from './documents-hidden.guard.js';
import { EmbeddingService } from './embedding.service.js';
import { DocumentEntity, DocumentEntitySchema } from './schemas/document.schema.js';
import { VectorStoreService } from './vector-store.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentEntity.name, schema: DocumentEntitySchema }]),
    // Tóm tắt (SE-016) gọi LlmProvider trong worker của queue `documents`.
    LlmModule,
    BullModule.registerQueueAsync({
      name: 'documents',
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        connection: config.redis,
        prefix: config.bullmqPrefix,
      }),
    }),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    DocumentSummaryService,
    DocumentProcessor,
    DocumentsHiddenGuard,
    DocumentFilesService,
    VectorStoreService,
    EmbeddingService,
  ],
  // RagModule (SE-014) cần EmbeddingService/VectorStoreService và model DocumentEntity
  // (qua MongooseModule) để kiểm quyền + truy hồi — không tạo pipeline riêng.
  exports: [DocumentsService, EmbeddingService, VectorStoreService, MongooseModule],
})
export class DocumentsModule {}
