import { useContext } from 'react';
import { LayoutDashboard, HelpCircle, BookOpen, X, Sun, Moon } from 'lucide-react';
import type { Page } from '../types';
import { AppContext } from '../context';

const ACCENT = '#1570EF';
const SOFT   = '#E5EFFC';
const HOVER  = '#1D4ED8';

const PAGES: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'summary',   label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'questions', label: 'Questions',  icon: HelpCircle },
];

interface Props {
  activePage: Page;
  onSelectPage: (p: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activePage, onSelectPage, isOpen, onClose }: Props) {
  const { darkMode, toggleDarkMode } = useContext(AppContext);

  return (
    <aside
      className={[
        'flex flex-col flex-shrink-0 transition-transform duration-300 z-40',
        'fixed inset-y-0 left-0 lg:relative lg:translate-x-0',
        'w-[244px]',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
      style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--line)' }}
    >
      {/* Brand */}
      <div className="flex items-center justify-between gap-3 px-[14px] pt-5 pb-5"
           style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-center gap-[11px]">
          <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-none"
               style={{ background: ACCENT }}>
            <BookOpen size={17} color="#fff" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-[17px] tracking-tight" style={{ color: 'var(--ink)' }}>FinLit Admin</span>
            <span className="text-[11px] font-semibold mt-[3px]" style={{ color: 'var(--ink-3)' }}>Financial Literacy TZ</span>
          </div>
        </div>
        <button type="button" onClick={onClose}
                className="lg:hidden w-8 h-8 flex items-center justify-center rounded-[8px]"
                style={{ color: 'var(--ink-3)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-[14px] py-4 flex flex-col gap-0.5">
        <p className="px-[10px] pb-[6px] pt-[10px] text-[10px] font-bold uppercase tracking-[0.08em]"
           style={{ color: 'var(--ink-3)' }}>
          Navigation
        </p>

        {PAGES.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => { onSelectPage(id); onClose(); }}
              className="w-full text-left flex items-center gap-[10px] px-[11px] py-[10px] rounded-[9px] transition-all duration-150"
              style={{
                background: isActive ? SOFT : 'transparent',
                color: isActive ? HOVER : 'var(--ink-2)',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Icon size={15} />
              <span className="text-[14px] font-semibold">{label}</span>
              {isActive && (
                <span className="ml-auto w-[6px] h-[6px] rounded-full flex-none"
                      style={{ background: ACCENT }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bot status card */}
      <div className="mx-[14px] mb-3 p-[13px] rounded-[12px]"
           style={{ border: '1px solid var(--line)', background: 'var(--surface-2)' }}>
        <div className="flex items-center gap-[9px]">
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-none"
               style={{ background: SOFT }}>
            <BookOpen size={14} color={ACCENT} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>FinLit TZ</p>
            <p className="text-[11px]" style={{ color: 'var(--ink-3)' }}>on WhatsApp Business</p>
          </div>
        </div>
        <div className="flex items-center gap-[6px] mt-[11px]" style={{ color: 'var(--ok)' }}>
          <span className="live-dot" />
          <span className="text-[12px] font-semibold">Operational</span>
        </div>
      </div>

      {/* Dark mode toggle */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className="mx-[14px] mb-[16px] flex items-center gap-[8px] px-[12px] py-[10px] rounded-[9px] transition-all duration-150 w-[calc(100%-28px)]"
        style={{ color: 'var(--ink-3)', background: 'transparent', border: '1px solid var(--line)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        <span className="text-[13px] font-semibold">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    </aside>
  );
}
