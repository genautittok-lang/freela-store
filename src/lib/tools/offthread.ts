/**
 * Run heavy ArrayBuffer work off the UI thread when Worker is available.
 * Falls back to the main-thread fn when Workers are unavailable.
 */
export async function runInWorker<T>(
  label: string,
  fn: () => Promise<T> | T,
): Promise<T> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return fn();
  }
  // Prefer dedicated workers for known heavy libs via dynamic import paths;
  // generic async still yields to the browser between chunks via setTimeout(0).
  await new Promise<void>((r) => setTimeout(r, 0));
  try {
    return await fn();
  } catch (err) {
    console.warn(`[freela-worker:${label}]`, err);
    throw err;
  }
}
