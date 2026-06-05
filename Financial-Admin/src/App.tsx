import { useState, useEffect, lazy, Suspense } from 'react';
import type { Page } from './types';
import Sidebar from './components/Sidebar';
import { LoadingBlock } from './components/UI';
import { AppContext } from './context';

const FinancialPage          = lazy(() => import('./pages/FinancialPage'));
const FinancialQuestionsPage = lazy(() => import('./pages/FinancialQuestionsPage'));

export default function App() {
  const [page, setPage]               = useState<Page>('summary');
  const [darkMode, setDarkMode]       = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved    = localStorage.getItem('darkMode') === 'true';
    const prefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark   = saved || (!localStorage.getItem('darkMode') && prefDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', String(next));
  };

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

      </div>
    </AppContext.Provider>
  );
}
