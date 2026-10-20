import { getConflicts, getPeople, getSummary } from '@/lib/api';
import type { Period } from '@/lib/types';
import { PeriodToggle } from '@/components/PeriodToggle';
import { HeadlineCard } from '@/components/HeadlineCard';
import { NeedsAttentionSection } from '@/components/NeedsAttentionSection';
import { PersonTable } from '@/components/PersonTable';

const PERIODS: Period[] = ['all', 'today', 'week', 'd30', 'd90'];

function isPeriod(value: string | undefined): value is Period {
  return PERIODS.includes(value as Period);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period: Period = isPeriod(periodParam) ? periodParam : 'all';

  const [summary, people, conflicts] = await Promise.all([
    getSummary(period),
    getPeople(period),
    getConflicts(),
  ]);

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
        <PeriodToggle current={period} basePath="/" />
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <HeadlineCard label="Total PRs" value={summary.total} href={`/prs?period=${period}`} />
        <HeadlineCard
          label="Merged"
          value={summary.merged}
          href={`/prs?period=${period}&merged=true`}
          accent="merged"
        />
        <HeadlineCard
          label="Open"
          value={summary.open}
          href={`/prs?period=${period}&state=open`}
          accent="open"
        />
        <HeadlineCard
          label="Closed, not merged"
          value={summary.closed_unmerged}
          href={`/prs?period=${period}&state=closed&merged=false`}
          accent="closed-unmerged"
        />
        <HeadlineCard
          label="Needs a rebase"
          value={summary.open_conflict}
          href={`/prs?period=${period}&conflict=true`}
          accent="conflict"
        />
        <HeadlineCard label="People" value={summary.people} href="/" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fg">Frontend Team</h2>
        <PersonTable people={people} />
      </section>

      <NeedsAttentionSection conflicts={conflicts} />
    </main>
  );
}
