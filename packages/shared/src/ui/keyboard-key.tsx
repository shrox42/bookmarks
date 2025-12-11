import type { HTMLAttributes } from 'react';
import { cn } from './utils.js';

export type KeyboardKeyProps = HTMLAttributes<HTMLSpanElement>;

export function KeyboardKey({ className, ...props }: KeyboardKeyProps) {
  return (
    <span
      className={cn(
        'rounded-lg border border-white/20 bg-white/5 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70',
        className
      )}
      {...props}
    />
  );
}
