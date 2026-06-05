import { useState } from 'react';
import { ChevronDown, ChevronUp, User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import type { KulwaQuestion } from '../types';
import { IntentBadge, EmptyState, Pagination } from './UI';

function FilterPills({
  options, selected, onSelect, label,
}: {
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (k: string) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--ink-3)' }}>
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
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
  );
}

interface KulwaTableProps {
  data: KulwaQuestion[];
  total: number;
  offset: number;
  limit: number;
  onPage: (offset: number) => void;
  intents: string[];
  selectedIntent: string;
  onIntentChange: (intent: string) => void;
}

export function KulwaQuestionsTable({
  data, total, offset, limit, onPage, intents, selectedIntent, onIntentChange,
}: KulwaTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const intentOptions = [
    { key: '', label: 'All' },
    ...intents.map((i) => ({ key: i, label: i.replace(/_/g, ' ') })),
  ];

  return (
    <div>
      <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
        <FilterPills options={intentOptions} selected={selectedIntent} onSelect={onIntentChange} label="Filter" />
      </div>

      {data.length === 0 ? (
        <EmptyState message="No conversations match this filter." />
      ) : (
        <>
          <div>
            {data.map((q) => {
              const isOpen = expanded === q.id;
              return (
                <div key={q.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <button
                    type="button"
                    className="w-full text-left px-5 py-4 flex items-start gap-3 transition-colors"
                    style={{ background: isOpen ? 'var(--accent-soft)' : 'var(--surface)' }}
                    onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                    onClick={() => setExpanded(isOpen ? null : q.id)}
                  >
                    <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-none mt-0.5"
                         style={{ background: 'var(--surface-3)' }}>
                      <User size={15} style={{ color: 'var(--ink-3)' }} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[13.5px] font-semibold leading-snug line-clamp-2" style={{ color: 'var(--ink)' }}>
                        {q.user_message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <IntentBadge intent={q.intent} />
                        <span className="text-[12px] font-medium tabular-nums" style={{ color: 'var(--ink-3)' }}>
                          {format(new Date(q.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-none w-7 h-7 rounded-[7px] flex items-center justify-center"
                         style={{ background: isOpen ? 'var(--accent)' : 'var(--surface-3)', color: isOpen ? '#fff' : 'var(--ink-3)' }}>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-3 animate-fadeUp"
                         style={{ background: 'var(--accent-soft)', borderTop: '1px solid rgba(0,170,64,0.15)' }}>
                      {q.bot_reply ? (
                        <div className="ml-[46px] flex gap-3">
                          <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-none mt-0.5"
                               style={{ background: 'var(--accent)' }}>
                            <Bot size={15} className="text-white" />
                          </div>
                          <div className="flex-1 rounded-[10px] px-4 py-3"
                               style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                            <p className="text-[10.5px] font-bold uppercase tracking-[0.06em] mb-2"
                               style={{ color: 'var(--accent-hover)' }}>Bot Response</p>
                            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--ink-2)' }}>
                              {q.bot_reply}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="ml-[46px] text-[12px] italic" style={{ color: 'var(--ink-3)' }}>
                          No reply recorded.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination offset={offset} limit={limit} total={total} onPage={onPage} unit="conversations" />
        </>
      )}
    </div>
  );
}
