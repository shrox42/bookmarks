import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur" />
      <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/15 bg-slate-900/90 p-8 text-white shadow-glass">
        <div className="mb-6 flex items-start justify-between gap-8">
          <div>
            <DialogPrimitive.Title className="font-display text-2xl font-semibold">{title}</DialogPrimitive.Title>
            {description ? <p className="text-sm text-white/60">{description}</p> : null}
          </div>
          <DialogPrimitive.Close className="text-white/50 transition hover:text-white">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
