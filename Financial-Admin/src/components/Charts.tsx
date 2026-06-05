import { useRef, useLayoutEffect, memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

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

interface CategoryEntry { name: string; count: number }

function CategoryBarChartInner({ data }: { data: CategoryEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 48 }} barCategoryGap="40%">
        <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#E6E7E6" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#85878E', fontWeight: 600 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} height={80} />
        <YAxis tick={{ fontSize: 11, fill: '#85878E', fontWeight: 500 }} axisLine={false} tickLine={false} width={32} />
        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(21,112,239,0.06)', radius: 6 }} />
        <Bar dataKey="count" fill="url(#fin-gradient)" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={600} />
        <defs>
          <linearGradient id="fin-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1570EF" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
export const CategoryBarChart = memo(CategoryBarChartInner);

const LANG_FILL: Record<string, string> = { en: '#1570EF', sw: '#00aa40' };

interface LangEntry { name: string; value: number }

function LanguagePieChartInner({ data, centerLabel }: { data: LangEntry[]; centerLabel?: string }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={6} dataKey="value" nameKey="name" strokeWidth={2} stroke="#ffffff" animationDuration={600}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={LANG_FILL[entry.name] ?? ['#6366f1', '#f59e0b'][i % 2]} opacity={0.9} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0];
              const name = p.name === 'en' ? 'English' : p.name === 'sw' ? 'Kiswahili' : String(p.name);
              return (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--line-strong)', borderRadius: '10px', padding: '9px 12px', boxShadow: 'var(--shadow-pop)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '5px' }}>{name}</p>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '20px', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
                    {(p.value as number).toLocaleString()}
                  </p>
                </div>
              );
            }}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)' }}>
                {value === 'en' ? 'English' : value === 'sw' ? 'Kiswahili' : value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 pb-8 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="font-extrabold tabular-nums leading-none" style={{ fontSize: '30px', color: 'var(--accent)' }}>
              {centerLabel}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider mt-2" style={{ color: 'var(--ink-3)' }}>
              Users
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
export const LanguagePieChart = memo(LanguagePieChartInner);
