import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from './utils.js';

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-white text-slate-900 hover:bg-slate-100 disabled:bg-slate-400 disabled:text-slate-600',
  ghost: 'bg-transparent text-white hover:bg-white/10 disabled:text-white/40',
  outline: 'border border-white/30 text-white hover:bg-white/10 disabled:text-white/40',
  danger: 'bg-rose-500 text-white hover:bg-rose-400 disabled:bg-rose-900/50',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
      {...props}
    />
  );
});
