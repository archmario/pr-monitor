import Link from 'next/link';
import type { WeekDay } from '@/lib/week';

// Mon-Sun row shown under "This week" and "Last week". Clicking a day filters
// the dashboard to that day; clicking the selected day again goes back to the whole week.
export function WeekDayStrip({
  days,
  counts,
  selectedDay,
  weekNumber,
  rangeLabel,
  basePath,
  period,
}: {
  days: WeekDay[];
  counts: Record<string, number>;
  selectedDay: string | null;
  weekNumber: number;
  rangeLabel: string;
  basePath: string;
  period: 'week' | 'lastweek';
}) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm text-fg-muted">
        <span className="font-medium text-fg">Week {weekNumber}</span> &middot; {rangeLabel}
      </p>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const selected = day.iso === selectedDay;
          const body = (
            <>
              <span className="text-xs font-medium">
                {day.weekday} {day.dayOfMonth}
              </span>
              <span className="text-lg font-semibold">{day.isFuture ? '–' : (counts[day.iso] ?? 0)}</span>
              <span className="text-[11px] opacity-80">{day.isToday ? 'today' : day.isFuture ? '' : 'PRs'}</span>
            </>
          );

          const base = 'flex flex-col items-center gap-0.5 rounded-lg border px-1 py-2 text-center transition-colors';

          if (day.isFuture) {
            return (
              <div key={day.iso} className={`${base} cursor-default border-edge text-fg-subtle opacity-50`}>
                {body}
              </div>
            );
          }

          return (
            <Link
              key={day.iso}
              href={selected ? `${basePath}?period=${period}` : `${basePath}?period=${period}&day=${day.iso}`}
              className={`${base} ${
                selected
                  ? 'border-accent bg-accent text-white'
                  : `bg-surface-raised text-fg hover:border-edge-strong ${day.isToday ? 'border-accent/50' : 'border-edge'}`
              }`}
            >
              {body}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
