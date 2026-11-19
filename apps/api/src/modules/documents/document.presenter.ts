import { type DocumentDto, SummaryStatus } from '@cat-gpt/shared';
import type { DocumentEntity } from './schemas/document.schema.js';

export function toDocumentDto(d: DocumentEntity): DocumentDto {
  return {
    id: d._id.toString(),
    name: d.name,
    mimeType: d.mimeType,
    size: d.size,
    status: d.status,
    errorCode: d.errorCode ?? undefined,
    chunkCount: d.chunkCount ?? undefined,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    ...(d.summaryStatus ? { summaryStatus: d.summaryStatus as SummaryStatus } : {}),
    ...(d.summaryStatus === SummaryStatus.READY && d.summary ? { summary: d.summary } : {}),
    ...(d.summaryErrorCode ? { summaryErrorCode: d.summaryErrorCode } : {}),
    ...(d.summaryModel ? { summaryModel: d.summaryModel } : {}),
    ...(d.summarizedAt ? { summarizedAt: d.summarizedAt.toISOString() } : {}),
  };
}
