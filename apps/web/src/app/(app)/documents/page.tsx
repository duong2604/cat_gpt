import type { Metadata } from "next";
import { FileTextIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ComingSoon } from "@/components/coming-soon";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("documents") };
}

/** TODO(module-3): quản lý tài liệu + pipeline xử lý. */
export default async function DocumentsPage() {
  const t = await getTranslations();
  return (
    <ComingSoon
      icon={FileTextIcon}
      title={t("documents.title")}
      description={t("documents.description")}
      badge={t("common.comingSoon")}
    />
  );
}
