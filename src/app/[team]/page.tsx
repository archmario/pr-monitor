import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConflicts, getLastSync, getMergedInWeek, getPeople, getSummary, getTeams } from '@/lib/api';
import type { Period } from '@/lib/types';
import { daysOfWeek, isoWeekNumber, isSelectableDay, weekRangeLabel, weeksBack } from '@/lib/week';
import { PeriodToggle } from '@/components/PeriodToggle';
import { HeadlineCard } from '@/components/HeadlineCard';
import { LibraryTag } from '@/components/LibraryTag';
import { MergedThisWeek } from '@/components/MergedThisWeek';
import { NeedsAttentionSection } from '@/components/NeedsAttentionSection';
import { PersonTable } from '@/components/PersonTable';
import { SyncStatus } from '@/components/SyncStatus';
import { TeamIcon } from '@/components/TeamIcon';
import { TeamSwitcher } from '@/components/TeamSwitcher';
import { WeekDayStrip } from '@/components/WeekDayStrip';

const PERIODS: Period[] = ['all', 'today', 'week', 'lastweek', 'd30', 'd90'];

function isPeriod(value: string | undefined): value is Period {
  return PERIODS.includes(value as Period);
}

// One dashboard for every team: /frontend, /backend, /mobile, and /all for
// everyone together.
export default async function TeamDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ team: string }>;
  searchParams: Promise<{ period?: string; day?: string }>;
}) {
  const { team: slug } = await params;
  const { period: periodParam, day: dayParam } = await searchParams;

  const teams = await getTeams();
  const team = teams.find((t) => t.slug === slug);
  if (!team && slug !== 'all') notFound();

  const teamName = team ? team.name : 'All teams';
  const heading = team ? `${team.name} team` : 'All teams';
  const ready = team ? team.set_up : teams.some((t) => t.set_up);
  const libraries = team ? team.libraries : teams.flatMap((t) => (t.set_up ? t.libraries : []));

  const period: Period = isPeriod(periodParam) ? periodParam : 'all';
  // "This week" and "Last week" get a Mon-Sun strip; a single day can only be
  // picked from inside one of them.
  const lastWeek = period === 'lastweek';
  const weeksAgo = lastWeek ? 1 : 0;
  const showWeekStrip = period === 'week' || lastWeek;
  const day = showWeekStrip && isSelectableDay(dayParam, weeksAgo) ? dayParam : null;
  const weekDays = showWeekStrip ? daysOfWeek(weeksAgo) : [];
  // The ranking shows last week under "Last week", and this week otherwise.
  const rankingWeek = weeksBack(weeksAgo);

  // Carried into every link so switching team or drilling down keeps the same slice.
  const query = day ? `period=${period}&day=${day}` : `period=${period}`;
  const basePath = `/${slug}`;

  const header = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-xs font-medium text-fg-subtle hover:text-accent">
          &larr; KodeHauz PR Monitor
        </Link>
        <TeamSwitcher teams={teams} current={slug} periodQuery={query} />
      </div>
    </div>
  );

  if (!ready) {
    return (
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        {header}
        <section className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-edge bg-surface-raised/50 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-overlay text-fg-subtle">
            <TeamIcon slug={slug} />
          </span>
          <h1 className="text-xl font-semibold text-fg">The {teamName.toLowerCase()} dashboard is coming soon</h1>
          <p className="max-w-md text-sm text-fg-muted">
            Its repos are already being synced. It goes live as soon as the team&rsquo;s members are confirmed.
          </p>
        </section>
      </main>
    );
  }

  const [summary, people, conflicts, lastSync, mergedThisWeek, dayCounts] = await Promise.all([
    getSummary(slug, period, day),
    getPeople(slug, period, day),
    getConflicts(slug),
    getLastSync(),
    getMergedInWeek(slug, lastWeek ? 'lastweek' : 'week'),
    // One small summary call per day so far this week, for the counts in the strip.
    Promise.all(
      weekDays
        .filter((d) => !d.isFuture)
        .map(async (d) => [d.iso, (await getSummary(slug, period, d.iso)).total] as const),
    ),
  ]);

  const prsQuery = `team=${slug}&${query}`;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      {header}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-fg">
            <TeamIcon slug={slug} className="h-6 w-6 text-brand-blue dark:text-[#6E93E6]" />
            {heading}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {summary.people} people have opened {summary.total} PRs
            {summary.open_conflict > 0
              ? `, and ${summary.open_conflict} need a rebase right now.`
              : ' - nothing is currently stuck on a conflict.'}
          </p>
          {libraries.length > 0 && (
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-fg-subtle">
              <LibraryTag />
              Includes shared libraries: {libraries.join(', ')}
            </p>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <PeriodToggle current={period} basePath={basePath} />
          <SyncStatus initialRun={lastSync} />
        </div>
      </header>

      {showWeekStrip && (
        <WeekDayStrip
          days={weekDays}
          counts={Object.fromEntries(dayCounts)}
          selectedDay={day}
          weekNumber={isoWeekNumber(rankingWeek)}
          rangeLabel={weekRangeLabel(rankingWeek)}
          basePath={basePath}
          period={lastWeek ? 'lastweek' : 'week'}
        />
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <HeadlineCard label="Total PRs" value={summary.total} href={`/prs?${prsQuery}`} />
        <HeadlineCard
          label="Merged"
          value={summary.merged}
          href={`/prs?${prsQuery}&merged=true`}
          accent="merged"
        />
        <HeadlineCard
          label="Open"
          value={summary.open}
          href={`/prs?${prsQuery}&state=open`}
          accent="open"
        />
        <HeadlineCard
          label="Closed, not merged"
          value={summary.closed_unmerged}
          href={`/prs?${prsQuery}&state=closed&merged=false`}
          accent="closed-unmerged"
        />
        <HeadlineCard
          label="Needs a rebase"
          value={summary.open_conflict}
          href={`/prs?${prsQuery}&conflict=true`}
          accent="conflict"
        />
        <HeadlineCard label="People" value={summary.people} href={`${basePath}?${query}`} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fg">People</h2>
        <PersonTable people={people} periodQuery={prsQuery} />
      </section>

      <MergedThisWeek
        rows={mergedThisWeek}
        rangeLabel={weekRangeLabel(rankingWeek)}
        teamName={teamName}
        team={slug}
        lastWeek={lastWeek}
      />

      <NeedsAttentionSection conflicts={conflicts} />
    </main>
  );
}
