// Komut paletinden bir görevin haftasına atlamak için küçük köprü:
// ana sayfa henüz açık değilse istek beklemeye alınır, açılışta tüketilir.

const EVENT = "go-to-date";
let pending: string | null = null;

export function requestDate(dateKey: string) {
  pending = dateKey;
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: dateKey }));
}

export function consumePendingDate(): string | null {
  const value = pending;
  pending = null;
  return value;
}

export function onDateRequest(handler: (dateKey: string) => void): () => void {
  const listener = (e: Event) => {
    pending = null;
    handler((e as CustomEvent<string>).detail);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
