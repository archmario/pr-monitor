'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { recordInAppNavigation } from '@/lib/navigation';

// Mounted once in the root layout. Every time the path changes after the
// first render, it records that the visitor moved around inside the app.
export function NavigationTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    recordInAppNavigation();
  }, [pathname]);

  return null;
}
