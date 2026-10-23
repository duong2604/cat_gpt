import { DEFAULT_LOCALE, LOCALES, type Locale } from "@cat-gpt/shared";

export { DEFAULT_LOCALE, LOCALES, type Locale };

/** Cookie lưu ngôn ngữ người dùng chọn (không dùng tiền tố /vi, /en trên URL). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
