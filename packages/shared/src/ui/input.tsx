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
      {label ? <span className="font-semibold text-base">{label}</span> : null}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-base text-white placeholder-white/50 outline-none focus:border-white/60 focus:bg-white/10',
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
