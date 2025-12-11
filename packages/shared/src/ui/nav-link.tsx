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
        'border-b-2 border-transparent pb-1 text-base font-semibold tracking-wide text-white/60 transition-colors hover:text-white data-[active=true]:border-white data-[active=true]:text-white',
        className
      )}
      {...props}
    />
  );
}
