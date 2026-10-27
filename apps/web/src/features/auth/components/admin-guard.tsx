"use client";

import { ShieldAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { UserRole } from "@cat-gpt/shared";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useCurrentUser } from "../hooks";

/**
 * Chặn giao diện trang quản trị với người không phải admin.
 * Đây chỉ là lớp UX — quyền thật được API kiểm tra (RolesGuard).
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const t = useTranslations("forbidden");
  const user = useCurrentUser();

  if (user.role !== UserRole.ADMIN) {
    return (
      <Empty className="min-h-[60vh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlertIcon />
          </EmptyMedia>
          <EmptyTitle>{t("title")}</EmptyTitle>
          <EmptyDescription>{t("description")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return children;
}
