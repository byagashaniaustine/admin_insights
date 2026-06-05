export interface FinancialSummary {
  totalUsers: number;
  activeSessions: number;
  totalMessages: number;
  languageBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
}

export interface FinancialQuestion {
  question: string;
  category: string | null;
  language: string;
  askedAt: string;
}

export interface FinancialInsights {
  summary: FinancialSummary;
  recentQuestions: FinancialQuestion[];
}

export type Page = 'summary' | 'questions';
