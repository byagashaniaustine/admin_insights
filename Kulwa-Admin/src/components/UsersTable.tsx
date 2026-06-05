import { formatDistanceToNow, format } from 'date-fns';
import type { KulwaUser } from '../types';
import { IntentBadge, EmptyState, Pagination } from './UI';

interface Props {
  data: KulwaUser[];
  total: number;
  offset: number;
  limit: number;
  onPage: (offset: number) => void;
}

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return phone.slice(0, 5) + ' ••••• ' + phone.slice(-3);
}

export default function UsersTable({ data, total, offset, limit, onPage }: Props) {
  if (data.length === 0) return <EmptyState message="No users found." />;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.04em] w-10" style={{ color: 'var(--ink-3)' }}>#</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: 'var(--ink-3)' }}>Phone</th>
              <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: 'var(--ink-3)' }}>Messages</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: 'var(--ink-3)' }}>Intents Used</th>
              <th className="text-left px-4 py-3 pr-5 text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: 'var(--ink-3)' }}>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user, i) => (
              <tr key={i} className="cursor-default" style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}>
                <td className="px-5 py-3 text-[12px] font-bold tabular-nums" style={{ color: 'var(--ink-3)' }}>
                  {offset + i + 1}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[13.5px] font-semibold" style={{ color: 'var(--ink)' }}>
                    {maskPhone(user.phone_number)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-[13.5px] font-bold tabular-nums" style={{ color: 'var(--accent-hover)' }}>
                    {user.message_count.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {user.intents_used.slice(0, 3).map((intent) => (
                      <IntentBadge key={intent} intent={intent} />
                    ))}
                    {user.intents_used.length > 3 && (
                      <span className="inline-flex items-center rounded-full text-[11px] font-bold"
                            style={{ padding: '3px 8px', background: 'var(--surface-3)', color: 'var(--ink-3)' }}>
                        +{user.intents_used.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 pr-5" title={format(new Date(user.last_active), 'PPpp')}>
                  <div className="flex items-center gap-2">
                    <span className="w-[6px] h-[6px] rounded-full flex-none" style={{ background: 'var(--ok)' }} />
                    <span className="text-[12.5px] font-medium" style={{ color: 'var(--ink-3)' }}>
                      {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination offset={offset} limit={limit} total={total} onPage={onPage} unit="users" />
    </div>
  );
}
