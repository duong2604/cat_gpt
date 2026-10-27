"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { type UserDto, UserStatus } from "@cat-gpt/shared";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useSetUserStatus } from "../hooks";

/** Xác nhận khóa / mở khóa tài khoản. */
export function UserStatusDialog({
  user,
  onOpenChange,
}: {
  user: UserDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("adminUsers.statusDialog");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const setStatus = useSetUserStatus();

  const willBlock = user?.status === UserStatus.ACTIVE;
  const name = user?.fullName ?? "";

  const confirm = () => {
    if (!user) return;
    const status = willBlock ? UserStatus.BLOCKED : UserStatus.ACTIVE;
    setStatus.mutate(
      { id: user.id, status },
      {
        onSuccess: () => {
          toast.success(willBlock ? t("blocked", { name }) : t("unblocked", { name }));
          onOpenChange(false);
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  };

  return (
    <AlertDialog open={user !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {willBlock ? t("blockTitle", { name }) : t("unblockTitle", { name })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {willBlock ? t("blockDescription") : t("unblockDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={setStatus.isPending}>{tCommon("cancel")}</AlertDialogCancel>
          {/* Dùng Button thường thay vì AlertDialogAction để dialog chỉ đóng khi API thành công. */}
          <Button
            variant={willBlock ? "destructive" : "default"}
            disabled={setStatus.isPending}
            onClick={confirm}
          >
            {setStatus.isPending ? <Spinner /> : null}
            {tCommon("confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
