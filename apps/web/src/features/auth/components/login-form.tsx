"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FormFieldError } from "@/components/form/form-field-error";
import { PasswordInput } from "@/components/form/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useHydrated } from "@/hooks/use-hydrated";
import { safeNextPath } from "@/lib/routes";
import { rules } from "@/lib/validation";
import { useLogin } from "../hooks";

const loginSchema = z.object({
  email: rules.email(),
  password: rules.requiredPassword(),
});
type LoginValues = z.infer<typeof loginSchema>;

export type LoginReason = "expired" | "blocked" | "loggedOut";

export function LoginForm({ reason, next }: { reason?: LoginReason; next?: string }) {
  const t = useTranslations("auth");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const login = useLogin();
  const hydrated = useHydrated();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: () => router.replace(safeNextPath(next)),
      onError: () => form.resetField("password"),
    }),
  );

  return (
    // method="post": nếu người dùng bấm trước khi JS sẵn sàng, trình duyệt không đưa mật khẩu lên URL.
    <form method="post" onSubmit={onSubmit} noValidate className="space-y-6">
      {login.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{errorMessage(login.error)}</AlertDescription>
        </Alert>
      ) : reason ? (
        <Alert variant={reason === "blocked" ? "destructive" : "default"}>
          {reason === "blocked" ? <AlertCircleIcon /> : <InfoIcon />}
          <AlertDescription>{t(`reason.${reason}`)}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder={t("emailPlaceholder")}
                aria-invalid={fieldState.invalid}
              />
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
              <PasswordInput
                {...field}
                id="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={!hydrated || login.isPending}>
        {login.isPending ? <Spinner /> : null}
        {login.isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
