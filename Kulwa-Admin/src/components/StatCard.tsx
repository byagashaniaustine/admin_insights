import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  accent?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

function StatCard({ label, value, icon: Icon, subtitle, accent: accentBadge, trend, trendValue }: Props) {
  return (
    <div className="card animate-fadeUp" style={{ padding: '18px 20px 14px' }}>
      <div className="flex items-center justify-between">
        <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-none"
             style={{ background: 'var(--accent-soft)' }}>
          <Icon size={17} style={{ color: 'var(--accent)' }} />
        </div>
        {trend && trendValue && (
          <span className="inline-flex items-center gap-[3px] rounded-full text-[12px] font-bold"
                style={{
                  padding: '2px 8px',
                  background: trend === 'up' ? 'var(--ok-soft)' : 'var(--bad-soft)',
                  color:      trend === 'up' ? 'var(--ok)'      : 'var(--bad)',
                }}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-[13px] font-semibold mt-[13px]" style={{ color: 'var(--ink-2)' }}>{label}</p>
      <div className="flex items-baseline gap-[4px] mt-[10px]">
        <span className="font-extrabold leading-none tracking-tight"
              style={{ fontSize: '34px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap mt-[8px]">
        {subtitle && (
          <p className="text-[12px]" style={{ color: 'var(--ink-3)' }}>{subtitle}</p>
        )}
        {accentBadge && (
          <span className="inline-flex items-center rounded-full text-[11px] font-semibold"
                style={{ padding: '2px 8px', background: 'var(--accent-soft)', color: 'var(--accent-hover)' }}>
            {accentBadge}
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(StatCard);
