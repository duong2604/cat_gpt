"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { getErrorCode } from "@/lib/api/errors";

/** Trả về hàm chuyển lỗi bất kỳ thành thông báo đã dịch. */
export function useErrorMessage() {
  const t = useTranslations("errors");
  return useCallback((error: unknown) => t(getErrorCode(error)), [t]);
}
