'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { PersonSummary } from '@/lib/types';

type SortKey = 'github_login' | 'total' | 'merged' | 'open' | 'closed_unmerged' | 'open_conflict';

const SORT_KEYS: SortKey[] = ['github_login', 'total', 'merged', 'open', 'closed_unmerged', 'open_conflict'];

// Each count column, and the extra filter its link adds on the person's page.
const COLUMNS: { key: SortKey; label: string; filter: string | null; color: string }[] = [
  { key: 'github_login', label: 'Person', filter: null, color: '' },
  { key: 'total', label: 'Total', filter: '', color: 'text-fg-muted' },
  { key: 'merged', label: 'Merged', filter: 'merged=true', color: 'text-merged' },
  { key: 'open', label: 'Open', filter: 'state=open', color: 'text-open' },
  { key: 'closed_unmerged', label: 'Closed, not merged', filter: 'state=closed&merged=false', color: 'text-closed-unmerged' },
  { key: 'open_conflict', label: 'Needs a rebase', filter: 'conflict=true', color: 'text-conflict' },
];

// Keeps the search text and sort in the address bar (without reloading), so
// coming back to the dashboard restores them.
function rememberInUrl(changes: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(window.history.state, '', url);
}

export function PersonTable({ people, periodQuery }: { people: PersonSummary[]; periodQuery: string }) {
  const searchParams = useSearchParams();
  const urlSort = searchParams.get('sort') as SortKey | null;

  const [sortKey, setSortKey] = useState<SortKey>(urlSort && SORT_KEYS.includes(urlSort) ? urlSort : 'total');
  const [descending, setDescending] = useState(searchParams.get('dir') !== 'asc');
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

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

  function updateQuery(value: string) {
    setQuery(value);
    rememberInUrl({ q: value.trim() ? value : null });
  }

  function toggleSort(key: SortKey) {
    const nextDescending = key === sortKey ? !descending : true;
    setSortKey(key);
    setDescending(nextDescending);
    rememberInUrl({
      sort: key === 'total' ? null : key,
      dir: nextDescending ? null : 'asc',
    });
  }

  // e.g. /people/ainaayomide?period=today&merged=true
  function personHref(login: string, filter: string) {
    const params = [periodQuery, filter].filter(Boolean).join('&');
    return `/people/${login}${params ? `?${params}` : ''}`;
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
          onChange={(e) => updateQuery(e.target.value)}
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
                  <Link
                    href={personHref(person.github_login, '')}
                    className="font-medium text-fg hover:text-accent"
                  >
                    {person.display_name ?? person.github_login}
                  </Link>
                  {person.open_conflict > 0 && (
                    <span className="ml-2 inline-block rounded-full bg-conflict/10 px-2 py-0.5 text-xs text-conflict">
                      {person.open_conflict} stuck
                    </span>
                  )}
                </td>
                {COLUMNS.slice(1).map((col) => {
                  const value = person[col.key] as number;
                  return (
                    <td key={col.key} className={`px-4 py-2.5 ${col.color}`}>
                      {value > 0 ? (
                        <Link
                          href={personHref(person.github_login, col.filter ?? '')}
                          title={`See ${person.github_login}'s ${col.label.toLowerCase()} PRs`}
                          className="rounded px-1 -mx-1 underline-offset-4 hover:bg-surface-overlay hover:underline"
                        >
                          {value}
                        </Link>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
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
