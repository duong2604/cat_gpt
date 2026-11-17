import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import type { Readable } from 'node:stream';
import { AppConfigService } from '../../config/app-config.service.js';

/**
 * MinIO: lưu/đọc/xóa object tài liệu. Chỉ module `documents` dùng (M3-5 — không đổi
 * `StorageService` toàn cục, ảnh đại diện vẫn dùng `LocalStorageProvider`).
 */
@Injectable()
export class DocumentFilesService implements OnModuleInit {
  private readonly logger = new Logger(DocumentFilesService.name);
  private readonly client: Client;
  private readonly bucket: string;

  constructor(config: AppConfigService) {
    const minio = config.minio;
    this.bucket = minio.bucket;
    this.client = new Client({
      endPoint: minio.endPoint,
      port: minio.port,
      useSSL: minio.useSSL,
      accessKey: minio.accessKey,
      secretKey: minio.secretKey,
    });
  }

  /** Tạo bucket riêng tư nếu chưa có — không bật chính sách public. */
  async onModuleInit(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`Đã tạo bucket MinIO "${this.bucket}"`);
    }
  }

  async put(key: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.client.putObject(this.bucket, key, buffer, buffer.length, {
      'Content-Type': contentType,
    });
  }

  async getStream(key: string): Promise<Readable> {
    return this.client.getObject(this.bucket, key);
  }

  async getBuffer(key: string): Promise<Buffer> {
    const stream = await this.getStream(key);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks);
  }

  /**
   * Idempotent với object không tồn tại — S3 `DELETE` không báo lỗi trong trường hợp đó
   * (xác nhận thực tế: `removeObject` trên key không tồn tại không ném lỗi). Mọi lỗi
   * thật sự ném ra (mất kết nối MinIO...) được để nguyên cho người gọi — job `delete`
   * của worker dựa vào lỗi ném ra để BullMQ thử lại (thiết kế mục 6.4, AC5c/T13); nuốt
   * lỗi ở đây sẽ khiến object mồ côi vĩnh viễn khi MinIO tạm thời không sẵn sàng.
   */
  async remove(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
}
