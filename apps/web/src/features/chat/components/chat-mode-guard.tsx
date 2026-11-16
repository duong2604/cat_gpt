"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { NotFoundContent } from "@/components/not-found-content";
import { useCurrentFeatures } from "@/features/auth/hooks";

/**
 * Chat ẩn ở bản `staff` khi còn dùng LLM mẫu (CS-6). Nguồn quyết định duy nhất là
 * API `/me/features` (`AppConfigService.releaseMode` + `LlmProvider.isMock`) — không
 * suy từ `NEXT_PUBLIC_RELEASE_MODE` để tránh lệch với API khi đổi nhà cung cấp LLM.
 */
export function ChatModeGuard({ children }: { children: ReactNode }) {
  const t = useTranslations("notFound");
  const { chatEnabled } = useCurrentFeatures();

  if (!chatEnabled) {
    return (
      <NotFoundContent title={t("title")} description={t("description")} homeLabel={t("home")} />
    );
  }
  return children;
}
