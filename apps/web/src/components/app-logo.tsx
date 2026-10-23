import { CatIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
    >
      <CatIcon className="size-[60%]" />
    </div>
  );
}
