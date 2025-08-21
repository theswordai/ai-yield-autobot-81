import React, { Suspense } from 'react';

console.log('I18nProvider loading - React available:', !!React);

import '../lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  console.log('I18nProvider rendering - React available:', !!React);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}