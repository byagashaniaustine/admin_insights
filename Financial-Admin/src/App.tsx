import { useState, useEffect, lazy, Suspense } from 'react';
import type { Page } from './types';
import Sidebar from './components/Sidebar';
import { LoadingBlock } from './components/UI';
import { AppContext } from './context';
import { prefetchFinancial } from './api/financial';
import { useSlowFetch } from './lib/useSlowFetch';

const FinancialPage          = lazy(() => import('./pages/FinancialPage'));
const FinancialQuestionsPage = lazy(() => import('./pages/FinancialQuestionsPage'));

function SlowFetchToast() {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] text-[12.5px] font-medium animate-fadeUp"
         style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-pop)', color: 'var(--ink-2)' }}>
      <div className="relative w-4 h-4 flex-shrink-0">
        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
             style={{ borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent)' }} />
      </div>
      Fetching from server — usually takes 10–20s…
    </div>
  );
}

export default function App() {
  const [page, setPage]               = useState<Page>('summary');
  const [darkMode, setDarkMode]       = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prefetching, setPrefetching] = useState(true);

  useEffect(() => {
    const saved    = localStorage.getItem('darkMode') === 'true';
    const prefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark   = saved || (!localStorage.getItem('darkMode') && prefDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    // Kick off all API calls immediately on mount.
    prefetchFinancial().then(() => setPrefetching(false));
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', String(next));
  };

  const isSlow = useSlowFetch(prefetching);

  return (
    <AppContext.Provider value={{ darkMode, toggleDarkMode, openSidebar: () => setSidebarOpen(true) }}>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--canvas)' }}>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(21,30,62,0.4)' }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar
          activePage={page}
          onSelectPage={setPage}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <Suspense fallback={<div className="h-full flex items-center justify-center"><LoadingBlock /></div>}>
            {page === 'questions' ? <FinancialQuestionsPage /> : <FinancialPage />}
          </Suspense>
        </main>

        {isSlow && <SlowFetchToast />}

      </div>
    </AppContext.Provider>
  );
}
