const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
} as const;

// One outline icon per team ("all" = everyone together).
export function TeamIcon({ slug, className = 'h-6 w-6' }: { slug: string; className?: string }) {
  switch (slug) {
    case 'frontend':
      return (
        <svg {...iconProps} className={className}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M7 6.5h.01M10 6.5h.01" strokeLinecap="round" />
        </svg>
      );
    case 'backend':
      return (
        <svg {...iconProps} className={className}>
          <rect x="4" y="4" width="16" height="6" rx="1.5" />
          <rect x="4" y="14" width="16" height="6" rx="1.5" />
          <path d="M8 7h.01M8 17h.01" strokeLinecap="round" />
        </svg>
      );
    case 'mobile':
      return (
        <svg {...iconProps} className={className}>
          <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
          <path d="M11 18.5h2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps} className={className}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      );
  }
}
