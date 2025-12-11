import { Bookmark } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from '@shared/ui';

export type View = 'search' | 'add' | 'manage';

interface LayoutProps {
  view: View;
  onNavigate: (view: View) => void;
  children: ReactNode;
}

const NAV_ITEMS: Array<{ view: View; label: string }> = [
  { view: 'search', label: 'Search' },
  { view: 'add', label: 'Add Bookmark' },
  { view: 'manage', label: 'Manage' },
];

export function Layout({ view, onNavigate, children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10 text-white sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
            <Bookmark className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Bookmark Logo</p>
            <p className="font-display text-2xl font-semibold tracking-wide">Bookmark Search</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.view}
              active={view === item.view}
              onClick={() => onNavigate(item.view)}
              type="button"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <section className="flex-1">{children}</section>
    </div>
  );
}
