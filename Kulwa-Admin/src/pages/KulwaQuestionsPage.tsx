import { useState, useEffect, useCallback, useMemo } from 'react';
import type { KulwaQuestion, KulwaSummary, DayFilter } from '../types';
import { fetchKulwaQuestions, fetchKulwaSummary, bustKulwaCache } from '../api/kulwa';
import FilterBar from '../components/FilterBar';
import { KulwaQuestionsTable } from '../components/QuestionsTable';
import { LoadingBlock, ErrorBlock, SectionCard } from '../components/UI';

const PAGE = 50;

export default function KulwaQuestionsPage() {
  const [days, setDays]       = useState<DayFilter>(30);
  const [all, setAll]         = useState<KulwaQuestion[]>([]);
  const [summary, setSummary] = useState<KulwaSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [intent, setIntent]   = useState('');
  const [offset, setOffset]   = useState(0);

  const load = useCallback(async (bust = false) => {
    if (bust) bustKulwaCache();
    setLoading(true); setError(null);
    try {
      const [q, s] = await Promise.all([
        fetchKulwaQuestions(days, 200, 0),
        fetchKulwaSummary(days),
      ]);
      setAll(q.data); setSummary(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const handleDays   = (d: DayFilter) => { setDays(d); setOffset(0); setIntent(''); };
  const handleIntent = (i: string)    => { setIntent(i); setOffset(0); };

  const filtered = useMemo(() => intent ? all.filter((q) => q.intent === intent) : all, [all, intent]);
  const page     = useMemo(() => filtered.slice(offset, offset + PAGE), [filtered, offset]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <FilterBar days={days} onDaysChange={handleDays} onRefresh={() => load(true)}
        loading={loading} title="Conversations" subtitle="Kulwa-Kopagari" />

      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas)' }}>
        {error ? (
          <div className="p-8"><ErrorBlock message={error} onRetry={load} /></div>
        ) : (
          <div className="p-6 max-w-[1600px] mx-auto">
            <SectionCard title="All Conversations"
              description={all.length > 0 ? `${filtered.length.toLocaleString()} ${intent ? 'matching' : 'total'}` : undefined}>
              {loading && all.length === 0 ? <LoadingBlock /> : (
                <KulwaQuestionsTable
                  data={page} total={filtered.length} offset={offset} limit={PAGE} onPage={setOffset}
                  intents={summary?.intent_breakdown.map((x) => x.intent) ?? []}
                  selectedIntent={intent} onIntentChange={handleIntent}
                />
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}
