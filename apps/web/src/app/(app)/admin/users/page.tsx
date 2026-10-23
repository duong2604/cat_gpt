import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UsersManagement } from "@/features/admin-users/components/users-management";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminUsers");
  return { title: t("title") };
}

export default function AdminUsersPage() {
  return <UsersManagement />;
}
