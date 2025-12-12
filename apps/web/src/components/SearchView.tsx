import type { Bookmark } from '@bookmarks/shared';
import { getDisplayUrl } from '@bookmarks/shared';
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
    <div className="flex flex-col gap-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative flex items-center gap-3 rounded-xl border border-white/25 bg-white/5 px-6 py-4 text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Search className="h-5 w-5 text-white/50" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent font-display text-xl tracking-wide text-white placeholder-white/50 outline-none"
            placeholder="Search bookmarks..."
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        {isLoading ? (
          <p className="text-center text-white/50">Loading bookmarks…</p>
        ) : results.length === 0 ? (
          <p className="text-center text-white/40">No bookmarks yet. Try adding your first favorite link.</p>
        ) : (
          <div className="space-y-2">
            {results.map((bookmark, index) => (
              <button
                key={bookmark.id}
                type="button"
                onClick={() => openBookmark(index)}
                onMouseEnter={() => setActiveIndex(index)}
                data-active={activeIndex === index}
                className="group flex w-full items-center justify-between rounded-xl border border-white/15 px-6 py-4 text-left transition hover:border-white/40 hover:bg-white/5 data-[active=true]:border-white/60 data-[active=true]:bg-white/10"
              >
                <div className="space-y-1">
                  <p className="font-display text-lg tracking-wide text-white">{bookmark.title}</p>
                  <p className="text-sm text-white/50">{getDisplayUrl(bookmark.url)}</p>
                </div>
                <span className="text-2xl text-white/40 transition group-hover:text-white">↩</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
