"use client";

import { FileQuestionIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useFeatures } from "@/features/auth/hooks";
import { routes } from "@/lib/routes";

/**
 * Nội dung trang "Không tìm thấy trang" — dùng lại ở not-found.tsx (server) và ChatModeGuard (client).
 * Nút về trang chủ đọc API `/me/features` để chọn `/chat` hay `/profile` (không cố định).
 */
export function NotFoundContent({
  title,
  description,
  homeLabel,
}: {
  title: string;
  description: string;
  homeLabel: string;
}) {
  const features = useFeatures();
  const homeHref = features.data?.chatEnabled === false ? routes.profile : routes.chat;

  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
