import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AskWorkspace } from "@/features/ask/components/ask-workspace";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("ask") };
}

/** `?docs=d1,d2` → giới hạn sẵn phạm vi tra cứu (mở từ màn hình Tài liệu). */
export default async function AskPage({ searchParams }: PageProps<"/ask">) {
  const { docs } = await searchParams;
  return <AskWorkspace initialScope={typeof docs === "string" ? docs.split(",") : undefined} />;
}
