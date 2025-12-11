import { act, renderHook } from '@testing-library/react';
import type { KeyboardEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useKeyboardNavigation } from './useKeyboardNavigation.ts';

const createKeyEvent = (key: string) =>
  ({
    key,
    preventDefault: vi.fn(),
  }) as unknown as KeyboardEvent;

describe('useKeyboardNavigation', () => {
  it('moves selection with arrow keys', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ itemCount: 3, onEnter: vi.fn() }));
    act(() => result.current.handleKeyDown(createKeyEvent('ArrowDown')));
    expect(result.current.activeIndex).toBe(1);
    act(() => result.current.handleKeyDown(createKeyEvent('ArrowUp')));
    expect(result.current.activeIndex).toBe(0);
  });

  it('invokes callback on Enter', () => {
    const onEnter = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation({ itemCount: 2, onEnter }));
    act(() => result.current.handleKeyDown(createKeyEvent('Enter')));
    expect(onEnter).toHaveBeenCalledWith(0);
  });
});
