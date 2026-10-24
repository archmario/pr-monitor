'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cameFromInsideApp } from '@/lib/navigation';

// "Back" that returns to exactly where you were (same filters, search and
// scroll) when you arrived from inside the app, by using browser history.
// Opened directly (new tab, shared link), it goes to `fallbackHref` instead.
export function BackLink({ fallbackHref, label }: { fallbackHref: string; label: string }) {
  const router = useRouter();

  return (
    <Link
      href={fallbackHref}
      onClick={(event) => {
        if (cameFromInsideApp()) {
          event.preventDefault();
          router.back();
        }
      }}
      className="text-sm text-accent hover:text-accent-hover"
    >
      &larr; {label}
    </Link>
  );
}
