import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from './utils.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-2 text-sm text-white/80">
      {label ? <span className="text-base font-semibold tracking-wide text-white">{label}</span> : null}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-white/30 bg-transparent px-5 py-3 text-lg text-white placeholder-white/45 outline-none transition focus:border-white focus:bg-white/5 focus:ring-1 focus:ring-white/50',
          error ? 'border-rose-400 text-rose-100 placeholder-rose-200/60' : null,
          className
        )}
        {...props}
      />
      <span className="h-4 text-xs text-white/50">
        {error ? <span className="text-rose-300">{error}</span> : hint}
      </span>
    </label>
  );
});
