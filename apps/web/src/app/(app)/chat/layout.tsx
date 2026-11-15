import { ChatLayout } from "@/features/chat/components/chat-layout";
import { ChatModeGuard } from "@/features/chat/components/chat-mode-guard";

export default function Layout({ children }: LayoutProps<"/chat">) {
  return (
    <ChatModeGuard>
      <ChatLayout>{children}</ChatLayout>
    </ChatModeGuard>
  );
}
