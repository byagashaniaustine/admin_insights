import { useState, useEffect, useCallback, useContext } from 'react';
import { RefreshCw, AlertTriangle, Menu } from 'lucide-react';
import type { KulwaTopics, IntentTopic } from '../types';
import { fetchKulwaTopics, bustKulwaCache } from '../api/kulwa';
import { LoadingBlock, ErrorBlock } from '../components/UI';
import { Sparkline } from '../components/Charts';
import { AppContext } from '../context';

type DayOpt = 7 | 30 | 90;

const DAY_OPTS: { label: string; value: DayOpt }[] = [
  { label: '7d',  value: 7  },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
];

function containmentColor(rate: number) {
  if (rate >= 0.80) return 'var(--ok, #00AA40)';
  if (rate >= 0.65) return '#F59E0B';
  return 'var(--bad, #C7203F)';
}

function DeltaChip({ pct, dir }: { pct: number; dir: 'up' | 'down' }) {
  const isGood = dir === 'up';
  return (
    <span className="inline-flex items-center gap-[2px] rounded-full text-[11px] font-bold"
          style={{
            padding: '2px 7px',
            background: isGood ? 'var(--ok-soft, #E6F7EC)' : 'var(--bad-soft, #FFEEF2)',
            color: isGood ? 'var(--ok, #00AA40)' : 'var(--bad, #C7203F)',
          }}>
      {dir === 'up' ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function ContainmentBar({ rate }: { rate: number }) {
  const pct  = Math.round(rate * 100);
  const color = containmentColor(rate);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-semibold" style={{ color: 'var(--ink-3)' }}>Containment</span>
        <span className="text-[12px] font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
        <div className="h-full rounded-full transition-all duration-700"
             style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function IntentCard({ intent }: { intent: IntentTopic }) {
  return (
    <div className="card p-4 flex flex-col gap-3 animate-fadeUp">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] leading-snug" style={{ color: 'var(--ink)' }}>{intent.name}</p>
          {intent.desc && (
            <p className="text-[12px] mt-0.5 line-clamp-2" style={{ color: 'var(--ink-3)' }}>{intent.desc}</p>
          )}
        </div>
        <DeltaChip pct={intent.delta_pct} dir={intent.dir} />
      </div>

      <ContainmentBar rate={intent.containment} />

      <div className="flex items-end justify-between">
        <div className="flex gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--ink-3)' }}>Count</p>
            <p className="text-[18px] font-extrabold tabular-nums" style={{ color: 'var(--ink)' }}>
              {intent.count.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--ink-3)' }}>Avg msgs</p>
            <p className="text-[18px] font-extrabold tabular-nums" style={{ color: 'var(--ink)' }}>
              {intent.avg_msgs.toFixed(1)}
            </p>
          </div>
        </div>
        {intent.trend.length > 1 && (
          <Sparkline data={intent.trend} width={72} height={28} />
        )}
      </div>
    </div>
  );
}

export default function KulwaTopicsPage() {
  const { openSidebar } = useContext(AppContext);
  const [days, setDays]       = useState<DayOpt>(7);
  const [data, setData]       = useState<KulwaTopics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async (bust = false) => {
    if (bust) bustKulwaCache();
    setLoading(true); setError(null);
    try {
      const d = await fetchKulwaTopics(days);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 flex flex-wrap items-center gap-3"
           style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>

        <button type="button" onClick={openSidebar} aria-label="Open sidebar"
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-[8px]"
                style={{ border: '1px solid var(--line)', color: 'var(--ink-3)' }}>
          <Menu size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-extrabold text-[22px] tracking-tight leading-none" style={{ color: 'var(--ink)' }}>
            Topics
          </h1>
          {data && (
            <p className="text-[12px] mt-[3px]" style={{ color: 'var(--ink-3)' }}>
              {data.total_conversations.toLocaleString()} total conversations · {data.period_days}d window
            </p>
          )}
        </div>

        {/* Days toggle */}
        <div className="flex items-center gap-[3px] p-[3px] rounded-[8px]"
             style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
          {DAY_OPTS.map(opt => {
            const isActive = days === opt.value;
            return (
              <button key={opt.value} type="button" onClick={() => { setDays(opt.value); }}
                      className="rounded-[6px] text-[13px] font-semibold transition-all duration-150"
                      style={{
                        height: '32px', padding: '0 14px', border: 'none', cursor: 'pointer',
                        background: isActive ? 'var(--surface)' : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--ink-3)',
                        boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      }}>
                {opt.label}
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => load(true)} disabled={loading} aria-label="Refresh"
                className="w-10 h-10 flex items-center justify-center rounded-[8px] disabled:opacity-40"
                style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink-3)' }}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas)' }}>
        {error && !data ? (
          <div className="p-8"><ErrorBlock message={error} onRetry={load} /></div>
        ) : loading && !data ? (
          <LoadingBlock />
        ) : (
          <div className="p-6 space-y-5 max-w-[1600px] mx-auto">

            {/* Needs-attention section */}
            {data && data.needs_attention.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} style={{ color: '#B45309' }} />
                  <h2 className="font-bold text-[14px]" style={{ color: '#92400E' }}>
                    Needs Attention — Low Containment (&lt;65%)
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.needs_attention.map(intent => (
                    <div key={intent.id} style={{ outline: '2px solid #FBBF24', borderRadius: 12 }}>
                      <IntentCard intent={intent} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All intents grid */}
            {data && data.intents.length > 0 && (
              <div>
                <h2 className="font-bold text-[14px] mb-3" style={{ color: 'var(--ink-2)' }}>
                  All Intents
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.intents.map(intent => (
                    <IntentCard key={intent.id} intent={intent} />
                  ))}
                </div>
              </div>
            )}

            {data && data.intents.length === 0 && (
              <div className="py-16 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>
                No topic data yet for this period.
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
