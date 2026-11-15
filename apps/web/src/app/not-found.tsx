import { getTranslations } from "next-intl/server";
import { NotFoundContent } from "@/components/not-found-content";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return <NotFoundContent title={t("title")} description={t("description")} homeLabel={t("home")} />;
}
