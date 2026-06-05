import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AlertTriangle, Activity } from 'lucide-react';
import type { KulwaOverview } from '../types';
import { fetchKulwaOverview, bustKulwaCache, peekKulwaOverview, isFreshKulwaOverview } from '../api/kulwa';
import FilterBar from '../components/FilterBar';
import { Sparkline } from '../components/Charts';
import { ChartSkeleton, KpiCardSkeleton, TableSkeleton, ErrorBlock, SectionCard } from '../components/UI';

type DayOpt = 7 | 30 | 90;

function DeltaChip({ pct, dir, goodDir }: { pct: number | null; dir: 'up' | 'down'; goodDir: 'up' | 'down' }) {
  if (pct === null) return null;
  const isGood = dir === goodDir;
  const bg    = isGood ? 'var(--ok-soft, #E6F7EC)' : 'var(--bad-soft, #FFEEF2)';
  const color = isGood ? 'var(--ok, #00AA40)'       : 'var(--bad, #C7203F)';
  const arrow = dir === 'up' ? '↑' : '↓';
  return (
    <span className="inline-flex items-center gap-[3px] rounded-full text-[11px] font-bold"
          style={{ padding: '2px 7px', background: bg, color }}>
      {arrow} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function containmentColor(rate: number) {
  if (rate >= 0.80) return 'var(--ok, #00AA40)';
  if (rate >= 0.65) return '#F59E0B';
  return 'var(--bad, #C7203F)';
}

export default function KulwaPage() {
  const [days, setDays] = useState<DayOpt>(7);
  const [data, setData] = useState<KulwaOverview | null>(() => peekKulwaOverview(7));
  const [loading, setLoading] = useState(!peekKulwaOverview(7));
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async (bust = false) => {
    if (bust) {
      bustKulwaCache();
    } else {
      const stale = peekKulwaOverview(days);
      if (stale) setData(stale);
      if (isFreshKulwaOverview(days)) return;
      if (!stale) setLoading(true);
    }
    setError(null);
    try {
      setData(await fetchKulwaOverview(days));
    } catch (e) {
      if (!data) setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const chartData = data
    ? data.days.map((d, i) => ({
        key: d.key,
        date: d.date,
        total: data.total_series[i] ?? 0,
        unique: data.unique_users_series[i] ?? 0,
      }))
    : [];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <FilterBar
        days={days}
        onDaysChange={(d) => setDays((d ?? 7) as DayOpt)}
        onRefresh={() => load(true)}
        loading={loading}
        title="Kulwa-Kopagari"
        subtitle="AI Car Loan Assistant · WhatsApp Business"
      />

      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas)' }}>
        {error && !data ? (
          <div className="p-8"><ErrorBlock message={error} onRetry={load} /></div>
        ) : (
          <div className="p-6 space-y-4 max-w-[1600px] mx-auto">

            {/* Live status strip */}
            {data && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold"
                   style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                <Activity size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--ink-2)' }}>Live:</span>
                <span style={{ color: 'var(--ok)' }}>
                  <span className="live-dot" style={{ marginRight: 5 }} />
                  {data.live_status.status}
                </span>
                <span style={{ color: 'var(--ink-3)' }}>·</span>
                <span style={{ color: 'var(--ink-2)' }}>{data.live_status.active_now} active now</span>
                <span style={{ color: 'var(--ink-3)' }}>·</span>
                <span style={{ color: 'var(--ink-2)' }}>{data.live_status.in_queue} in queue</span>
              </div>
            )}

            {/* Needs-attention banner */}
            {data && data.needs_attention.length > 0 && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-[10px]"
                   style={{ background: '#FFF7ED', border: '1px solid #FBBF24' }}>
                <AlertTriangle size={16} style={{ color: '#B45309', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p className="text-[13px] font-bold" style={{ color: '#92400E' }}>Needs attention</p>
                  <p className="text-[12.5px] mt-0.5" style={{ color: '#92400E' }}>
                    Low containment rate (&lt;65%): {data.needs_attention.map(i => i.name).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* KPI cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {loading && !data ? (
                <>
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
                </>
              ) : data ? (
                data.kpis.map((kpi) => (
                  <div key={kpi.id} className="card p-4 animate-fadeUp">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[12px] font-bold uppercase tracking-[0.07em]" style={{ color: 'var(--ink-3)' }}>
                        {kpi.label}
                      </p>
                      <DeltaChip pct={kpi.delta_pct} dir={kpi.delta_dir} goodDir={kpi.good_dir} />
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[30px] font-extrabold leading-none tabular-nums" style={{ color: 'var(--ink)' }}>
                          {kpi.value}{kpi.unit}
                        </p>
                        <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--ink-3)' }}>{kpi.sub}</p>
                      </div>
                      {kpi.spark.length > 1 && (
                        <Sparkline data={kpi.spark} width={80} height={32} />
                      )}
                    </div>
                  </div>
                ))
              ) : null}
            </div>

            {/* Daily messages chart */}
            <SectionCard title="Daily Activity"
              description={data ? `${data.period.start} – ${data.period.end}` : undefined}>
              {loading && !data ? <ChartSkeleton /> : data ? (
                <div className="px-2 pt-2 pb-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ov-total" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00AA40" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#00AA40" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="ov-unique" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2196F3" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#2196F3" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--line)" />
                      <XAxis dataKey="key" tick={{ fontSize: 11, fill: 'var(--ink-3)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--ink-3)', fontWeight: 500 }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line-strong)', borderRadius: 10, fontSize: 13 }}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      <Area type="monotone" dataKey="total" name="Total" stroke="#00AA40" fill="url(#ov-total)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      <Area type="monotone" dataKey="unique" name="Unique Users" stroke="#2196F3" fill="url(#ov-unique)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
            </SectionCard>

            {/* Intents table */}
            <SectionCard title="Intent Breakdown"
              description={data ? `${data.intents.length} intents tracked` : undefined}>
              {loading && !data ? <TableSkeleton rows={5} /> : data ? (
                data.intents.length === 0 ? (
                  <div className="py-12 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>No intent data yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                          {['Intent', 'Count', 'Containment', 'Avg Msgs', 'Trend'].map((h) => (
                            <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em]"
                                style={{ color: 'var(--ink-3)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.intents.map((intent, idx) => (
                          <tr key={intent.id}
                              style={{ borderBottom: idx < data.intents.length - 1 ? '1px solid var(--line)' : 'none' }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                            <td className="px-5 py-3">
                              <p className="font-semibold" style={{ color: 'var(--ink)' }}>{intent.name}</p>
                              {intent.desc && (
                                <p className="text-[11.5px] mt-0.5 line-clamp-1" style={{ color: 'var(--ink-3)' }}>{intent.desc}</p>
                              )}
                            </td>
                            <td className="px-5 py-3 font-mono font-semibold tabular-nums" style={{ color: 'var(--ink-2)' }}>
                              {intent.count.toLocaleString()}
                            </td>
                            <td className="px-5 py-3">
                              <span className="font-bold" style={{ color: containmentColor(intent.containment) }}>
                                {(intent.containment * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="px-5 py-3 font-mono tabular-nums" style={{ color: 'var(--ink-2)' }}>
                              {intent.avg_msgs.toFixed(1)}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <Sparkline data={intent.trend} width={60} height={24} />
                                <DeltaChip pct={intent.delta_pct} dir={intent.dir} goodDir="up" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : null}
            </SectionCard>

          </div>
        )}
      </div>
    </div>
  );
}
