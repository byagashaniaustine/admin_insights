const TTL = 60_000;

type Entry = { data: unknown; at: number };
const store = new Map<string, Entry>();

export function cacheGet<T>(key: string): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() - e.at > TTL) { store.delete(key); return null; }
  return e.data as T;
}

export function cacheSet<T>(key: string, data: T): void {
  store.set(key, { data, at: Date.now() });
}

export function cacheBust(prefix?: string): void {
  if (!prefix) { store.clear(); return; }
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}
