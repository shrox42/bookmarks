import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from './utils.js';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean;
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { className, spotlight = false, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-white shadow-[0px_30px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl',
        spotlight ? 'border-white/30 bg-white/5' : null,
        className
      )}
      {...props}
    />
  );
});
