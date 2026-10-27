"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ErrorCode, type UserDto, UserRole } from "@cat-gpt/shared";
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/features/auth/hooks";
import { useErrorMessage } from "@/hooks/use-error-message";
import { getErrorCode } from "@/lib/api/errors";
import { emptyToNull, rules } from "@/lib/validation";
import { useCreateUser, useUpdateUser } from "../hooks";

/** Mật khẩu chỉ bắt buộc khi tạo mới; khi sửa, admin dùng chức năng "Đặt lại mật khẩu". */
function makeSchema(isEdit: boolean) {
  return z.object({
    fullName: rules.requiredText(),
    email: rules.email(),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    phone: rules.optionalPhone(),
    department: rules.optionalText(),
    password: isEdit ? z.string() : rules.password(),
  });
}
type Values = z.infer<ReturnType<typeof makeSchema>>;

function toFormValues(user?: UserDto): Values {
  return {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    role: user?.role ?? UserRole.USER,
    phone: user?.phone ?? "",
    department: user?.department ?? "",
    password: "",
  };
}

/** Dialog dùng chung cho tạo mới (user = undefined) và chỉnh sửa người dùng. */
export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserDto;
}) {
  const t = useTranslations("adminUsers.form");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");
  const errorMessage = useErrorMessage();
  const me = useCurrentUser();
  const create = useCreateUser();
  const update = useUpdateUser();

  const isEdit = Boolean(user);
  const isSelf = user?.id === me.id;
  const pending = create.isPending || update.isPending;

  const schema = useMemo(() => makeSchema(isEdit), [isEdit]);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(user),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(user));
  }, [open, user, form]);

  const handleError = (error: unknown) => {
    const code = getErrorCode(error);
    if (code === ErrorCode.USER_EMAIL_EXISTS) {
      form.setError("email", { message: `errors.${code}` });
    } else {
      toast.error(errorMessage(error));
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const common = {
      fullName: values.fullName,
      email: values.email,
      phone: emptyToNull(values.phone),
      department: emptyToNull(values.department),
    };

    if (user) {
      update.mutate(
        { id: user.id, payload: isSelf ? common : { ...common, role: values.role } },
        {
          onSuccess: () => {
            toast.success(t("updated"));
            onOpenChange(false);
          },
          onError: handleError,
        },
      );
    } else {
      create.mutate(
        { ...common, role: values.role, password: values.password },
        {
          onSuccess: (created) => {
            toast.success(t("created", { email: created.email }));
            onOpenChange(false);
          },
          onError: handleError,
        },
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <DialogHeader>
            <DialogTitle>{isEdit ? t("editTitle") : t("createTitle")}</DialogTitle>
            <DialogDescription>
              {user ? t("editDescription", { name: user.fullName }) : t("createDescription")}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5">
            <Controller
              control={form.control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="u-fullName">{t("fullName")}</FieldLabel>
                  <Input {...field} id="u-fullName" aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="u-email">{t("email")}</FieldLabel>
                  <Input
                    {...field}
                    id="u-email"
                    type="email"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            {!isEdit ? (
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="u-password">{t("password")}</FieldLabel>
                    <PasswordInput
                      {...field}
                      id="u-password"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error ? (
                      <FormFieldError error={fieldState.error} />
                    ) : (
                      <FieldDescription>{t("passwordHint")}</FieldDescription>
                    )}
                  </Field>
                )}
              />
            ) : null}
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="u-role">{t("role")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isSelf}>
                    <SelectTrigger id="u-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[UserRole.USER, UserRole.ADMIN].map((role) => (
                        <SelectItem key={role} value={role}>
                          {tRoles(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isSelf ? <FieldDescription>{t("selfRoleHint")}</FieldDescription> : null}
                </Field>
              )}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="u-phone">{t("phone")}</FieldLabel>
                    <Input {...field} id="u-phone" type="tel" aria-invalid={fieldState.invalid} />
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="department"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="u-department">{t("department")}</FieldLabel>
                    <Input {...field} id="u-department" aria-invalid={fieldState.invalid} />
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {tCommon("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner /> : null}
              {isEdit ? tCommon("save") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
