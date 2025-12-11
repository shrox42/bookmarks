import { useCallback, useEffect, useState } from 'react';

interface Options {
  itemCount: number;
  onEnter: (index: number) => void;
}

export function useKeyboardNavigation({ itemCount, onEnter }: Options) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= itemCount) {
      setActiveIndex(Math.max(0, itemCount - 1));
    }
  }, [itemCount, activeIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((previous) => (previous + 1) % Math.max(itemCount, 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((previous) => (previous - 1 + Math.max(itemCount, 1)) % Math.max(itemCount, 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (itemCount > 0) {
          onEnter(activeIndex);
        }
      }
    },
    [activeIndex, itemCount, onEnter]
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
}
