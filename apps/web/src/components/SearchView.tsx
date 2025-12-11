import type { Bookmark } from '@shared/index.js';
import { getDisplayUrl } from '@shared/index.js';
import { Search } from 'lucide-react';
import { useCallback } from 'react';
import { useBookmarkSearch } from '../hooks/useBookmarkSearch.ts';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation.ts';

interface SearchViewProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
}

export function SearchView({ bookmarks, isLoading }: SearchViewProps) {
  const { query, setQuery, results } = useBookmarkSearch(bookmarks);

  const openBookmark = useCallback(
    (index: number) => {
      const bookmark = results[index];
      if (bookmark) {
        window.open(bookmark.url, '_blank', 'noopener');
      }
    },
    [results]
  );

  const { activeIndex, handleKeyDown, setActiveIndex } = useKeyboardNavigation({
    itemCount: results.length,
    onEnter: openBookmark,
  });

  return (
    <div className="flex flex-col gap-10">
      <div className="mx-auto w-full max-w-3xl space-y-3">
        <div className="relative flex items-center rounded-3xl border border-white/20 bg-white/5 px-5 py-4 text-lg shadow-inner backdrop-blur-sm">
          <Search className="mr-3 h-5 w-5 text-white/40" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent font-display text-xl text-white placeholder-white/40 outline-none"
            placeholder="Search bookmarks..."
          />
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Enter</span>
        </div>
        <p className="text-center text-sm text-white/45">Use ↑ ↓ to navigate, Enter to open in a new tab.</p>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-3">
        {isLoading ? (
          <p className="text-center text-white/50">Loading bookmarks…</p>
        ) : results.length === 0 ? (
          <p className="text-center text-white/40">No bookmarks yet. Try adding your first favorite link.</p>
        ) : (
          results.map((bookmark, index) => (
            <button
              key={bookmark.id}
              type="button"
              onClick={() => openBookmark(index)}
              onMouseEnter={() => setActiveIndex(index)}
              data-active={activeIndex === index}
              className="group flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-left transition hover:border-white/30 hover:bg-white/10 data-[active=true]:border-white/40 data-[active=true]:bg-white/10"
            >
              <div className="space-y-1">
                <p className="font-display text-lg tracking-wide">{bookmark.title}</p>
                <p className="text-sm text-white/50">{getDisplayUrl(bookmark.url)}</p>
              </div>
              <span className="text-2xl text-white/40 transition group-hover:text-white/80">↩</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
