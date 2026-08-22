import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

// Lint-clean replacement for the classic `useState(false) + useEffect(() =>
// setState(true))` mount-detection anti-pattern. Returns false during SSR and
// the initial hydration pass, then true once mounted on the client — with no
// setState call inside an effect body.
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
