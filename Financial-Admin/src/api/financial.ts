import type { FinancialInsights } from '../types';
import { cacheGet, cacheGetStale, cacheIsFresh, cacheSet, cacheBust } from '../lib/cache';

const BASE   = import.meta.env.VITE_FINANCIAL_BASE_URL || '';
const SECRET = import.meta.env.VITE_FINANCIAL_SECRET ?? '';

function url(path: string): string {
  return BASE ? `${BASE}${path}` : `/financial-api${path}`;
}

function fetchWithTimeout(input: string, init: RequestInit, ms = 30_000): Promise<Response> {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(tid));
}

const INSIGHTS_KEY = 'financial:insights';

export function bustFinancialCache() {
  cacheBust('financial:');
}

export function peekFinancialInsights(): FinancialInsights | null {
  return cacheGetStale<FinancialInsights>(INSIGHTS_KEY);
}

export function isFreshFinancialInsights(): boolean {
  return cacheIsFresh(INSIGHTS_KEY);
}

export async function fetchFinancialInsights(): Promise<FinancialInsights> {
  const hit = cacheGet<FinancialInsights>(INSIGHTS_KEY);
  if (hit) return hit;

  const res = await fetchWithTimeout(url('/insights'), {
    headers: { Authorization: `Bearer ${SECRET}` },
  });
  if (!res.ok) throw new Error(`Financial insights: ${res.status} ${res.statusText}`);
  const data: FinancialInsights = await res.json();
  cacheSet(INSIGHTS_KEY, data);
  return data;
}

/** Prefetch all data on app mount. Resolves when done (never rejects). */
export function prefetchFinancial(): Promise<void> {
  return fetchFinancialInsights().then(() => {}).catch(() => {});
}
