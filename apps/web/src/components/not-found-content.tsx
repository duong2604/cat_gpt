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

/** Nội dung trang "Không tìm thấy trang" — dùng lại ở not-found.tsx (server) và ChatModeGuard (client). */
export function NotFoundContent({
  title,
  description,
  homeLabel,
  homeHref,
}: {
  title: string;
  description: string;
  homeLabel: string;
  homeHref: string;
}) {
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
