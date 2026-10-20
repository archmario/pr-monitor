# PR Monitor Frontend

Next.js 15 (App Router) + Tailwind. Every page is a Server Component that
fetches straight from the backend on each request (`cache: 'no-store'`) -
there's no client-side data layer to keep in sync, because the whole point
is that this never shows stale PR state.

Design tokens, fonts (Inter + JetBrains Mono) and the collapsible-card /
pill-badge patterns are ported from `multi-agent-code-reviewer`'s design
system (see `src/app/globals.css`, `tailwind.config.ts`).

## Local setup

```bash
cp .env.local.example .env.local   # point at your local backend
pnpm install
pnpm dev
```

## Pages

- `/` - dashboard: headline stats, "needs attention" conflicts, by-person table
- `/prs?period=&state=&merged=&conflict=&person=&repo=` - drill-down behind every clickable stat
- `/people/[person]` - one person's PR history
