import { useState, useEffect, useCallback } from 'react';
import { Users, MessageSquare, Activity, RefreshCw, Menu } from 'lucide-react';
import { fetchFinancialInsights, bustFinancialCache, peekFinancialInsights, isFreshFinancialInsights } from '../api/financial';
import type { FinancialInsights } from '../types';
import { useAppContext } from '../context';
import StatCard from '../components/StatCard';
import { CategoryBarChart, LanguagePieChart } from '../components/Charts';
import { FinancialQuestionsTable } from '../components/QuestionsTable';
import { ErrorBlock, SectionCard, StatCardSkeleton, ChartSkeleton, TableSkeleton } from '../components/UI';

type Tab = 'overview' | 'questions';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'questions', label: 'Questions' },
];

export default function FinancialPage() {
  const { openSidebar } = useAppContext();
  const [data, setData]             = useState<FinancialInsights | null>(() => peekFinancialInsights());
  const [loading, setLoading]       = useState(!peekFinancialInsights());
  const [error, setError]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]               = useState<Tab>('overview');
  const [langFilter, setLangFilter] = useState('');
  const [qOffset, setQOffset]       = useState(0);

  const load = useCallback(async (bust = false) => {
    if (bust) {
      bustFinancialCache();
      setRefreshing(true);
    } else {
      const stale = peekFinancialInsights();
      if (stale) setData(stale);
      if (isFreshFinancialInsights()) return;
      if (!stale) setLoading(true);
    }
    setError(null);
    try {
      setData(await fetchFinancialInsights());
    } catch (e) {
      if (!data) setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setQOffset(0);
    setLangFilter('');
  };

  const categoryData = data
    ? Object.entries(data.summary.categoryBreakdown)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  const langData = data
    ? Object.entries(data.summary.languageBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden" style={{ background: 'var(--canvas)' }}>

      {/* Sticky top bar */}
      <div className="flex-shrink-0 sticky top-0 z-10"
           style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={openSidebar} aria-label="Open sidebar"
                    className="lg:hidden w-8 h-8 flex items-center justify-center rounded-[8px]"
                    style={{ color: 'var(--ink-3)' }}>
              <Menu size={18} aria-hidden="true" />
            </button>
            <div>
              <h1 className="font-extrabold text-[18px] tracking-tight" style={{ color: 'var(--ink)' }}>
                Financial Literacy TZ
              </h1>
              <p className="text-[12px]" style={{ color: 'var(--ink-3)' }}>
                {data
                  ? tab === 'questions'
                    ? `${data.recentQuestions.length.toLocaleString()} questions`
                    : 'Overview'
                  : 'Loading…'}
              </p>
            </div>
          </div>

          <button type="button" onClick={() => load(true)} disabled={refreshing}
                  className="btn-secondary flex items-center gap-1.5 disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-1 px-5 pb-0">
          {TABS.map(({ id, label }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                className="px-4 py-2 text-[13px] font-semibold transition-colors border-b-2"
                style={{
                  borderColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--ink-3)',
                  background: 'transparent',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && !data ? (
          <div className="p-5"><ErrorBlock message={error} onRetry={() => load(true)} /></div>
        ) : tab === 'overview' ? (
          <div className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {loading && !data ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : data ? (
                <>
                  <StatCard label="Total Users"     value={data.summary.totalUsers}     icon={Users}         subtitle="Registered users" />
                  <StatCard label="Total Messages"  value={data.summary.totalMessages}  icon={MessageSquare} subtitle="All time" />
                  <StatCard label="Active Sessions" value={data.summary.activeSessions} icon={Activity}      subtitle="Currently active" />
                </>
              ) : null}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Questions by Category" description="Top question topics">
                {loading && !data
                  ? <ChartSkeleton />
                  : data
                    ? <div className="px-4 pt-2 pb-2"><CategoryBarChart data={categoryData} /></div>
                    : null}
              </SectionCard>

              <SectionCard title="Language Distribution" description="English vs Kiswahili">
                {loading && !data
                  ? <ChartSkeleton height={200} />
                  : data
                    ? <div className="px-4 pt-2 pb-2"><LanguagePieChart data={langData} centerLabel={data.summary.totalUsers.toLocaleString()} /></div>
                    : null}
              </SectionCard>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="card overflow-hidden animate-fadeUp">
              {loading && !data
                ? <TableSkeleton rows={8} />
                : data
                  ? <FinancialQuestionsTable
                      data={data.recentQuestions}
                      langFilter={langFilter}
                      onLangFilter={setLangFilter}
                      offset={qOffset}
                      onPage={setQOffset}
                    />
                  : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
