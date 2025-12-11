import type { ButtonHTMLAttributes } from 'react';
import { cn } from './utils.js';

export interface NavLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function NavLink({ className, active = false, ...props }: NavLinkProps) {
  return (
    <button
      data-active={active}
      className={cn(
        'rounded-full px-4 py-1 text-sm font-medium uppercase tracking-[0.2em] text-white/60 transition hover:text-white data-[active=true]:bg-white/10 data-[active=true]:text-white',
        className
      )}
      {...props}
    />
  );
}
