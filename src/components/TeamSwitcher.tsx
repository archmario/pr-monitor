import Link from 'next/link';
import type { Team } from '@/lib/types';
import { TeamIcon } from '@/components/TeamIcon';

// Row of teams at the top of every dashboard. Switching keeps the current
// period/day, so "This week" on Frontend -> "This week" on Backend.
export function TeamSwitcher({
  teams,
  current,
  periodQuery,
}: {
  teams: Team[];
  current: string;
  periodQuery: string;
}) {
  const options = [
    ...teams.map((t) => ({ slug: t.slug, name: t.name, ready: t.set_up })),
    { slug: 'all', name: 'All teams', ready: teams.some((t) => t.set_up) },
  ];

  return (
    <nav aria-label="Teams" className="-mx-1 overflow-x-auto px-1">
      <div className="inline-flex gap-1 rounded-lg border border-edge bg-surface-raised p-1">
        {options.map((option) => {
          const active = option.slug === current;
          const base = 'flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors';

          if (!option.ready) {
            return (
              <span
                key={option.slug}
                title={`${option.name}: coming soon`}
                className={`${base} cursor-default ${active ? 'bg-surface-overlay text-fg' : 'text-fg-subtle'}`}
              >
                <TeamIcon slug={option.slug} className="h-4 w-4" />
                {option.name}
                <span className="text-[10px] font-normal uppercase tracking-wide">soon</span>
              </span>
            );
          }

          return (
            <Link
              key={option.slug}
              href={`/${option.slug}?${periodQuery}`}
              aria-current={active ? 'page' : undefined}
              className={`${base} ${active ? 'bg-brand-blue text-white' : 'text-fg-muted hover:text-fg'}`}
            >
              <TeamIcon slug={option.slug} className="h-4 w-4" />
              {option.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
