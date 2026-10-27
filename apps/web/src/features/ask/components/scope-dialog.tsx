"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentIcon } from "@/features/documents/components/document-status";
import { SEARCHABLE_DOCUMENTS } from "../fake-knowledge";

/** Chọn các tài liệu được dùng làm nguồn tra cứu. */
export function ScopeDialog({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* key: mỗi lần mở lấy lại lựa chọn hiện tại. */}
        {open ? <ScopeForm key={value.join()} value={value} onSave={(ids) => (onChange(ids), onOpenChange(false))} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function ScopeForm({ value, onSave }: { value: string[]; onSave: (ids: string[]) => void }) {
  const t = useTranslations("ask.scope");
  const tCommon = useTranslations("common");
  const [selected, setSelected] = useState(() => new Set(value));
  const allSelected = selected.size === SEARCHABLE_DOCUMENTS.length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription>{t("description")}</DialogDescription>
      </DialogHeader>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("selected", { count: selected.size })}</span>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={() => setSelected(new Set(allSelected ? [] : SEARCHABLE_DOCUMENTS.map((d) => d.id)))}
        >
          {allSelected ? t("clearAll") : t("selectAll")}
        </Button>
      </div>

      <ul className="max-h-80 space-y-1 overflow-y-auto">
        {SEARCHABLE_DOCUMENTS.map((doc) => (
          <li key={doc.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-accent">
              <input
                type="checkbox"
                checked={selected.has(doc.id)}
                onChange={() => toggle(doc.id)}
                className="size-4 accent-primary"
              />
              <DocumentIcon type={doc.type} className="size-8" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{doc.name}</div>
                <div className="text-xs text-muted-foreground">{t("chunks", { count: doc.chunks ?? 0 })}</div>
              </div>
            </label>
          </li>
        ))}
      </ul>

      <DialogFooter>
        <Button variant="outline" onClick={() => onSave(value)}>
          {tCommon("cancel")}
        </Button>
        <Button disabled={selected.size === 0} onClick={() => onSave([...selected])}>
          {t("apply")}
        </Button>
      </DialogFooter>
    </>
  );
}
