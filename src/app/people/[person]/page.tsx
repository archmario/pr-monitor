import Link from 'next/link';
import { getPrs } from '@/lib/api';
import { BackLink } from '@/components/BackLink';
import { LibraryTag } from '@/components/LibraryTag';
import { StatusBadge, statusVariantFor } from '@/components/StatusBadge';

const PERIOD_LABELS: Record<string, string> = {
  all: 'All time',
  today: 'Today',
  week: 'This week',
  d30: 'Last 30 days',
  d90: 'Last 90 days',
};

function dayLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

function openedOn(iso: string): string {
  return new Date(`${iso.replace(/Z?$/, 'Z')}`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// One person's PRs. Opened from the dashboard it carries that view's filters
// (period, day, and which column was clicked), so "3" shows exactly those 3.
export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ person: string }>;
  searchParams: Promise<{
    team?: string;
    period?: string;
    day?: string;
    state?: string;
    merged?: string;
    conflict?: string;
  }>;
}) {
  const { person: githubLogin } = await params;
  const filters = await searchParams;

  const period = filters.period && PERIOD_LABELS[filters.period] ? filters.period : 'all';
  const team = filters.team ?? 'frontend';
  const prs = await getPrs({
    team,
    person: githubLogin,
    period,
    day: filters.day,
    state: filters.state as 'open' | 'closed' | undefined,
    merged: filters.merged === undefined ? undefined : filters.merged === 'true',
    conflict: filters.conflict === undefined ? undefined : filters.conflict === 'true',
  });

  // What this list is, in words: e.g. "Today · Merged".
  const statusLabel =
    filters.conflict === 'true'
      ? 'Needs a rebase'
      : filters.merged === 'true'
        ? 'Merged'
        : filters.state === 'open'
          ? 'Open'
          : filters.state === 'closed' && filters.merged === 'false'
            ? 'Closed, not merged'
            : null;
  const teamLabel = team === 'all' ? 'All teams' : `${team.charAt(0).toUpperCase()}${team.slice(1)}`;
  const scope = [teamLabel, filters.day ? dayLabel(filters.day) : PERIOD_LABELS[period], statusLabel]
    .filter(Boolean)
    .join(' · ');
  const isFiltered = period !== 'all' || Boolean(filters.day) || statusLabel !== null;

  const dashboardQuery = filters.day ? `period=week&day=${filters.day}` : `period=${period}`;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{githubLogin}</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {scope} &middot; {prs.length} PR{prs.length === 1 ? '' : 's'}, newest first
            {isFiltered && (
              <>
                {' '}
                &middot;{' '}
                <Link href={`/people/${githubLogin}?team=${team}`} className="text-accent hover:text-accent-hover">
                  show all their PRs
                </Link>
              </>
            )}
          </p>
        </div>
        <BackLink fallbackHref={`/${team}?${dashboardQuery}`} label="Back to dashboard" />
      </div>

      <div className="flex flex-col gap-2">
        {prs.map((pr) => (
          <a
            key={`${pr.repo}#${pr.number}`}
            href={pr.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col gap-2 rounded-lg border border-edge bg-surface-raised p-4 transition-colors hover:border-edge-strong sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm font-medium text-fg">{pr.title}</span>
              <span className="flex flex-wrap items-center gap-1.5 text-xs text-fg-subtle">
                {pr.repo} #{pr.number} &middot; opened {openedOn(pr.gh_created_at)}
                {pr.is_library && <LibraryTag />}
              </span>
            </div>
            <StatusBadge variant={statusVariantFor(pr)} />
          </a>
        ))}
        {prs.length === 0 && (
          <p className="rounded-lg border border-edge bg-surface-raised px-4 py-6 text-center text-sm text-fg-muted">
            No PRs match this view.
          </p>
        )}
      </div>
    </main>
  );
}
