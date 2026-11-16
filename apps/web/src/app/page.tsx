"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useFeatures } from "@/features/auth/hooks";
import { routes } from "@/lib/routes";

/** Trang chủ là /chat hay /profile tùy Chat còn bật hay không (API /me/features, lỗi → /profile). */
export default function HomePage() {
  const router = useRouter();
  const features = useFeatures();

  useEffect(() => {
    if (features.isPending) return;
    router.replace(features.data?.chatEnabled ? routes.chat : routes.profile);
  }, [features.isPending, features.data, router]);

  return <FullPageSpinner />;
}
