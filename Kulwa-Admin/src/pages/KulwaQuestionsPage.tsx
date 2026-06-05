import { useState, useEffect, useCallback } from 'react';
import type { KulwaQuestionsResponse, KulwaSummary, DayFilter } from '../types';
import {
  fetchKulwaQuestions, fetchKulwaSummary, bustKulwaCache,
  peekKulwaQuestions, isFreshKulwaQuestions,
  peekKulwaSummary,
} from '../api/kulwa';
import FilterBar from '../components/FilterBar';
import { KulwaQuestionsTable } from '../components/QuestionsTable';
import { TableSkeleton, ErrorBlock, SectionCard } from '../components/UI';

const PAGE = 50;

export default function KulwaQuestionsPage() {
  const [days, setDays]       = useState<DayFilter>(7);
  const [intent, setIntent]   = useState('');
  const [offset, setOffset]   = useState(0);
  const [result, setResult]   = useState<KulwaQuestionsResponse | null>(() => peekKulwaQuestions(7, PAGE, 0));
  const [summary, setSummary] = useState<KulwaSummary | null>(() => peekKulwaSummary(7));
  const [loading, setLoading] = useState(!peekKulwaQuestions(7, PAGE, 0));
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async (bust = false) => {
    if (bust) {
      bustKulwaCache();
    } else {
      const staleQ = peekKulwaQuestions(days, PAGE, offset, intent);
      const staleS = peekKulwaSummary(days);
      if (staleQ) setResult(staleQ);
      if (staleS) setSummary(staleS);
      if (isFreshKulwaQuestions(days, PAGE, offset, intent)) return;
      if (!staleQ) setLoading(true);
    }
    setError(null);
    try {
      const [q, s] = await Promise.all([
        fetchKulwaQuestions(days, PAGE, offset, intent),
        fetchKulwaSummary(days),
      ]);
      setResult(q);
      setSummary(s);
    } catch (e) {
      if (!result) setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [days, offset, intent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleDays   = (d: DayFilter) => { setDays(d); setOffset(0); setIntent(''); };
  const handleIntent = (i: string)    => { setIntent(i); setOffset(0); };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <FilterBar days={days} onDaysChange={handleDays} onRefresh={() => load(true)}
        loading={loading} title="Conversations" subtitle="Kulwa-Kopagari" />

      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas)' }}>
        {error && !result ? (
          <div className="p-8"><ErrorBlock message={error} onRetry={load} /></div>
        ) : (
          <div className="p-6 max-w-[1600px] mx-auto">
            <SectionCard title="All Conversations"
              description={result ? `${result.total.toLocaleString()} ${intent ? 'matching' : 'total'}` : undefined}>
              {loading && !result ? <TableSkeleton rows={8} /> : result ? (
                <KulwaQuestionsTable
                  data={result.data}
                  total={result.total}
                  offset={offset}
                  limit={PAGE}
                  onPage={setOffset}
                  intents={summary?.intent_breakdown.map((x) => x.intent) ?? []}
                  selectedIntent={intent}
                  onIntentChange={handleIntent}
                />
              ) : null}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}
