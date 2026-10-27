import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** true khi component đã hydrate trên trình duyệt (server render luôn trả false). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
