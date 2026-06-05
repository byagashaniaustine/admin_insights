import { useRef, useLayoutEffect, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Sparkline({ data, width = 80, height = 32, color = 'var(--accent)' }: {
  data: number[]; width?: number; height?: number; color?: string;
}) {
  if (!data || data.length < 2) return <svg width={width} height={height} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function DynamicBar({ percent, color }: { percent: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.style.width = `${percent}%`;
    ref.current.style.background = color;
  }, [percent, color]);
  return (
    <div ref={ref} className="h-full rounded-full transition-all duration-700 ease-out" />
  );
}

function Tip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line-strong)',
      borderRadius: '10px', padding: '9px 12px', boxShadow: 'var(--shadow-pop)', fontSize: '13px',
    }}>
      {label && (
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>
          {label}
        </p>
      )}
      <p style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '20px', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

const INTENT_COLORS = [
  '#00aa40', '#009636', '#007a2c', '#4bc178',
  '#2196f3', '#f59e0b', '#6366f1', '#ef4444',
  '#14b8a6', '#f97316',
];

interface IntentEntry { intent: string; count: number }

function IntentBarChartInner({ data }: { data: IntentEntry[] }) {
  const max   = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-4 py-2">
      {data.map((d, i) => {
        const barW = Math.round((d.count / max) * 100);
        return (
          <div key={d.intent} style={{ paddingBottom: '7px', borderBottom: '1px dashed var(--line)' }}
               className="last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-[20px] h-[20px] rounded-[6px] flex items-center justify-center text-[11px] font-bold flex-none"
                      style={{ background: 'var(--surface-3)', color: 'var(--ink-3)' }}>
                  {i + 1}
                </span>
                <span className="text-[14px] font-semibold capitalize" style={{ color: 'var(--ink)' }}>
                  {d.intent.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="font-mono text-[13px] font-semibold tabular-nums" style={{ color: 'var(--ink-2)' }}>
                {d.count.toLocaleString()}
              </span>
            </div>
            <div className="h-[8px] rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
              <DynamicBar percent={barW} color={INTENT_COLORS[i % INTENT_COLORS.length]} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const IntentBarChart = memo(IntentBarChartInner);

interface CategoryEntry { name: string; count: number }

function CategoryBarChartInner({ data }: { data: CategoryEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 48 }} barCategoryGap="40%">
        <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#E6E7E6" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#85878E', fontWeight: 600 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} height={80} />
        <YAxis tick={{ fontSize: 11, fill: '#85878E', fontWeight: 500 }} axisLine={false} tickLine={false} width={32} />
        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(0,170,64,0.06)', radius: 6 }} />
        <Bar dataKey="count" fill="url(#kopa-gradient)" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={600} />
        <defs>
          <linearGradient id="kopa-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00AA40" />
            <stop offset="100%" stopColor="#008833" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

export const CategoryBarChart = memo(CategoryBarChartInner);
