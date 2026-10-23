import { z } from "zod";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  PHONE_PATTERN,
} from "@cat-gpt/shared";

/**
 * Các rule zod dùng chung. Thông điệp lỗi là key i18n (vd "validation.required"),
 * component FormFieldError sẽ dịch theo ngôn ngữ đang chọn.
 * Rule khớp với validate phía backend (packages/shared/constants).
 */
export const rules = {
  requiredText: (max = 100) =>
    z.string().trim().min(1, "validation.required").max(max, "validation.tooLong"),

  optionalText: (max = 100) => z.string().trim().max(max, "validation.tooLong"),

  email: () =>
    z
      .string()
      .trim()
      .min(1, "validation.required")
      .pipe(z.email("validation.email").max(254, "validation.tooLong")),

  password: () =>
    z
      .string()
      .min(PASSWORD_MIN_LENGTH, "validation.passwordMin")
      .max(PASSWORD_MAX_LENGTH, "validation.passwordMax")
      .regex(PASSWORD_PATTERN, "validation.passwordPattern"),

  requiredPassword: () => z.string().min(1, "validation.required"),

  optionalPhone: () =>
    z
      .string()
      .trim()
      .refine((value) => value === "" || PHONE_PATTERN.test(value), "validation.phone"),
};

/** Chuỗi rỗng → null trước khi gửi API (để xóa giá trị trường không bắt buộc). */
export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
