export interface KulwaSummary {
  total_messages: number;
  unique_users: number;
  intent_breakdown: { intent: string; count: number }[];
  top_questions: { question: string; count: number }[];
}

export interface KulwaQuestion {
  id: string;
  phone_number: string;
  user_message: string;
  intent: string | null;
  bot_reply: string | null;
  created_at: string;
}

export interface KulwaQuestionsResponse {
  total: number;
  offset: number;
  limit: number;
  data: KulwaQuestion[];
}

export interface KulwaUser {
  phone_number: string;
  message_count: number;
  intents_used: string[];
  last_active: string;
}

export interface KulwaUsersResponse {
  total: number;
  offset: number;
  limit: number;
  data: KulwaUser[];
}

export type DayFilter = 7 | 30 | 90 | null;
export type Page = 'summary' | 'questions' | 'users' | 'conversations' | 'topics';

export interface KpiCard {
  id: string; label: string; icon: string;
  value: string; unit: string;
  delta_pct: number | null; delta_dir: 'up' | 'down'; good_dir: 'up' | 'down';
  sub: string; spark: number[]; live?: boolean;
}

export interface IntentTopic {
  id: string; name: string; desc: string;
  count: number; containment: number; avg_msgs: number; avg_handle: string;
  trend: number[]; delta_pct: number; dir: 'up' | 'down';
}

export interface KulwaOverview {
  period: { days: number; start: string | null; end: string | null };
  days: { key: string; date: string; iso: string }[];
  total_series: number[];
  unique_users_series: number[];
  heatmap: number[][];
  total_conversations: number; total_unique_users: number; containment_rate: number;
  kpis: KpiCard[];
  live_status: { status: string; active_now: number; in_queue: number; avg_wait: string; agents_online: number; last_updated: string };
  intents: IntentTopic[];
  needs_attention: IntentTopic[];
  channels: { id: string; label: string; share: number }[];
  wa_business: { name: string; number: string };
}

export interface KulwaConversation {
  id: string; name: string; phone: string; channel: string;
  window_open: boolean; intent: string; intent_id: string;
  messages: number; duration: string; started: string; status: string; sentiment: null;
}

export interface KulwaConversationsResponse {
  total: number; offset: number; limit: number; data: KulwaConversation[];
}

export interface KulwaTopics {
  total_conversations: number;
  intents: IntentTopic[];
  needs_attention: IntentTopic[];
  period_days: number;
}
