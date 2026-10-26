import { BackLink } from '@/components/BackLink';
import { LibraryTag } from '@/components/LibraryTag';
import { getPrs } from '@/lib/api';
import { StatusBadge, statusVariantFor } from '@/components/StatusBadge';

export default async function PrsPage({
  searchParams,
}: {
  searchParams: Promise<{
    team?: string;
    period?: string;
    state?: string;
    merged?: string;
    conflict?: string;
    person?: string;
    repo?: string;
    day?: string;
  }>;
}) {
  const params = await searchParams;

  const team = params.team ?? 'frontend';
  const prs = await getPrs({
    team,
    period: params.period,
    state: params.state as 'open' | 'closed' | undefined,
    merged: params.merged === undefined ? undefined : params.merged === 'true',
    conflict: params.conflict === undefined ? undefined : params.conflict === 'true',
    person: params.person,
    repo: params.repo,
    day: params.day,
  });

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {prs.length} pull request{prs.length === 1 ? '' : 's'}
        </h1>
        <BackLink
          fallbackHref={`/${team}?${params.day ? `period=${params.period ?? 'week'}&day=${params.day}` : `period=${params.period ?? 'all'}`}`}
          label="Back to dashboard"
        />
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
                {pr.repo} #{pr.number} &middot; {pr.author ?? 'unknown'}
                {pr.is_library && <LibraryTag />}
              </span>
            </div>
            <StatusBadge variant={statusVariantFor(pr)} />
          </a>
        ))}
        {prs.length === 0 && (
          <p className="rounded-lg border border-edge bg-surface-raised px-4 py-6 text-center text-sm text-fg-muted">
            No PRs match this filter.
          </p>
        )}
      </div>
    </main>
  );
}
