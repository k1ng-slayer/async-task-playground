import { useEffect } from "react";

const LOCK_ATTR = "data-scroll-lock-count";

export default function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const body = document.body;
    const current = Number(body.getAttribute(LOCK_ATTR) || "0");
    const next = current + 1;

    body.setAttribute(LOCK_ATTR, String(next));
    if (next === 1) {
      body.style.overflow = "hidden";
    }

    return () => {
      const latest = Number(body.getAttribute(LOCK_ATTR) || "1");
      const updated = Math.max(0, latest - 1);

      if (updated === 0) {
        body.removeAttribute(LOCK_ATTR);
        body.style.overflow = "";
      } else {
        body.setAttribute(LOCK_ATTR, String(updated));
      }
    };
  }, [active]);
}
