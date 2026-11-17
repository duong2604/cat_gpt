import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DocumentsManagement } from "@/features/documents/components/documents-management";
import { isStaffMode } from "@/lib/release-mode";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("documents") };
}

/** Tài liệu chưa sẵn sàng ở bản `staff` (CS-6) — ẩn như route không tồn tại, giống Chat. */
export default async function DocumentsPage() {
  if (isStaffMode) notFound();
  return <DocumentsManagement />;
}
