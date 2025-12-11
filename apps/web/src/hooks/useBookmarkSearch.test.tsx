import { renderHook, act } from '@testing-library/react';
import type { Bookmark } from '@shared/index.js';
import { describe, expect, it } from 'vitest';
import { useBookmarkSearch } from './useBookmarkSearch.ts';

const FIXTURES: Bookmark[] = [
  { id: '1', title: 'React – A JavaScript library', url: 'https://react.dev', createdAt: '', updatedAt: '' },
  { id: '2', title: 'Zod Validation', url: 'https://zod.dev', createdAt: '', updatedAt: '' },
];

describe('useBookmarkSearch', () => {
  it('returns original list when query is empty', () => {
    const { result } = renderHook(() => useBookmarkSearch(FIXTURES));
    expect(result.current.results).toHaveLength(2);
  });

  it('filters via fuzzy search when query set', () => {
    const { result } = renderHook(() => useBookmarkSearch(FIXTURES));
    act(() => result.current.setQuery('React'));
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toContain('React');
  });
});
