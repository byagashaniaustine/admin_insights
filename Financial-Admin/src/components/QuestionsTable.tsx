import { User } from 'lucide-react';
import { format } from 'date-fns';
import type { FinancialQuestion } from '../types';
import { LangBadge, CategoryBadge, Pagination } from './UI';

const PAGE = 25;

const LANG_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'en', label: 'English' },
  { key: 'sw', label: 'Kiswahili' },
];

interface Props {
  data: FinancialQuestion[];
  langFilter: string;
  onLangFilter: (lang: string) => void;
  offset: number;
  onPage: (offset: number) => void;
}

export function FinancialQuestionsTable({ data, langFilter, onLangFilter, offset, onPage }: Props) {
  const filtered = langFilter ? data.filter((q) => q.language === langFilter) : data;
  const page = filtered.slice(offset, offset + PAGE);

  return (
    <div>
      <div className="px-5 py-3 flex items-center gap-4 flex-wrap"
           style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
        <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--ink-3)' }}>Language</span>
        <div className="flex flex-wrap gap-2">
          {LANG_OPTIONS.map((opt) => {
            const isActive = langFilter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => { onLangFilter(opt.key); onPage(0); }}
                className="rounded-full text-[12px] font-semibold transition-all duration-150"
                style={{
                  padding: '4px 12px',
                  background: isActive ? 'var(--accent)' : 'var(--surface-2)',
                  color: isActive ? '#fff' : 'var(--ink-2)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--line)'}`,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-[13px] font-medium" style={{ color: 'var(--ink-3)' }}>No questions found.</p>
        </div>
      ) : (
        <>
          <div>
            {page.map((q, i) => (
              <div
                key={i}
                className="px-5 py-4 flex items-start gap-3 cursor-default"
                style={{
                  borderBottom: i < page.length - 1 ? '1px solid var(--line)' : 'none',
                  background: 'var(--surface)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
              >
                <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-none mt-0.5"
                     style={{ background: 'var(--accent-soft)' }}>
                  <User size={15} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold leading-snug line-clamp-2" style={{ color: 'var(--ink)' }}>
                    {q.question}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <CategoryBadge category={q.category} />
                    <LangBadge lang={q.language} />
                    <span className="text-[12px] font-medium tabular-nums" style={{ color: 'var(--ink-3)' }}>
                      {format(new Date(q.askedAt), 'MMM d, HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination offset={offset} limit={PAGE} total={filtered.length} onPage={onPage} unit="questions" />
        </>
      )}
    </div>
  );
}
