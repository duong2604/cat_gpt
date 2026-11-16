import type { Metadata } from "next";
import { FileTextIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/coming-soon";
import { isStaffMode } from "@/lib/release-mode";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("documents") };
}

/** TODO(module-3): quản lý tài liệu + pipeline xử lý. */
export default async function DocumentsPage() {
  if (isStaffMode) notFound();
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
