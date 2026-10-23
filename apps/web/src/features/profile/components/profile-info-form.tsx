"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormFieldError } from "@/components/form/form-field-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/features/auth/hooks";
import { useErrorMessage } from "@/hooks/use-error-message";
import { emptyToNull, rules } from "@/lib/validation";
import { useUpdateProfile } from "../hooks";
import { AvatarUploader } from "./avatar-uploader";

const schema = z.object({
  fullName: rules.requiredText(),
  phone: rules.optionalPhone(),
  department: rules.optionalText(),
});
type Values = z.infer<typeof schema>;

export function ProfileInfoForm() {
  const t = useTranslations("profile.info");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");
  const errorMessage = useErrorMessage();
  const user = useCurrentUser();
  const update = useUpdateProfile();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      fullName: user.fullName,
      phone: user.phone ?? "",
      department: user.department ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) =>
    update.mutate(
      {
        fullName: values.fullName,
        phone: emptyToNull(values.phone),
        department: emptyToNull(values.department),
      },
      {
        onSuccess: () => toast.success(t("updated")),
        onError: (error) => toast.error(errorMessage(error)),
      },
    ),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent>
          <FieldGroup>
            <AvatarUploader />
            <FieldSeparator />

            <div className="grid gap-6 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                <Input id="email" value={user.email} disabled readOnly />
                <FieldDescription>{t("emailHint")}</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>{t("role")}</FieldLabel>
                <div className="flex h-9 items-center">
                  <Badge variant="secondary">{tRoles(user.role)}</Badge>
                </div>
              </Field>
            </div>

            <Controller
              control={form.control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="fullName">{t("fullName")}</FieldLabel>
                  <Input {...field} id="fullName" autoComplete="name" aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">{t("phone")}</FieldLabel>
                    <Input
                      {...field}
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder={tCommon("notUpdated")}
                      aria-invalid={fieldState.invalid}
                    />
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="department"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="department">{t("department")}</FieldLabel>
                    <Input
                      {...field}
                      id="department"
                      placeholder={tCommon("notUpdated")}
                      aria-invalid={fieldState.invalid}
                    />
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end border-t pt-6">
          <Button type="submit" disabled={update.isPending || !form.formState.isDirty}>
            {update.isPending ? <Spinner /> : null}
            {update.isPending ? tCommon("saving") : tCommon("save")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
