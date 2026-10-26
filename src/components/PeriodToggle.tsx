import Link from 'next/link';
import type { Period } from '@/lib/types';
import { todayWeekdayShort } from '@/lib/week';

export function PeriodToggle({ current, basePath }: { current: Period; basePath: string }) {
  const weekday = todayWeekdayShort();

  const options: { value: Period; label: string }[] = [
    { value: 'all', label: 'All-time' },
    { value: 'today', label: `Today (${weekday})` },
    { value: 'week', label: 'This week' },
    { value: 'lastweek', label: 'Last week' },
    { value: 'd30', label: 'Last 30 days' },
    { value: 'd90', label: 'Last 90 days' },
  ];

  return (
    <div className="inline-flex rounded-lg border border-edge bg-surface-raised p-1">
      {options.map((option) => {
        const active = option.value === current;
        return (
          <Link
            key={option.value}
            href={`${basePath}?period=${option.value}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? 'bg-accent text-white' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
