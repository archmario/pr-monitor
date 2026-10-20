'use client';

import { useState } from 'react';
import type { ConflictEntry } from '@/lib/types';
import { ConflictCard } from '@/components/ConflictCard';

export function NeedsAttentionSection({ conflicts }: { conflicts: ConflictEntry[] }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-left"
      >
        <svg
          className={`h-4 w-4 text-fg-subtle transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <h2 className="text-lg font-semibold text-fg">
          Needs attention{' '}
          {conflicts.length > 0 && <span className="text-fg-subtle">({conflicts.length})</span>}
        </h2>
      </button>

      {open &&
        (conflicts.length === 0 ? (
          <p className="rounded-lg border border-edge bg-surface-raised px-4 py-6 text-center text-sm text-fg-muted">
            No open PRs are currently blocked by a conflict.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {conflicts.map((conflict) => (
              <ConflictCard key={`${conflict.repo}#${conflict.number}`} conflict={conflict} />
            ))}
          </div>
        ))}
    </section>
  );
}
