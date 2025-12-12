import { Bookmark } from 'lucide-react';
import type { ReactNode } from 'react';

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
  const secondaryNav = NAV_ITEMS.filter((item) => item.view !== view);

  return (
    <div className="min-h-screen bg-canvas text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-12 lg:px-16">
        <header className="flex flex-wrap items-center justify-between gap-6 border-b border-white/15 pb-5">
          <div className="flex items-center gap-3 text-white/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-transparent">
              <Bookmark className="h-5 w-5" />
            </div>
            <p className="text-lg font-semibold tracking-wide">Bookmark Logo</p>
          </div>
          <nav className="flex items-center gap-6 text-sm font-semibold tracking-wide text-white/70">
            {secondaryNav.map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className="uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>
        <section className="flex-1 py-12">{children}</section>
      </div>
    </div>
  );
}
