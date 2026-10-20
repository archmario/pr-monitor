export type Period = 'all' | 'today' | 'week' | 'd30' | 'd90';

export interface PeriodTotals {
  period: string;
  total: number;
  merged: number;
  open: number;
  closed_unmerged: number;
  open_conflict: number;
  people: number;
}

export interface PersonSummary {
  github_login: string;
  display_name: string | null;
  total: number;
  merged: number;
  open: number;
  closed_unmerged: number;
  open_conflict: number;
}

export interface ConflictEntry {
  repo: string;
  number: number;
  title: string;
  html_url: string;
  author: string | null;
  mergeable_state: string | null;
  base_branch: string | null;
  head_branch: string | null;
  gh_updated_at: string;
}

export interface PullRequestItem {
  repo: string;
  number: number;
  title: string;
  html_url: string;
  author: string | null;
  state: 'open' | 'closed';
  merged: boolean;
  has_conflict: boolean;
  mergeable_state: string | null;
  base_branch: string | null;
  head_branch: string | null;
  gh_created_at: string;
  gh_updated_at: string;
}

export interface PersonDetail {
  github_login: string;
  display_name: string | null;
  pull_requests: PullRequestItem[];
}
