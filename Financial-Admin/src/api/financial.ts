import type { FinancialInsights } from '../types';
import { cacheGet, cacheSet, cacheBust } from '../lib/cache';

const BASE   = import.meta.env.VITE_FINANCIAL_BASE_URL || '';
const SECRET = import.meta.env.VITE_FINANCIAL_SECRET ?? '';

function url(path: string): string {
  return BASE ? `${BASE}${path}` : `/financial-api${path}`;
}

export function bustFinancialCache() {
  cacheBust('financial:');
}

export async function fetchFinancialInsights(): Promise<FinancialInsights> {
  const key = 'financial:insights';
  const hit = cacheGet<FinancialInsights>(key);
  if (hit) return hit;

  const res = await fetch(url('/insights'), {
    headers: { Authorization: `Bearer ${SECRET}` },
  });
  if (!res.ok) throw new Error(`Financial insights: ${res.status} ${res.statusText}`);
  const data: FinancialInsights = await res.json();
  cacheSet(key, data);
  return data;
}
