import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import type { ReactNode } from 'react';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push(toast: Omit<ToastMessage, 'id'>): void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { ...toast, id }]);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastContext.Provider value={value}>
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            duration={3000}
            className="mb-3 flex w-80 flex-col gap-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white shadow-glass backdrop-blur"
            onOpenChange={(open) => {
              if (!open) {
                setToasts((current) => current.filter((item) => item.id !== toast.id));
              }
            }}
          >
            <ToastPrimitive.Title className="font-semibold">{toast.title}</ToastPrimitive.Title>
            {toast.description ? (
              <ToastPrimitive.Description className="text-sm text-white/70">{toast.description}</ToastPrimitive.Description>
            ) : null}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-6 right-6 z-50 flex flex-col items-end" />
      </ToastContext.Provider>
    </ToastPrimitive.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
