import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Providers } from "./providers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return {
    title: { template: `%s · ${t("appName")}`, default: t("appName") },
    description: t("appTagline"),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    // suppressHydrationWarning: next-themes gắn class "dark" vào <html> trước khi React hydrate.
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-svh antialiased">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
