import { useState, useEffect, useCallback } from 'react';
import type { KulwaUsersResponse, DayFilter } from '../types';
import { fetchKulwaUsers, peekKulwaUsers, isFreshKulwaUsers } from '../api/kulwa';
import FilterBar from '../components/FilterBar';
import UsersTable from '../components/UsersTable';
import { TableSkeleton, ErrorBlock, SectionCard } from '../components/UI';

const LIMIT = 50;

export default function KulwaUsersPage() {
  const [days, setDays]       = useState<DayFilter>(7);
  const [offset, setOffset]   = useState(0);
  const [users, setUsers]     = useState<KulwaUsersResponse | null>(() => peekKulwaUsers(7, LIMIT, 0));
  const [loading, setLoading] = useState(!peekKulwaUsers(7, LIMIT, 0));
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async (bust = false) => {
    if (!bust) {
      const stale = peekKulwaUsers(days, LIMIT, offset);
      if (stale) setUsers(stale);
      if (isFreshKulwaUsers(days, LIMIT, offset)) return;
      if (!stale) setLoading(true);
    }
    setError(null);
    try {
      setUsers(await fetchKulwaUsers(days, LIMIT, offset));
    } catch (e) {
      if (!users) setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [days, offset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleDays = (d: DayFilter) => { setDays(d); setOffset(0); };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <FilterBar days={days} onDaysChange={handleDays} onRefresh={() => load(true)} loading={loading}
        title="Users" subtitle="Kulwa-Kopagari" />

      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas)' }}>
        {error && !users ? (
          <div className="p-8"><ErrorBlock message={error} onRetry={load} /></div>
        ) : (
          <div className="p-6 max-w-[1600px] mx-auto">
            <SectionCard title="All Users" description={users ? `${users.total.toLocaleString()} total` : undefined}>
              {loading && !users
                ? <TableSkeleton rows={8} />
                : users
                  ? <UsersTable data={users.data} total={users.total} offset={offset} limit={LIMIT} onPage={setOffset} />
                  : null}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}
