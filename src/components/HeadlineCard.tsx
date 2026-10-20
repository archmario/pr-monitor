import Link from 'next/link';

const ACCENT_BORDER: Record<'conflict' | 'merged' | 'open' | 'closed-unmerged', string> = {
  conflict: 'border-conflict/30',
  merged: 'border-merged/30',
  open: 'border-open/30',
  'closed-unmerged': 'border-closed-unmerged/30',
};

export function HeadlineCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: 'conflict' | 'merged' | 'open' | 'closed-unmerged';
}) {
  const accentClass = accent ? ACCENT_BORDER[accent] : 'border-edge';

  return (
    <Link
      href={href}
      className={`group flex flex-col gap-1 rounded-xl border bg-surface-raised p-4 transition-colors hover:border-edge-strong ${accentClass}`}
    >
      <span className="text-sm text-fg-muted">{label}</span>
      <span className="text-3xl font-semibold tracking-tight text-fg">{value}</span>
      <span className="text-xs text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100">
        View all &rarr;
      </span>
    </Link>
  );
}
