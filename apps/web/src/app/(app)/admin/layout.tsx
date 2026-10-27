import { AdminGuard } from "@/features/auth/components/admin-guard";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminGuard>{children}</AdminGuard>;
}
