import { AlertTriangle, RefreshCw } from 'lucide-react';

export function LoadingBlock() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fadeUp">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--line)' }} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
             style={{ borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent)' }} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--ink-3)' }}>Loading…</p>
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fadeUp">
      <div className="w-12 h-12 rounded-full flex items-center justify-center"
           style={{ background: 'var(--bad-soft)', border: '1px solid var(--bad)' }}>
        <AlertTriangle size={20} style={{ color: 'var(--bad)' }} />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>Error loading data</p>
        <p className="text-[13px] mt-1 max-w-sm leading-relaxed" style={{ color: 'var(--ink-3)' }}>{message}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-2 flex items-center gap-1.5">
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}

const intentStyle: Record<string, { bg: string; color: string }> = {
  flow_initiation:          { bg: '#F3E8FF', color: '#7C3AED' },
  loan_services_menu:       { bg: '#E5EFFC', color: '#1570EF' },
  car_inquiry:              { bg: '#E6F7EC', color: '#008833' },
  car_import_cost:          { bg: '#FEF3C7', color: '#B45309' },
  loan_question:            { bg: '#FFF7ED', color: '#C2410C' },
  faq:                      { bg: 'var(--surface-3)', color: 'var(--ink-3)' },
  loan_calculation:         { bg: '#CCFBF1', color: '#0F766E' },
  document_upload_reminder: { bg: '#FFEEF2', color: '#C7203F' },
  unknown:                  { bg: 'var(--surface-3)', color: 'var(--ink-3)' },
};

export function IntentBadge({ intent }: { intent: string | null }) {
  const label = intent ?? 'unknown';
  const s = intentStyle[label] ?? { bg: 'var(--accent-soft)', color: 'var(--accent-hover)' };
  return (
    <span className="inline-flex rounded-full text-[11.5px] font-semibold"
          style={{ padding: '3px 10px', background: s.bg, color: s.color }}>
      {label.replace(/_/g, ' ')}
    </span>
  );
}

export function SectionCard({ title, description, children, action }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden animate-fadeUp">
      <div className="flex items-center justify-between px-5 py-4"
           style={{ borderBottom: '1px solid var(--line)' }}>
        <div>
          <h3 className="font-bold text-[16px]" style={{ color: 'var(--ink)' }}>{title}</h3>
          {description && (
            <p className="text-[12px] mt-[2px]" style={{ color: 'var(--ink-3)' }}>{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-16 animate-fadeUp">
      <p className="text-[13px] font-medium" style={{ color: 'var(--ink-3)' }}>{message}</p>
    </div>
  );
}

export function Pagination({ offset, limit, total, onPage, unit = 'results' }: {
  offset: number; limit: number; total: number;
  onPage: (o: number) => void; unit?: string;
}) {
  const totalPages  = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3"
         style={{ borderTop: '1px solid var(--line)', background: 'var(--surface-2)' }}>
      <p className="text-[12.5px]" style={{ color: 'var(--ink-3)' }}>
        <span className="font-bold tabular-nums" style={{ color: 'var(--ink-2)' }}>
          {(offset + 1).toLocaleString()}–{Math.min(offset + limit, total).toLocaleString()}
        </span>{' '}of {total.toLocaleString()} {unit}
      </p>
      <div className="flex items-center gap-[6px]">
        <button type="button" onClick={() => onPage(Math.max(0, offset - limit))} disabled={offset === 0}
                className="h-[30px] px-3 rounded-[7px] text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink-2)' }}>
          ← Prev
        </button>
        <span className="text-[12px] font-bold tabular-nums px-2" style={{ color: 'var(--ink-3)' }}>
          {currentPage} / {totalPages}
        </span>
        <button type="button" onClick={() => onPage(offset + limit)} disabled={offset + limit >= total}
                className="h-[30px] px-3 rounded-[7px] text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink-2)' }}>
          Next →
        </button>
      </div>
    </div>
  );
}
