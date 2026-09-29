/** Register a minimal shell/static cache service worker for repeat loads. */
export function registerFreelaServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline SW is best-effort */
    });
  });
}
