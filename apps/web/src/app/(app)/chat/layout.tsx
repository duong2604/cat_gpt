import { notFound } from "next/navigation";
import { ChatLayout } from "@/features/chat/components/chat-layout";
import { isStaffMode } from "@/lib/release-mode";

export default function Layout({ children }: LayoutProps<"/chat">) {
  if (isStaffMode) notFound();
  return <ChatLayout>{children}</ChatLayout>;
}
