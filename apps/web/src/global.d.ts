import type { Locale } from "@cat-gpt/shared";
import type messages from "../messages/vi.json";

/** Kiểm tra kiểu cho key dịch: gõ sai key là lỗi TypeScript. */
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
