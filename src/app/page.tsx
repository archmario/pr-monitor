import { getConflicts, getLastSync, getMergedThisWeek, getPeople, getSummary } from '@/lib/api';
import type { Period } from '@/lib/types';
import { daysOfThisWeek, isoWeekNumber, isSelectableDay, weekRangeLabel } from '@/lib/week';
import { PeriodToggle } from '@/components/PeriodToggle';
import { HeadlineCard } from '@/components/HeadlineCard';
import { MergedThisWeek } from '@/components/MergedThisWeek';
import { NeedsAttentionSection } from '@/components/NeedsAttentionSection';
import { PersonTable } from '@/components/PersonTable';
import { SyncStatus } from '@/components/SyncStatus';
import { WeekDayStrip } from '@/components/WeekDayStrip';

const PERIODS: Period[] = ['all', 'today', 'week', 'd30', 'd90'];

function isPeriod(value: string | undefined): value is Period {
  return PERIODS.includes(value as Period);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; day?: string }>;
}) {
  const { period: periodParam, day: dayParam } = await searchParams;
  const period: Period = isPeriod(periodParam) ? periodParam : 'all';

  // A single day can only be picked from inside "This week".
  const isWeek = period === 'week';
  const day = isWeek && isSelectableDay(dayParam) ? dayParam : null;
  const weekDays = isWeek ? daysOfThisWeek() : [];

  const [summary, people, conflicts, lastSync, mergedThisWeek, dayCounts] = await Promise.all([
    getSummary(period, day),
    getPeople(period, day),
    getConflicts(),
    getLastSync(),
    getMergedThisWeek(),
    // One small summary call per day so far this week, for the counts in the strip.
    Promise.all(
      weekDays
        .filter((d) => !d.isFuture)
        .map(async (d) => [d.iso, (await getSummary('week', d.iso)).total] as const),
    ),
  ]);

  // Carried into every card link so the drill-down shows the same slice.
  const query = day ? `period=${period}&day=${day}` : `period=${period}`;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">PR Monitor</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {summary.people} people have opened {summary.total} PRs
            {summary.open_conflict > 0
              ? `, and ${summary.open_conflict} need a rebase right now.`
              : ' - nothing is currently stuck on a conflict.'}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <PeriodToggle current={period} basePath="/" />
          <SyncStatus initialRun={lastSync} />
        </div>
      </header>

      {isWeek && (
        <WeekDayStrip
          days={weekDays}
          counts={Object.fromEntries(dayCounts)}
          selectedDay={day}
          weekNumber={isoWeekNumber()}
          rangeLabel={weekRangeLabel()}
        />
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <HeadlineCard label="Total PRs" value={summary.total} href={`/prs?${query}`} />
        <HeadlineCard
          label="Merged"
          value={summary.merged}
          href={`/prs?${query}&merged=true`}
          accent="merged"
        />
        <HeadlineCard
          label="Open"
          value={summary.open}
          href={`/prs?${query}&state=open`}
          accent="open"
        />
        <HeadlineCard
          label="Closed, not merged"
          value={summary.closed_unmerged}
          href={`/prs?${query}&state=closed&merged=false`}
          accent="closed-unmerged"
        />
        <HeadlineCard
          label="Needs a rebase"
          value={summary.open_conflict}
          href={`/prs?${query}&conflict=true`}
          accent="conflict"
        />
        <HeadlineCard label="People" value={summary.people} href="/" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fg">Frontend Team</h2>
        <PersonTable people={people} />
      </section>

      <MergedThisWeek rows={mergedThisWeek} rangeLabel={weekRangeLabel()} />

      <NeedsAttentionSection conflicts={conflicts} />
    </main>
  );
}
