import { Bookmark } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from '@bookmarks/shared/ui';

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
    <div className="min-h-screen bg-canvas text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-12 lg:px-16">
        <header className="flex flex-wrap items-center justify-between gap-6 border-b border-white/15 pb-6">
          <div className="flex items-center gap-3 text-white/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5">
              <Bookmark className="h-5 w-5" />
            </div>
            <p className="text-lg font-semibold tracking-wide">Bookmark Logo</p>
          </div>
          <nav className="flex items-center gap-6">
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
        <section className="flex-1 py-10">{children}</section>
      </div>
    </div>
  );
}
