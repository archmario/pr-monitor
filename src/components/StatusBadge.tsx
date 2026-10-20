type Variant = 'merged' | 'open' | 'closed-unmerged' | 'conflict';

const VARIANT_META: Record<Variant, { label: string; dot: string; text: string; bg: string }> = {
  merged: { label: 'Merged', dot: 'bg-merged', text: 'text-merged', bg: 'bg-merged/10' },
  open: { label: 'Open', dot: 'bg-open', text: 'text-open', bg: 'bg-open/10' },
  'closed-unmerged': {
    label: 'Closed, not merged',
    dot: 'bg-closed-unmerged',
    text: 'text-closed-unmerged',
    bg: 'bg-closed-unmerged/10',
  },
  conflict: { label: 'Needs a rebase', dot: 'bg-conflict', text: 'text-conflict', bg: 'bg-conflict/10' },
};

export function StatusBadge({ variant }: { variant: Variant }) {
  const meta = VARIANT_META[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.bg} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function statusVariantFor(pr: { state: string; merged: boolean; has_conflict: boolean }): Variant {
  if (pr.merged) return 'merged';
  if (pr.state === 'open') return pr.has_conflict ? 'conflict' : 'open';
  return 'closed-unmerged';
}
