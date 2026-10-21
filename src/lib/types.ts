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

export interface SyncRun {
  id: number;
  status: 'running' | 'success' | 'failed';
  started_at: string; // UTC, no timezone suffix (e.g. "2026-10-20T11:40:20.921728")
  finished_at: string | null;
  prs_synced: number;
  error_message: string | null;
}

export interface MergedCount {
  github_login: string;
  display_name: string | null;
  merged: number;
}
