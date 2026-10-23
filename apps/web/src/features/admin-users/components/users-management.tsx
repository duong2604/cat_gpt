"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyRoundIcon,
  LockIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  UnlockIcon,
  UsersIcon,
} from "lucide-react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useState } from "react";
import { DEFAULT_PAGE_SIZE, type UserDto, UserRole, UserStatus } from "@cat-gpt/shared";
import { PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentUser } from "@/features/auth/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useAdminUsers } from "../hooks";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { RoleBadge, StatusBadge } from "./user-badges";
import { UserFormDialog } from "./user-form-dialog";
import { UserStatusDialog } from "./user-status-dialog";

const ALL = "ALL";
const COLUMN_COUNT = 6;

export function UsersManagement() {
  const t = useTranslations("adminUsers");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");
  const tStatus = useTranslations("status");
  const errorMessage = useErrorMessage();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | typeof ALL>(ALL);
  const [status, setStatus] = useState<UserStatus | typeof ALL>(ALL);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());

  const users = useAdminUsers({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    role: role === ALL ? undefined : role,
    status: status === ALL ? undefined : status,
  });

  // Dialog state: mỗi dialog giữ user đang thao tác (null = đóng).
  const [formState, setFormState] = useState<{ open: boolean; user?: UserDto }>({ open: false });
  const [resetTarget, setResetTarget] = useState<UserDto | null>(null);
  const [statusTarget, setStatusTarget] = useState<UserDto | null>(null);

  const isFiltered = Boolean(debouncedSearch) || role !== ALL || status !== ALL;
  const meta = users.data?.meta;

  /** Đổi bộ lọc thì quay về trang 1. */
  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button onClick={() => setFormState({ open: true })}>
            <PlusIcon />
            {t("add")}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => withPageReset(setSearch)(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <Select value={role} onValueChange={withPageReset((v: string) => setRole(v as UserRole))}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allRoles")}</SelectItem>
            {Object.values(UserRole).map((r) => (
              <SelectItem key={r} value={r}>
                {tRoles(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={withPageReset((v: string) => setStatus(v as UserStatus))}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allStatuses")}</SelectItem>
            {Object.values(UserStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {tStatus(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{t("columns.user")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("columns.department")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("columns.role")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("columns.lastLogin")}</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">{t("columns.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={users.isPlaceholderData ? "opacity-60" : undefined}>
            {users.isPending ? (
              <LoadingRows />
            ) : users.isError ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-destructive">{errorMessage(users.error)}</span>
                    <Button variant="outline" size="sm" onClick={() => users.refetch()}>
                      {tCommon("retry")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT}>
                  <Empty className="py-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UsersIcon />
                      </EmptyMedia>
                      <EmptyDescription>
                        {isFiltered ? t("emptyFiltered") : t("empty")}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              users.data.items.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={() => setFormState({ open: true, user })}
                  onResetPassword={() => setResetTarget(user)}
                  onToggleStatus={() => setStatusTarget(user)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta ? (
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span>{tCommon("totalItems", { total: meta.total })}</span>
          <div className="flex items-center gap-2">
            <span>{tCommon("pageOf", { page: meta.page, totalPages: meta.totalPages })}</span>
            <Button
              variant="outline"
              size="icon"
              aria-label={tCommon("previous")}
              disabled={page <= 1 || users.isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={tCommon("next")}
              disabled={page >= meta.totalPages || users.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      ) : null}

      <UserFormDialog
        open={formState.open}
        user={formState.user}
        onOpenChange={(open) => setFormState((s) => ({ ...s, open }))}
      />
      <ResetPasswordDialog user={resetTarget} onOpenChange={(open) => !open && setResetTarget(null)} />
      <UserStatusDialog
        user={statusTarget}
        onOpenChange={(open) => !open && setStatusTarget(null)}
      />
    </div>
  );
}

function UserRow({
  user,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: {
  user: UserDto;
  onEdit: () => void;
  onResetPassword: () => void;
  onToggleStatus: () => void;
}) {
  const t = useTranslations("adminUsers");
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  const me = useCurrentUser();
  const isSelf = user.id === me.id;
  const blocked = user.status === UserStatus.BLOCKED;

  return (
    <TableRow className={blocked ? "text-muted-foreground" : undefined}>
      <TableCell>
        <div className="flex items-center gap-3">
          <UserAvatar name={user.fullName} src={user.avatarUrl} className="size-9" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium text-foreground">{user.fullName}</span>
              {isSelf ? <Badge variant="outline">{t("you")}</Badge> : null}
            </div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">{user.department ?? "—"}</TableCell>
      <TableCell className="hidden sm:table-cell">
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell>
        <StatusBadge status={user.status} />
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">
        {user.lastLoginAt ? format.relativeTime(new Date(user.lastLoginAt), now) : t("never")}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("actions.open")}>
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <PencilIcon />
              {t("actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onResetPassword}>
              <KeyRoundIcon />
              {t("actions.resetPassword")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onToggleStatus}
              disabled={isSelf}
              variant={blocked ? "default" : "destructive"}
            >
              {blocked ? <UnlockIcon /> : <LockIcon />}
              {blocked ? t("actions.unblock") : t("actions.block")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function LoadingRows() {
  return Array.from({ length: 5 }, (_, i) => (
    <TableRow key={i}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell />
    </TableRow>
  ));
}
