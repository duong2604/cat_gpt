"use client";

import { useTranslations } from "next-intl";
import type { FieldError as RhfFieldError } from "react-hook-form";
import { FieldError } from "@/components/ui/field";

/**
 * Hiển thị lỗi của một trường form.
 * `message` là key i18n (vd "validation.required", "errors.USER_EMAIL_EXISTS").
 */
export function FormFieldError({ error }: { error?: RhfFieldError }) {
  const t = useTranslations();
  if (!error?.message) return null;

  const key = error.message as Parameters<typeof t>[0];
  return <FieldError>{t.has(key) ? t(key) : error.message}</FieldError>;
}
