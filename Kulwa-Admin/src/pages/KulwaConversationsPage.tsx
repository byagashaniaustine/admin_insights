import { useState, useEffect, useCallback, useContext } from 'react';
import { RefreshCw, Search, Menu } from 'lucide-react';
import type { KulwaConversation, KulwaConversationsResponse } from '../types';
import {
  fetchKulwaConversations, bustKulwaCache,
  peekKulwaConversations, isFreshKulwaConversations,
} from '../api/kulwa';
import { TableSkeleton, ErrorBlock, Pagination } from '../components/UI';
import { AppContext } from '../context';

type DayOpt = 7 | 30 | 90;
type StatusFilter = '' | 'active' | 'resolved';

const DAY_OPTS: { label: string; value: DayOpt }[] = [
  { label: '7d',  value: 7  },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
];

const LIMIT = 50;

function ChannelBadge({ channel }: { channel: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    whatsapp: { bg: '#E6F7EC', color: '#008833' },
    sms:      { bg: '#E5EFFC', color: '#1570EF' },
    web:      { bg: '#F3E8FF', color: '#7C3AED' },
  };
  const s = colors[channel.toLowerCase()] ?? { bg: 'var(--surface-3)', color: 'var(--ink-3)' };
  return (
    <span className="inline-flex rounded-full text-[11px] font-bold capitalize"
          style={{ padding: '2px 9px', background: s.bg, color: s.color }}>
      {channel}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <span className="inline-flex items-center gap-1 rounded-full text-[11px] font-bold"
          style={{
            padding: '2px 9px',
            background: isActive ? 'var(--ok-soft, #E6F7EC)' : 'var(--surface-3)',
            color: isActive ? 'var(--ok, #00AA40)' : 'var(--ink-3)',
          }}>
      {isActive && <span className="live-dot scale-75" />}
      {status}
    </span>
  );
}

export default function KulwaConversationsPage() {
  const { openSidebar } = useContext(AppContext);
  const [days, setDays]           = useState<DayOpt>(7);
  const [status, setStatus]       = useState<StatusFilter>('');
  const [intent, setIntent]       = useState('');
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [offset, setOffset]       = useState(0);
  const [result, setResult]       = useState<KulwaConversationsResponse | null>(
    () => peekKulwaConversations(7, LIMIT, 0, '', '', '')
  );
  const [loading, setLoading]     = useState(!peekKulwaConversations(7, LIMIT, 0, '', '', ''));
  const [error, setError]         = useState<string | null>(null);
  const [knownIntents, setKnownIntents] = useState<string[]>([]);

  const load = useCallback(async (bust = false) => {
    if (bust) {
      bustKulwaCache();
    } else {
      const stale = peekKulwaConversations(days, LIMIT, offset, status, intent, search);
      if (stale) setResult(stale);
      if (isFreshKulwaConversations(days, LIMIT, offset, status, intent, search)) return;
      if (!stale) setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchKulwaConversations(days, LIMIT, offset, status, intent, search);
      setResult(data);
      setKnownIntents(prev => {
        const set = new Set([...prev, ...data.data.map(c => c.intent).filter(Boolean)]);
        return Array.from(set).sort();
      });
    } catch (e) {
      if (!result) setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [days, offset, status, intent, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const resetAndLoad = (patch: Partial<{ days: DayOpt; status: StatusFilter; intent: string; search: string }>) => {
    if ('days'   in patch) setDays(patch.days!);
    if ('status' in patch) setStatus(patch.status!);
    if ('intent' in patch) setIntent(patch.intent!);
    if ('search' in patch) setSearch(patch.search!);
    setOffset(0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetAndLoad({ search: searchInput });
  };

  const rows: KulwaConversation[] = result?.data ?? [];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4 flex flex-wrap items-center gap-3"
           style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>

        <button type="button" onClick={openSidebar} aria-label="Open sidebar"
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-[8px]"
                style={{ border: '1px solid var(--line)', color: 'var(--ink-3)' }}>
          <Menu size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-extrabold text-[22px] tracking-tight leading-none" style={{ color: 'var(--ink)' }}>
            Conversations
          </h1>
          {result && (
            <p className="text-[12px] mt-[3px]" style={{ color: 'var(--ink-3)' }}>
              {result.total.toLocaleString()} total conversations
            </p>
          )}
        </div>

        <div className="flex items-center gap-[3px] p-[3px] rounded-[8px]"
             style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
          {DAY_OPTS.map(opt => {
            const isActive = days === opt.value;
            return (
              <button key={opt.value} type="button" onClick={() => resetAndLoad({ days: opt.value })}
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

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
          <div className="relative">
            <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-3)' }} />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search name…"
              className="rounded-[8px] text-[13px] font-medium outline-none"
              style={{
                height: 36, paddingLeft: 30, paddingRight: 10,
                border: '1px solid var(--line)', background: 'var(--surface)',
                color: 'var(--ink)', width: 180,
              }}
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          {(['', 'active', 'resolved'] as StatusFilter[]).map(s => {
            const label = s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1);
            const isActive = status === s;
            return (
              <button key={s} type="button" onClick={() => resetAndLoad({ status: s })}
                      className="rounded-full text-[12px] font-semibold transition-all duration-150"
                      style={{
                        height: 30, padding: '0 12px', border: '1px solid var(--line)',
                        background: isActive ? 'var(--accent)' : 'var(--surface)',
                        color: isActive ? '#fff' : 'var(--ink-3)',
                      }}>
                {label}
              </button>
            );
          })}
        </div>

        <select
          value={intent}
          onChange={e => resetAndLoad({ intent: e.target.value })}
          className="rounded-[8px] text-[13px] font-medium outline-none"
          style={{
            height: 36, padding: '0 10px',
            border: '1px solid var(--line)', background: 'var(--surface)',
            color: 'var(--ink)', cursor: 'pointer',
          }}>
          <option value="">All intents</option>
          {knownIntents.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        <button type="button" onClick={() => load(true)} disabled={loading} aria-label="Refresh"
                className="w-10 h-10 flex items-center justify-center rounded-[8px] disabled:opacity-40"
                style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink-3)' }}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas)' }}>
        {error && !result ? (
          <div className="p-8"><ErrorBlock message={error} onRetry={load} /></div>
        ) : (
          <div className="card m-6 overflow-hidden animate-fadeUp">
            {loading && !result ? (
              <TableSkeleton rows={8} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                        {['Name', 'Channel', 'Intent', 'Messages', 'Duration', 'Started', 'Status'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em]"
                              style={{ color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>
                            No conversations found.
                          </td>
                        </tr>
                      ) : rows.map((row, idx) => (
                        <tr key={row.id}
                            style={{ borderBottom: idx < rows.length - 1 ? '1px solid var(--line)' : 'none' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <td className="px-5 py-3">
                            <p className="font-semibold" style={{ color: 'var(--ink)' }}>{row.name}</p>
                          </td>
                          <td className="px-5 py-3"><ChannelBadge channel={row.channel} /></td>
                          <td className="px-5 py-3">
                            <span className="inline-flex rounded-full text-[11px] font-semibold"
                                  style={{ padding: '2px 9px', background: 'var(--accent-soft)', color: 'var(--accent-hover)' }}>
                              {row.intent || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono tabular-nums" style={{ color: 'var(--ink-2)' }}>
                            {row.messages}
                          </td>
                          <td className="px-5 py-3" style={{ color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{row.duration}</td>
                          <td className="px-5 py-3" style={{ color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{row.started}</td>
                          <td className="px-5 py-3"><StatusPill status={row.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result && (
                  <Pagination offset={offset} limit={LIMIT} total={result.total} onPage={setOffset} unit="conversations" />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
