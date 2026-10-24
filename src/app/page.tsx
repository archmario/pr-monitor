import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getConflicts, getSummary, getTeams } from '@/lib/api';
import type { Team } from '@/lib/types';
import { LibraryTag } from '@/components/LibraryTag';
import { TeamIcon } from '@/components/TeamIcon';

const BLURBS: Record<string, string> = {
  frontend: 'Web apps, dashboards and the sites people see.',
  backend: 'APIs, services and the libraries behind them.',
  mobile: 'The iOS and Android apps in people’s pockets.',
};

type WeekStats = { opened: number; merged: number; stuck: number } | null;

async function thisWeek(team: string): Promise<WeekStats> {
  // A card should still render if the API is briefly unreachable.
  try {
    const [summary, conflicts] = await Promise.all([getSummary(team, 'week'), getConflicts(team)]);
    return { opened: summary.total, merged: summary.merged, stuck: conflicts.length };
  } catch {
    return null;
  }
}

function ComingSoon() {
  return (
    <span className="shrink-0 self-start whitespace-nowrap rounded-full border border-edge px-2.5 py-0.5 text-xs font-medium text-fg-subtle sm:self-center">
      Coming soon
    </span>
  );
}

function Stats({ stats }: { stats: WeekStats }) {
  if (!stats) return null;
  return (
    <p className="text-sm text-fg-muted">
      <span className="font-semibold text-fg">{stats.opened}</span> opened this week &middot;{' '}
      <span className="font-semibold text-fg">{stats.merged}</span> merged
      {stats.stuck > 0 && (
        <>
          {' '}
          &middot; <span className="font-semibold text-conflict">{stats.stuck}</span> need a rebase
        </>
      )}
    </p>
  );
}

const LIVE_CARD =
  'group border-edge bg-surface-raised/80 transition duration-200 ease-out hover:border-brand-blue/60 hover:shadow-lg hover:shadow-brand-blue/5 motion-safe:hover:-translate-y-0.5';
const SOON_CARD = 'border-dashed border-edge bg-surface-raised/50';

function TeamCard({ team, stats }: { team: Team; stats: WeekStats }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${
            team.set_up ? 'bg-brand-blue/10 text-brand-blue dark:text-[#6E93E6]' : 'bg-surface-overlay text-fg-subtle'
          }`}
        >
          <TeamIcon slug={team.slug} />
        </span>
        {team.set_up ? (
          <span className="text-xs text-fg-subtle">{team.members.length} people</span>
        ) : (
          <ComingSoon />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-fg">{team.name}</h3>
        <p className="text-sm text-fg-muted">{BLURBS[team.slug] ?? ''}</p>
        {team.libraries.length > 0 && (
          <div className="mt-1">
            <LibraryTag title={`Includes ${team.libraries.join(', ')}`} />
          </div>
        )}
      </div>
      {team.set_up && (
        <div className="mt-auto flex flex-col gap-3 border-t border-edge pt-4">
          <Stats stats={stats} />
          <span className="text-sm font-medium text-brand-blue group-hover:underline dark:text-[#6E93E6]">
            Open dashboard &rarr;
          </span>
        </div>
      )}
    </>
  );

  const base = 'flex min-h-[240px] flex-col gap-4 rounded-xl border p-6 backdrop-blur-sm';
  return team.set_up ? (
    <Link href={`/${team.slug}`} className={`${base} ${LIVE_CARD}`}>
      {body}
    </Link>
  ) : (
    <div aria-disabled className={`${base} ${SOON_CARD}`}>
      {body}
    </div>
  );
}

export default async function TeamPicker({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // Old dashboard links (/?period=week...) were the frontend dashboard.
  const params = await searchParams;
  if (params.period || params.day) {
    const query = new URLSearchParams(
      Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
    redirect(`/frontend?${query.toString()}`);
  }

  const teams = await getTeams();
  const live = teams.filter((t) => t.set_up);
  const [teamStats, allStats] = await Promise.all([
    Promise.all(teams.map((t) => (t.set_up ? thisWeek(t.slug) : Promise.resolve(null)))),
    live.length > 0 ? thisWeek('all') : Promise.resolve(null),
  ]);

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      {/* The KodeHauz logo as a faded watermark: a radial mask fades its edges into the page. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative background, no layout or optimisation needed */}
        <img
          src="/kodehauz-logo.webp"
          alt=""
          className="w-[min(1100px,150vw)] max-w-none opacity-[0.09] dark:opacity-[0.07]"
          style={{
            maskImage: 'radial-gradient(closest-side, #000 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(closest-side, #000 30%, transparent 100%)',
          }}
        />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16 sm:py-24">
        <header className="flex flex-col gap-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" aria-hidden />
            KodeHauz &middot; PR Monitor
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            Welcome to the <span className="text-brand-blue dark:text-[#6E93E6]">Hauz</span>.
          </h1>
          <p className="max-w-2xl text-base text-fg-muted sm:text-lg">
            Every pull request across KodeHauz, in one place. Pick a team to see who&rsquo;s shipping,
            what&rsquo;s waiting on review and what&rsquo;s stuck on a conflict.
          </p>
        </header>

        <section className="flex flex-col gap-4" aria-labelledby="choose-team">
          <h2 id="choose-team" className="text-sm font-medium text-fg-muted">
            Choose your team
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {teams.map((team, i) => (
              <TeamCard key={team.slug} team={team} stats={teamStats[i]} />
            ))}
          </div>

          {/* All teams together: wide, under the three teams. */}
          {(() => {
            const body = (
              <>
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                      live.length ? 'bg-brand-blue/10 text-brand-blue dark:text-[#6E93E6]' : 'bg-surface-overlay text-fg-subtle'
                    }`}
                  >
                    <TeamIcon slug="all" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-fg">All teams</h3>
                    <p className="text-sm text-fg-muted">
                      {live.map((t) => t.name).join(', ') || 'Every team'} together, one leaderboard for the whole Hauz.
                    </p>
                    {live.length > 0 && <Stats stats={allStats} />}
                  </div>
                </div>
                {live.length > 0 ? (
                  <span className="shrink-0 text-sm font-medium text-brand-blue group-hover:underline dark:text-[#6E93E6]">
                    Open dashboard &rarr;
                  </span>
                ) : (
                  <ComingSoon />
                )}
              </>
            );
            const base =
              'flex flex-col gap-4 rounded-xl border p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between';
            return live.length > 0 ? (
              <Link href="/all" className={`${base} ${LIVE_CARD}`}>
                {body}
              </Link>
            ) : (
              <div aria-disabled className={`${base} ${SOON_CARD}`}>
                {body}
              </div>
            );
          })()}
        </section>
      </div>
    </main>
  );
}
