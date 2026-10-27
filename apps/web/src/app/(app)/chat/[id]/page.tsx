import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ConversationView } from "@/features/chat/components/conversation-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("chat") };
}

export default async function ConversationPage({ params }: PageProps<"/chat/[id]">) {
  const { id } = await params;
  return <ConversationView conversationId={id} />;
}
