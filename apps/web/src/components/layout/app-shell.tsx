"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMe } from "@/features/auth/hooks";
import { useErrorMessage } from "@/hooks/use-error-message";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

/**
 * Khung ứng dụng sau đăng nhập: chờ lấy thông tin người dùng (/me) rồi mới render.
 * Lỗi 401 được AuthFailureHandler xử lý (chuyển về trang đăng nhập).
 */
export function AppShell({
  children,
  defaultSidebarOpen,
}: {
  children: ReactNode;
  defaultSidebarOpen: boolean;
}) {
  const me = useMe();
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();

  if (me.isPending) return <FullPageSpinner />;

  if (me.isError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">{errorMessage(me.error)}</p>
        <Button variant="outline" onClick={() => me.refetch()}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
