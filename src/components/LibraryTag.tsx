// Marks work on shared libraries (msflib...) as opposed to product repos.
// Neutral pill with a small KodeHauz-lime book icon: noticeable, never loud.
export function LibraryTag({ count, title }: { count?: number; title?: string }) {
  const label = count === undefined ? 'Library' : `${count} library`;
  return (
    <span
      title={title ?? 'Shared library code (msflib), counted for this team'}
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-edge bg-surface-overlay px-2 py-0.5 text-[11px] font-medium leading-4 text-fg-muted"
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3 text-[#9AA321] dark:text-brand-lime" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
        <path d="M2.5 3.5c1.8-.6 3.6-.4 5.5.8v8.5c-1.9-1.2-3.7-1.4-5.5-.8v-8.5ZM13.5 3.5c-1.8-.6-3.6-.4-5.5.8v8.5c1.9-1.2 3.7-1.4 5.5-.8v-8.5Z" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  );
}
