import type { DocumentDto, Paginated } from "@cat-gpt/shared";
import { api } from "@/lib/api/client";
import type { DocumentsFilter } from "@/lib/api/query-keys";

export const documentsApi = {
  list: (filter: DocumentsFilter) =>
    api.get<Paginated<DocumentDto>>("/documents", { params: filter }).then((r) => r.data),

  get: (id: string) => api.get<DocumentDto>(`/documents/${id}`).then((r) => r.data),

  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<DocumentDto>("/documents", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  delete: (id: string) => api.delete<void>(`/documents/${id}`).then(() => undefined),

  /** Đường dẫn tải xuống trực tiếp — trình duyệt tự gửi cookie (cùng origin qua Next.js rewrites). */
  downloadUrl: (id: string) => `/api/v1/documents/${id}/download`,
};
