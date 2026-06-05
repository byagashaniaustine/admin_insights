import type { KulwaSummary, KulwaQuestionsResponse, KulwaUsersResponse, DayFilter, KulwaOverview, KulwaConversationsResponse, KulwaTopics } from '../types';
import { cacheGet, cacheGetStale, cacheIsFresh, cacheSet, cacheBust } from '../lib/cache';

const BASE    = import.meta.env.VITE_KULWA_BASE_URL || '';
const API_KEY = import.meta.env.VITE_KULWA_API_KEY ?? '';

function headers(): HeadersInit {
  return { 'X-Insights-Key': API_KEY };
}

function url(path: string): string {
  return BASE ? `${BASE}${path}` : `/kulwa-api${path}`;
}

export function bustKulwaCache() {
  cacheBust('kulwa:');
}

// ─── Peek helpers (stale-while-revalidate) ────────────────────────

export function peekKulwaOverview(days: number): KulwaOverview | null {
  return cacheGetStale<KulwaOverview>(`kulwa:overview:${days}`);
}
export function isFreshKulwaOverview(days: number): boolean {
  return cacheIsFresh(`kulwa:overview:${days}`);
}

export function peekKulwaSummary(days: DayFilter): KulwaSummary | null {
  return cacheGetStale<KulwaSummary>(`kulwa:summary:${days}`);
}
export function isFreshKulwaSummary(days: DayFilter): boolean {
  return cacheIsFresh(`kulwa:summary:${days}`);
}

export function peekKulwaQuestions(days: DayFilter, limit: number, offset: number, intent?: string): KulwaQuestionsResponse | null {
  return cacheGetStale<KulwaQuestionsResponse>(`kulwa:questions:${days}:${limit}:${offset}:${intent ?? ''}`);
}
export function isFreshKulwaQuestions(days: DayFilter, limit: number, offset: number, intent?: string): boolean {
  return cacheIsFresh(`kulwa:questions:${days}:${limit}:${offset}:${intent ?? ''}`);
}

export function peekKulwaUsers(days: DayFilter, limit: number, offset: number): KulwaUsersResponse | null {
  return cacheGetStale<KulwaUsersResponse>(`kulwa:users:${days}:${limit}:${offset}`);
}
export function isFreshKulwaUsers(days: DayFilter, limit: number, offset: number): boolean {
  return cacheIsFresh(`kulwa:users:${days}:${limit}:${offset}`);
}

export function peekKulwaTopics(days: number): KulwaTopics | null {
  return cacheGetStale<KulwaTopics>(`kulwa:topics:${days}`);
}
export function isFreshKulwaTopics(days: number): boolean {
  return cacheIsFresh(`kulwa:topics:${days}`);
}

export function peekKulwaConversations(days: number, limit: number, offset: number, status: string, intent: string, search: string): KulwaConversationsResponse | null {
  return cacheGetStale<KulwaConversationsResponse>(`kulwa:conversations:${days}:${limit}:${offset}:${status}:${intent}:${search}`);
}
export function isFreshKulwaConversations(days: number, limit: number, offset: number, status: string, intent: string, search: string): boolean {
  return cacheIsFresh(`kulwa:conversations:${days}:${limit}:${offset}:${status}:${intent}:${search}`);
}

// ─── Fetch functions ──────────────────────────────────────────────

export async function fetchKulwaSummary(days: DayFilter): Promise<KulwaSummary> {
  const key = `kulwa:summary:${days}`;
  const hit = cacheGet<KulwaSummary>(key);
  if (hit) return hit;

  const params = days ? `?days=${days}` : '';
  const res = await fetch(url(`/insights/summary${params}`), { headers: headers() });
  if (!res.ok) throw new Error(`Kulwa summary: ${res.status} ${res.statusText}`);
  const data: KulwaSummary = await res.json();
  cacheSet(key, data);
  return data;
}

export async function fetchKulwaQuestions(
  days: DayFilter,
  limit = 50,
  offset = 0,
  intent?: string,
): Promise<KulwaQuestionsResponse> {
  const key = `kulwa:questions:${days}:${limit}:${offset}:${intent ?? ''}`;
  const hit = cacheGet<KulwaQuestionsResponse>(key);
  if (hit) return hit;

  const params = new URLSearchParams();
  if (days)   params.set('days',   String(days));
  if (intent) params.set('intent', intent);
  params.set('limit',  String(limit));
  params.set('offset', String(offset));

  const res = await fetch(url(`/insights/questions?${params}`), { headers: headers() });
  if (!res.ok) throw new Error(`Kulwa questions: ${res.status} ${res.statusText}`);
  const data: KulwaQuestionsResponse = await res.json();
  cacheSet(key, data);
  return data;
}

export async function fetchKulwaUsers(
  days: DayFilter,
  limit = 50,
  offset = 0,
): Promise<KulwaUsersResponse> {
  const key = `kulwa:users:${days}:${limit}:${offset}`;
  const hit = cacheGet<KulwaUsersResponse>(key);
  if (hit) return hit;

  const params = new URLSearchParams();
  if (days) params.set('days', String(days));
  params.set('limit',  String(limit));
  params.set('offset', String(offset));

  const res = await fetch(url(`/insights/users?${params}`), { headers: headers() });
  if (!res.ok) throw new Error(`Kulwa users: ${res.status} ${res.statusText}`);
  const data: KulwaUsersResponse = await res.json();
  cacheSet(key, data);
  return data;
}

export async function fetchKulwaOverview(days: number): Promise<KulwaOverview> {
  const key = `kulwa:overview:${days}`;
  const hit = cacheGet<KulwaOverview>(key);
  if (hit) return hit;

  const res = await fetch(url(`/insights/overview?days=${days}`), { headers: headers() });
  if (!res.ok) throw new Error(`Kulwa overview: ${res.status} ${res.statusText}`);
  const data: KulwaOverview = await res.json();
  cacheSet(key, data);
  return data;
}

export async function fetchKulwaConversations(
  days: number,
  limit = 50,
  offset = 0,
  status = '',
  intent = '',
  search = '',
): Promise<KulwaConversationsResponse> {
  const key = `kulwa:conversations:${days}:${limit}:${offset}:${status}:${intent}:${search}`;
  const hit = cacheGet<KulwaConversationsResponse>(key);
  if (hit) return hit;

  const params = new URLSearchParams();
  params.set('days',   String(days));
  params.set('limit',  String(limit));
  params.set('offset', String(offset));
  if (status) params.set('status', status);
  if (intent) params.set('intent', intent);
  if (search) params.set('search', search);

  const res = await fetch(url(`/insights/conversations?${params}`), { headers: headers() });
  if (!res.ok) throw new Error(`Kulwa conversations: ${res.status} ${res.statusText}`);
  const data: KulwaConversationsResponse = await res.json();
  cacheSet(key, data);
  return data;
}

export async function fetchKulwaTopics(days: number): Promise<KulwaTopics> {
  const key = `kulwa:topics:${days}`;
  const hit = cacheGet<KulwaTopics>(key);
  if (hit) return hit;

  const res = await fetch(url(`/insights/topics?days=${days}`), { headers: headers() });
  if (!res.ok) throw new Error(`Kulwa topics: ${res.status} ${res.statusText}`);
  const data: KulwaTopics = await res.json();
  cacheSet(key, data);
  return data;
}
