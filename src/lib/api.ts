import type {
  ConflictEntry,
  MergedCount,
  PeriodTotals,
  PersonDetail,
  PersonSummary,
  PullRequestItem,
  SyncRun,
  Team,
} from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';

async function getJson<T>(path: string): Promise<T> {
  // Always fresh: the whole point of this app is that it never shows stale
  // PR state, so no Next.js data cache for these requests.
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }
  return response.json();
}

// `team` is a team slug ("frontend", "backend", "mobile") or "all".
function periodQuery(team: string, period: string, day?: string | null): string {
  return day ? `team=${team}&period=${period}&day=${day}` : `team=${team}&period=${period}`;
}

export function getTeams(): Promise<Team[]> {
  return getJson(`/teams`);
}

export function getSummary(team: string, period: string, day?: string | null): Promise<PeriodTotals> {
  return getJson(`/summary?${periodQuery(team, period, day)}`);
}

export function getPeople(team: string, period: string, day?: string | null): Promise<PersonSummary[]> {
  return getJson(`/people?${periodQuery(team, period, day)}`);
}

export function getPerson(githubLogin: string): Promise<PersonDetail> {
  return getJson(`/people/${encodeURIComponent(githubLogin)}`);
}

export function getConflicts(team: string): Promise<ConflictEntry[]> {
  return getJson(`/conflicts?team=${team}`);
}

// Team members ranked by PRs merged this week (by merge date, from Monday).
export function getMergedThisWeek(team: string): Promise<MergedCount[]> {
  return getJson(`/merged?team=${team}&period=week`);
}

export interface PrFilters {
  team?: string;
  period?: string;
  state?: 'open' | 'closed';
  merged?: boolean;
  conflict?: boolean;
  person?: string;
  repo?: string;
  day?: string;
}

export function getPrs(filters: PrFilters): Promise<PullRequestItem[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  return getJson(`/prs?${params.toString()}`);
}

// `null` until the very first sync has run.
export function getLastSync(): Promise<SyncRun | null> {
  return getJson(`/sync/last`);
}
