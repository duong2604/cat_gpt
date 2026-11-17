import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../../config/app-config.service.js';
import { DocumentFilesService } from './document-files.service.js';
import { DocumentProcessor } from './document-processor.js';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { DocumentsHiddenGuard } from './documents-hidden.guard.js';
import { EmbeddingService } from './embedding.service.js';
import { DocumentEntity, DocumentEntitySchema } from './schemas/document.schema.js';
import { VectorStoreService } from './vector-store.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentEntity.name, schema: DocumentEntitySchema }]),
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
    DocumentProcessor,
    DocumentsHiddenGuard,
    DocumentFilesService,
    VectorStoreService,
    EmbeddingService,
  ],
})
export class DocumentsModule {}
