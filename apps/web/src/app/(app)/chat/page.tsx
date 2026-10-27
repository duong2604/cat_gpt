import type { Metadata } from "next";
import { MessageSquareIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ComingSoon } from "@/components/coming-soon";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("chat") };
}

/** TODO(module-2): giao diện chat + streaming SSE. */
export default async function ChatPage() {
  const t = await getTranslations();
  return (
    <ComingSoon
      icon={MessageSquareIcon}
      title={t("chat.title")}
      description={t("chat.description")}
      badge={t("common.comingSoon")}
    />
  );
}
