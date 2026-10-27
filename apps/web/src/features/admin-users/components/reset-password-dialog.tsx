"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { UserDto } from "@cat-gpt/shared";
import { FormFieldError } from "@/components/form/form-field-error";
import { PasswordInput } from "@/components/form/password-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { rules } from "@/lib/validation";
import { useResetUserPassword } from "../hooks";

const schema = z
  .object({
    newPassword: rules.password(),
    confirmPassword: z.string().min(1, "validation.required"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "validation.passwordMismatch",
  });
type Values = z.infer<typeof schema>;

const EMPTY: Values = { newPassword: "", confirmPassword: "" };

export function ResetPasswordDialog({
  user,
  onOpenChange,
}: {
  user: UserDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("adminUsers.reset");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const reset = useResetUserPassword();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (user) form.reset(EMPTY);
  }, [user, form]);

  const onSubmit = form.handleSubmit(({ newPassword }) => {
    if (!user) return;
    reset.mutate(
      { id: user.id, newPassword },
      {
        onSuccess: () => {
          toast.success(t("done", { name: user.fullName }));
          onOpenChange(false);
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  });

  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description", { name: user?.fullName ?? "" })}</DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-5">
            {(["newPassword", "confirmPassword"] as const).map((name) => (
              <Controller
                key={name}
                control={form.control}
                name={name}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`reset-${name}`}>{t(name)}</FieldLabel>
                    <PasswordInput
                      {...field}
                      id={`reset-${name}`}
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {tCommon("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={reset.isPending}>
              {reset.isPending ? <Spinner /> : null}
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
