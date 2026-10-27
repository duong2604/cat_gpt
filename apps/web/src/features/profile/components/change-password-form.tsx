"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ErrorCode } from "@cat-gpt/shared";
import { FormFieldError } from "@/components/form/form-field-error";
import { PasswordInput } from "@/components/form/password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { getErrorCode } from "@/lib/api/errors";
import { rules } from "@/lib/validation";
import { useChangePassword } from "../hooks";

const schema = z
  .object({
    currentPassword: rules.requiredPassword(),
    newPassword: rules.password(),
    confirmPassword: z.string().min(1, "validation.required"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "validation.passwordMismatch",
  });
type Values = z.infer<typeof schema>;

const EMPTY: Values = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function ChangePasswordForm() {
  const t = useTranslations("profile.security");
  const errorMessage = useErrorMessage();
  const changePassword = useChangePassword();

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const onSubmit = form.handleSubmit(({ currentPassword, newPassword }) =>
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          form.reset(EMPTY);
          toast.success(t("changed"));
        },
        onError: (error) => {
          const code = getErrorCode(error);
          if (code === ErrorCode.USER_WRONG_CURRENT_PASSWORD) {
            form.setError("currentPassword", { message: `errors.${code}` });
          } else if (code === ErrorCode.USER_SAME_PASSWORD) {
            form.setError("newPassword", { message: `errors.${code}` });
          } else {
            toast.error(errorMessage(error));
          }
        },
      },
    ),
  );

  const fields = [
    { name: "currentPassword", autoComplete: "current-password" },
    { name: "newPassword", autoComplete: "new-password", hint: t("newPasswordHint") },
    { name: "confirmPassword", autoComplete: "new-password" },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent>
          <FieldGroup className="max-w-md">
            {fields.map(({ name, autoComplete, ...rest }) => (
              <Controller
                key={name}
                control={form.control}
                name={name}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{t(name)}</FieldLabel>
                    <PasswordInput
                      {...field}
                      id={name}
                      autoComplete={autoComplete}
                      aria-invalid={fieldState.invalid}
                    />
                    {"hint" in rest && !fieldState.error ? (
                      <FieldDescription>{rest.hint}</FieldDescription>
                    ) : null}
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end border-t pt-6">
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? <Spinner /> : null}
            {t("submit")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
