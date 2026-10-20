'use client';

import { useState } from 'react';
import type { ConflictEntry } from '@/lib/types';

/**
 * Collapse/expand pattern ported from the multi-agent-code-reviewer's
 * FindingCard: collapsed shows just enough to triage, expanded shows the
 * detail someone would need before reaching out to whoever's blocked.
 */
export function ConflictCard({ conflict }: { conflict: ConflictEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="animate-slide-up overflow-hidden rounded-lg border border-edge bg-surface-raised">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 flex-shrink-0 text-fg-subtle transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate text-sm font-medium text-fg">{conflict.title}</span>
        </div>
        <span className="flex-shrink-0 rounded-full bg-conflict/10 px-2.5 py-1 text-xs font-medium text-conflict">
          {conflict.author ?? 'unknown'}
        </span>
      </button>

      {expanded && (
        <div className="animate-fade-in grid grid-cols-2 gap-3 border-t border-edge px-4 py-3 text-sm sm:grid-cols-4">
          <Field label="Repo" value={conflict.repo} />
          <Field label="PR" value={`#${conflict.number}`} />
          <Field label="Mergeable state" value={conflict.mergeable_state ?? 'unknown'} />
          <Field label="Branches" value={`${conflict.head_branch ?? '?'} → ${conflict.base_branch ?? '?'}`} />
          <div className="col-span-2 sm:col-span-4">
            <a
              href={conflict.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:text-accent-hover"
            >
              Open on GitHub &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-fg-subtle">{label}</span>
      <span className="font-mono text-xs text-fg-muted">{value}</span>
    </div>
  );
}
