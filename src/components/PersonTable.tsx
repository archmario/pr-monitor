'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { PersonSummary } from '@/lib/types';

type SortKey = 'github_login' | 'total' | 'merged' | 'open' | 'closed_unmerged' | 'open_conflict';

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'github_login', label: 'Person' },
  { key: 'total', label: 'Total' },
  { key: 'merged', label: 'Merged' },
  { key: 'open', label: 'Open' },
  { key: 'closed_unmerged', label: 'Closed, not merged' },
  { key: 'open_conflict', label: 'Needs a rebase' },
];

export function PersonTable({ people }: { people: PersonSummary[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [descending, setDescending] = useState(true);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (person) =>
        person.github_login.toLowerCase().includes(q) ||
        (person.display_name ?? '').toLowerCase().includes(q),
    );
  }, [people, query]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return descending ? -cmp : cmp;
    });
    return copy;
  }, [filtered, sortKey, descending]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDescending((v) => !v);
    } else {
      setSortKey(key);
      setDescending(true);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full sm:w-72">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by GitHub login or name..."
          className="w-full rounded-lg border border-edge bg-surface-raised py-2 pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-edge-strong focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-edge">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-edge bg-surface-overlay">
            {COLUMNS.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-2.5 font-medium text-fg-muted">
                <button
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className="flex items-center gap-1 hover:text-fg"
                >
                  {col.label}
                  {sortKey === col.key && <span className="text-xs">{descending ? '↓' : '↑'}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((person) => (
            <tr key={person.github_login} className="border-b border-edge last:border-0">
              <td className="px-4 py-2.5">
                <Link href={`/people/${person.github_login}`} className="font-medium text-fg hover:text-accent">
                  {person.display_name ?? person.github_login}
                </Link>
                {person.open_conflict > 0 && (
                  <span className="ml-2 inline-block rounded-full bg-conflict/10 px-2 py-0.5 text-xs text-conflict">
                    {person.open_conflict} stuck
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-fg-muted">{person.total}</td>
              <td className="px-4 py-2.5 text-merged">{person.merged}</td>
              <td className="px-4 py-2.5 text-open">{person.open}</td>
              <td className="px-4 py-2.5 text-closed-unmerged">{person.closed_unmerged}</td>
              <td className="px-4 py-2.5 text-conflict">{person.open_conflict}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-6 text-center text-sm text-fg-muted">
                No one matches &quot;{query}&quot;.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
