'use client';

import { ClerkProvider } from '@clerk/nextjs';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#d946ef',
          colorBackground: '#09090b',
          colorText: '#f4f4f5',
          colorInputBackground: '#18181b',
          colorInputText: '#f4f4f5',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
