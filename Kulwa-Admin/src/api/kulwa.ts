import type { KulwaSummary, KulwaQuestionsResponse, KulwaUsersResponse, DayFilter, KulwaOverview, KulwaConversationsResponse, KulwaTopics } from '../types';
import { cacheGet, cacheSet, cacheBust } from '../lib/cache';

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
