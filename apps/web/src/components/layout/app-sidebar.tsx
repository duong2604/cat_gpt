"use client";

import {
  BookOpenCheckIcon,
  FileTextIcon,
  MessageSquareIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserRole } from "@cat-gpt/shared";
import { AppLogo } from "@/components/app-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/features/auth/hooks";
import { routes } from "@/lib/routes";
import { NavUser } from "./nav-user";

type NavKey = "chat" | "documents" | "ask" | "users";

interface NavItem {
  key: NavKey;
  href: string;
  icon: LucideIcon;
}

const WORKSPACE_ITEMS: NavItem[] = [
  { key: "chat", href: routes.chat, icon: MessageSquareIcon },
  { key: "documents", href: routes.documents, icon: FileTextIcon },
  { key: "ask", href: routes.ask, icon: BookOpenCheckIcon },
];

const ADMIN_ITEMS: NavItem[] = [{ key: "users", href: routes.adminUsers, icon: UsersIcon }];

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.key}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                tooltip={t(item.key)}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{t(item.key)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const t = useTranslations();
  const user = useCurrentUser();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={routes.home}>
                <AppLogo />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{t("common.appName")}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t("common.appTagline")}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label={t("nav.workspace")} items={WORKSPACE_ITEMS} />
        {user.role === UserRole.ADMIN ? (
          <NavGroup label={t("nav.administration")} items={ADMIN_ITEMS} />
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
