const FRESH_TTL = 5 * 60_000;  // 5 min — return immediately, no refetch
const STALE_TTL = 30 * 60_000; // 30 min — return stale + refetch in background

type Entry = { data: unknown; at: number };
const store = new Map<string, Entry>();

export function cacheGet<T>(key: string): T | null {
  const e = store.get(key);
  if (!e) return null;
  const age = Date.now() - e.at;
  if (age > STALE_TTL) { store.delete(key); return null; }
  if (age > FRESH_TTL) return null; // stale — keep in store for cacheGetStale
  return e.data as T;
}

export function cacheGetStale<T>(key: string): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() - e.at > STALE_TTL) { store.delete(key); return null; }
  return e.data as T;
}

export function cacheIsFresh(key: string): boolean {
  const e = store.get(key);
  return !!e && Date.now() - e.at <= FRESH_TTL;
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
