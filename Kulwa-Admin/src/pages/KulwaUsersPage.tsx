import { useState, useEffect, useCallback } from 'react';
import type { KulwaUsersResponse, DayFilter } from '../types';
import { fetchKulwaUsers } from '../api/kulwa';
import FilterBar from '../components/FilterBar';
import UsersTable from '../components/UsersTable';
import { LoadingBlock, ErrorBlock, SectionCard } from '../components/UI';

export default function KulwaUsersPage() {
  const [days, setDays]     = useState<DayFilter>(30);
  const [users, setUsers]   = useState<KulwaUsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setUsers(await fetchKulwaUsers(days, 50, offset)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setLoading(false); }
  }, [days, offset]);

  useEffect(() => { load(); }, [load]);

  const handleDays = (d: DayFilter) => { setDays(d); setOffset(0); };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <FilterBar days={days} onDaysChange={handleDays} onRefresh={load} loading={loading}
        title="Users" subtitle="Kulwa-Kopagari" />

      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas)' }}>
        {error ? (
          <div className="p-8"><ErrorBlock message={error} onRetry={load} /></div>
        ) : (
          <div className="p-6 max-w-[1600px] mx-auto">
            <SectionCard title="All Users" description={users ? `${users.total.toLocaleString()} total` : undefined}>
              {loading && !users ? <LoadingBlock /> : users ? (
                <UsersTable data={users.data} total={users.total} offset={offset} limit={50} onPage={setOffset} />
              ) : <LoadingBlock />}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}
