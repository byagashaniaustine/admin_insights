import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Menu } from 'lucide-react';
import { fetchFinancialInsights, bustFinancialCache } from '../api/financial';
import type { FinancialInsights } from '../types';
import { useAppContext } from '../context';
import { FinancialQuestionsTable } from '../components/QuestionsTable';
import { LoadingBlock, ErrorBlock } from '../components/UI';

export default function FinancialQuestionsPage() {
  const { openSidebar } = useAppContext();
  const [data, setData]         = useState<FinancialInsights | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [langFilter, setLangFilter] = useState('');
  const [offset, setOffset]         = useState(0);

  const load = useCallback(async (bust = false) => {
    try {
      if (bust) { bustFinancialCache(); setRefreshing(true); }
      else setLoading(true);
      setError(null);
      const result = await fetchFinancialInsights();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingBlock />;
  if (error)   return <ErrorBlock message={error} onRetry={() => load(true)} />;
  if (!data)   return null;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3"
           style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-center gap-3">
          <button type="button" onClick={openSidebar} aria-label="Open sidebar"
                  className="lg:hidden w-8 h-8 flex items-center justify-center rounded-[8px]"
                  style={{ color: 'var(--ink-3)' }}>
            <Menu size={18} aria-hidden="true" />
          </button>
          <div>
            <h1 className="font-extrabold text-[18px] tracking-tight" style={{ color: 'var(--ink)' }}>Questions</h1>
            <p className="text-[12px]" style={{ color: 'var(--ink-3)' }}>
              Recent questions — {data.recentQuestions.length.toLocaleString()} total
            </p>
          </div>
        </div>
        <button type="button" onClick={() => load(true)} disabled={refreshing}
                className="btn-secondary flex items-center gap-1.5 disabled:opacity-50">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="p-5">
        <div className="card overflow-hidden animate-fadeUp">
          <FinancialQuestionsTable
            data={data.recentQuestions}
            langFilter={langFilter}
            onLangFilter={setLangFilter}
            offset={offset}
            onPage={setOffset}
          />
        </div>
      </div>
    </div>
  );
}
