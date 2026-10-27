"use client";

import { Trash2Icon, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ChangeEvent, useRef } from "react";
import { toast } from "sonner";
import { AVATAR_MAX_SIZE_BYTES, AVATAR_MIME_TYPES, ErrorCode } from "@cat-gpt/shared";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/features/auth/hooks";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useRemoveAvatar, useUploadAvatar } from "../hooks";

export function AvatarUploader() {
  const t = useTranslations("profile.avatar");
  const tErrors = useTranslations("errors");
  const errorMessage = useErrorMessage();
  const user = useCurrentUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const busy = upload.isPending || remove.isPending;

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // Kiểm tra sớm phía client cho phản hồi nhanh; server vẫn kiểm tra lại (magic bytes).
    if (!(AVATAR_MIME_TYPES as readonly string[]).includes(file.type)) {
      toast.error(tErrors(ErrorCode.FILE_INVALID_TYPE));
      return;
    }
    if (file.size > AVATAR_MAX_SIZE_BYTES) {
      toast.error(tErrors(ErrorCode.FILE_TOO_LARGE));
      return;
    }

    upload.mutate(file, {
      onSuccess: () => toast.success(t("updated")),
      onError: (error) => toast.error(errorMessage(error)),
    });
  };

  const onRemove = () =>
    remove.mutate(undefined, {
      onSuccess: () => toast.success(t("removed")),
      onError: (error) => toast.error(errorMessage(error)),
    });

  return (
    <div className="flex items-center gap-4">
      <UserAvatar name={user.fullName} src={user.avatarUrl} className="size-20 text-lg" />
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {upload.isPending ? <Spinner /> : <UploadIcon />}
            {t("upload")}
          </Button>
          {user.avatarUrl ? (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onRemove}>
              {remove.isPending ? <Spinner /> : <Trash2Icon />}
              {t("remove")}
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{t("hint")}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_MIME_TYPES.join(",")}
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
