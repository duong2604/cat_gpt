"use client";

import { CheckIcon, LanguagesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocale } from "@/i18n/actions";
import { LOCALES } from "@/i18n/config";

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const current = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (locale: string) =>
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("label")} disabled={pending}>
          <LanguagesIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        {LOCALES.map((locale) => (
          <DropdownMenuItem key={locale} onSelect={() => change(locale)}>
            <span className="w-6 text-xs font-medium uppercase text-muted-foreground">
              {locale}
            </span>
            {t(locale)}
            {current === locale ? <CheckIcon className="ml-auto" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
