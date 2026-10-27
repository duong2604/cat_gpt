import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";

/** Cookie do shadcn Sidebar ghi để nhớ trạng thái thu gọn/mở rộng. */
const SIDEBAR_COOKIE = "sidebar_state";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const sidebarState = (await cookies()).get(SIDEBAR_COOKIE)?.value;
  return <AppShell defaultSidebarOpen={sidebarState !== "false"}>{children}</AppShell>;
}
