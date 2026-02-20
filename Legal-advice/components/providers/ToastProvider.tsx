'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'white',
          color: '#0F172A',
          border: '1px solid #E2E8F0',
        },
        className: 'font-sans',
      }}
    />
  );
}
