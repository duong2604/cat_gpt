"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Style cho từng thẻ markdown (dự án không dùng plugin typography của Tailwind). */
const components: Components = {
  p: ({ className, ...props }) => <p className={cn("my-3 leading-7 first:mt-0 last:mb-0", className)} {...props} />,
  h1: ({ className, ...props }) => <h1 className={cn("mt-6 mb-3 text-xl font-semibold first:mt-0", className)} {...props} />,
  h2: ({ className, ...props }) => <h2 className={cn("mt-6 mb-3 text-lg font-semibold first:mt-0", className)} {...props} />,
  h3: ({ className, ...props }) => <h3 className={cn("mt-5 mb-2 text-base font-semibold first:mt-0", className)} {...props} />,
  ul: ({ className, ...props }) => <ul className={cn("my-3 list-disc space-y-1 pl-6", className)} {...props} />,
  ol: ({ className, ...props }) => <ol className={cn("my-3 list-decimal space-y-1 pl-6", className)} {...props} />,
  li: ({ className, ...props }) => <li className={cn("leading-7", className)} {...props} />,
  a: ({ className, ...props }) => (
    <a className={cn("font-medium text-primary underline underline-offset-4", className)} target="_blank" rel="noreferrer" {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote className={cn("my-3 border-l-4 pl-4 text-muted-foreground italic", className)} {...props} />
  ),
  hr: (props) => <hr className="my-6" {...props} />,
  table: ({ className, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-lg border">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }) => <thead className={cn("bg-muted/50", className)} {...props} />,
  th: ({ className, ...props }) => <th className={cn("border-b px-3 py-2 text-left font-medium", className)} {...props} />,
  td: ({ className, ...props }) => <td className={cn("border-b px-3 py-2 align-top [tr:last-child_&]:border-b-0", className)} {...props} />,
  pre: ({ className, ...props }) => (
    <pre className={cn("my-4 overflow-x-auto rounded-lg border bg-muted/50 p-4 text-[13px] leading-6", className)} {...props} />
  ),
  code: ({ className, ...props }) => {
    // Code block có class "language-*" / "hljs" (do rehype-highlight thêm); còn lại là code nội dòng.
    const isBlock = /\b(language-|hljs)/.test(className ?? "");
    return (
      <code
        className={cn(isBlock ? "font-mono" : "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]", className)}
        {...props}
      />
    );
  },
};

/** Hiển thị câu trả lời markdown (GFM: bảng, danh sách việc cần làm...) và tô màu code. */
export const Markdown = memo(function Markdown({
  content,
  overrides,
}: {
  content: string;
  /** Ghi đè cách hiển thị một số thẻ (ví dụ thẻ `a` để vẽ số trích dẫn). */
  overrides?: Components;
}) {
  return (
    <div className="text-sm break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false }]]}
        components={overrides ? { ...components, ...overrides } : components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
