import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppLogo } from "@/components/app-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm, type LoginReason } from "@/features/auth/components/login-form";

const REASONS: readonly LoginReason[] = ["expired", "blocked", "loggedOut"];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("loginTitle") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const t = await getTranslations();
  const params = await searchParams;
  const reason = REASONS.find((r) => r === params.reason);
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted/40 p-6">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2 font-semibold">
          <AppLogo />
          <span className="text-lg">{t("common.appName")}</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t("auth.loginTitle")}</CardTitle>
            <CardDescription>{t("auth.loginSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm reason={reason} next={next} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">{t("auth.noAccount")}</p>
      </div>
    </div>
  );
}
