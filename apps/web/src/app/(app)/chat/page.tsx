import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { NewChat } from "@/features/chat/components/new-chat";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("chat") };
}

export default function ChatPage() {
  // useSearchParams (?documents=) cần Suspense boundary khi prerender.
  return (
    <Suspense fallback={null}>
      <NewChat />
    </Suspense>
  );
}
