// Lightweight cross-component bus to ask TransactionHistory components to re-fetch.
const EVENT = "txhist:refresh";

export function bumpHistoryRefresh() {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore
  }
}

export function onHistoryRefresh(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
