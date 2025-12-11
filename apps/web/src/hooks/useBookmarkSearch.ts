import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import type { Bookmark } from '@shared/index.js';

export function useBookmarkSearch(source: Bookmark[]) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(source, {
        keys: ['title', 'url'],
        threshold: 0.3,
      }),
    [source]
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      return source;
    }
    return fuse.search(query).map((result) => result.item);
  }, [query, fuse, source]);

  return { query, setQuery, results };
}
