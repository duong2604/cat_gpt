"use client";

import { LogOutIcon, MonitorIcon, SmartphoneIcon } from "lucide-react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { SessionDto } from "@cat-gpt/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useErrorMessage } from "@/hooks/use-error-message";
import { parseUserAgent } from "@/lib/user-agent";
import { useMySessions, useRevokeOtherSessions, useRevokeSession } from "../hooks";

function SessionRow({ session }: { session: SessionDto }) {
  const t = useTranslations("profile.sessions");
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  const errorMessage = useErrorMessage();
  const revoke = useRevokeSession();
  const device = parseUserAgent(session.userAgent);
  const Icon = device.isMobile ? SmartphoneIcon : MonitorIcon;

  const deviceName =
    device.browser && device.os
      ? t("browserOnOs", { browser: device.browser, os: device.os })
      : (device.browser ?? device.os ?? t("unknownDevice"));

  return (
    <li className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{deviceName}</span>
          {session.isCurrent ? <Badge>{t("current")}</Badge> : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {[
            session.ip,
            t("lastActive", { time: format.relativeTime(new Date(session.lastUsedAt), now) }),
            t("signedInAt", {
              time: format.dateTime(new Date(session.createdAt), {
                dateStyle: "short",
                timeStyle: "short",
              }),
            }),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {session.isCurrent ? null : (
        <Button
          variant="ghost"
          size="sm"
          disabled={revoke.isPending}
          onClick={() =>
            revoke.mutate(session.id, {
              onSuccess: () => toast.success(t("revoked")),
              onError: (error) => toast.error(errorMessage(error)),
            })
          }
        >
          {revoke.isPending ? <Spinner /> : <LogOutIcon />}
          {t("revoke")}
        </Button>
      )}
    </li>
  );
}

export function SessionsList() {
  const t = useTranslations("profile.sessions");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const sessions = useMySessions();
  const revokeOthers = useRevokeOtherSessions();
  const hasOthers = (sessions.data?.length ?? 0) > 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        {hasOthers ? (
          <CardAction>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={revokeOthers.isPending}>
                  {revokeOthers.isPending ? <Spinner /> : <LogOutIcon />}
                  {t("revokeAll")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("confirmRevokeAllTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("confirmRevokeAllDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      revokeOthers.mutate(undefined, {
                        onSuccess: () => toast.success(t("revokedAll")),
                        onError: (error) => toast.error(errorMessage(error)),
                      })
                    }
                  >
                    {tCommon("confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {sessions.isPending ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
              </div>
            ))}
          </div>
        ) : sessions.isError ? (
          <div className="flex items-center justify-between gap-4 text-sm text-destructive">
            {errorMessage(sessions.error)}
            <Button variant="outline" size="sm" onClick={() => sessions.refetch()}>
              {tCommon("retry")}
            </Button>
          </div>
        ) : (
          <>
            <ul className="divide-y">
              {sessions.data.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </ul>
            {!hasOthers ? (
              <p className="mt-4 text-sm text-muted-foreground">{t("onlyCurrent")}</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
