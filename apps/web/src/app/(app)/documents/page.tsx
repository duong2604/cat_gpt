import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DocumentsManagement } from "@/features/documents/components/documents-management";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("documents") };
}

export default function DocumentsPage() {
  return <DocumentsManagement />;
}
