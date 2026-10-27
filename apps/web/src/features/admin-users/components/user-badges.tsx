"use client";

import { ShieldCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { UserRole, UserStatus } from "@cat-gpt/shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function RoleBadge({ role }: { role: UserRole }) {
  const t = useTranslations("roles");
  return (
    <Badge variant={role === UserRole.ADMIN ? "default" : "secondary"}>
      {role === UserRole.ADMIN ? <ShieldCheckIcon /> : null}
      {t(role)}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: UserStatus }) {
  const t = useTranslations("status");
  const active = status === UserStatus.ACTIVE;
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-destructive")}
        aria-hidden
      />
      {t(status)}
    </Badge>
  );
}
