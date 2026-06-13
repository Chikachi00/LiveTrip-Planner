import { useEffect } from "react";

export const useUnsavedChangesWarning = (dirty: boolean, message: string) => {
  useEffect(() => {
    if (!dirty) {
      return;
    }

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty, message]);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!anchor || anchor.target || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href") ?? "";

      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);

      if (destination.origin !== window.location.origin) {
        return;
      }

      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }

      if (!window.confirm(message)) {
        event.preventDefault();
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, message]);
};
