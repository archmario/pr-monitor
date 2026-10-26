import Link from 'next/link';
import type { MergedCount } from '@/lib/types';

// Ranked bars: a team's members by PRs merged in a week. Shows last week when
// "Last week" is selected, this week for every other period.
export function MergedThisWeek({
  rows,
  rangeLabel,
  teamName,
  team,
  lastWeek = false,
}: {
  rows: MergedCount[];
  rangeLabel: string;
  teamName: string;
  team: string;
  lastWeek?: boolean;
}) {
  const whose = teamName === 'All teams' ? 'Everyone’s' : `${teamName} team`;
  const when = lastWeek ? 'last week' : 'this week';
  const max = Math.max(1, ...rows.map((r) => r.merged));

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold text-fg">Merged {when}</h2>
        <p className="mt-0.5 text-sm text-fg-muted">
          {whose} PRs merged {lastWeek ? 'Monday to Sunday' : 'since Monday'}, most first &middot; {rangeLabel}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-edge bg-surface-raised px-4 py-6 text-center text-sm text-fg-muted">
          {lastWeek ? 'Nothing was merged last week.' : 'Nothing merged yet this week.'}
        </p>
      ) : (
        <ol className="flex flex-col gap-4 rounded-lg border border-edge bg-surface-raised px-4 py-4">
          {rows.map((row) => {
            const name = row.display_name ?? row.github_login;
            const label = `${name}: ${row.merged} PR${row.merged === 1 ? '' : 's'} merged ${when}`;
            return (
              <li key={row.github_login} title={label} aria-label={label} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <Link
                    href={`/people/${row.github_login}?team=${team}`}
                    className="truncate font-medium text-fg hover:text-accent"
                  >
                    {name}
                  </Link>
                  <span className="font-semibold tabular-nums text-fg">{row.merged}</span>
                </div>
                {/* Track + bar: square at the start, 4px rounded at the data end. */}
                <div className="h-2 w-full rounded-r-[4px] bg-surface-overlay">
                  <div
                    className="h-full rounded-r-[4px] bg-merged"
                    style={{ width: `${(row.merged / max) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
