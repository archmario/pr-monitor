'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import type { SyncRun } from '@/lib/types';

// How often to re-check /sync/last: quickly while a sync is running, slowly
// otherwise (so a scheduled sync started by Celery beat still shows up).
const POLL_WHILE_SYNCING_MS = 5_000;
const POLL_IDLE_MS = 60_000;

// The backend sends UTC timestamps without a "Z" on the end, and JavaScript
// would read those as local time. Adding the "Z" makes them UTC again.
function parseUtc(value: string): Date {
  return new Date(/(Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value}Z`);
}

function timeAgo(from: Date, now: number): string {
  const minutes = Math.floor((now - from.getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

async function fetchLastSync(): Promise<SyncRun | null> {
  const response = await fetch(`${API_BASE_URL}/sync/last`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`sync/last failed with ${response.status}`);
  return response.json();
}

export function SyncStatus({ initialRun }: { initialRun: SyncRun | null }) {
  const router = useRouter();
  const [run, setRun] = useState(initialRun);
  // Set after clicking "Sync now": we're waiting for a run newer than this id to finish.
  const [waitingAfterId, setWaitingAfterId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const syncing = waitingAfterId !== null || run?.status === 'running';

  // Keeps "X min ago" current without a page reload.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Polls the latest sync. When a sync we were waiting on (or one that was
  // already running) finishes, re-render the page so it shows the new data.
  useEffect(() => {
    const timer = setInterval(
      async () => {
        try {
          const latest = await fetchLastSync();
          setNow(Date.now());

          const finished = latest !== null && latest.status !== 'running';
          const ourRunFinished = waitingAfterId !== null && finished && latest.id > waitingAfterId;
          const backgroundRunFinished = waitingAfterId === null && run?.status === 'running' && finished;

          setRun(latest);
          if (ourRunFinished || backgroundRunFinished) {
            setWaitingAfterId(null);
            router.refresh();
          }
        } catch {
          // The backend being briefly unreachable shouldn't break the header; try again next tick.
        }
      },
      syncing ? POLL_WHILE_SYNCING_MS : POLL_IDLE_MS,
    );
    return () => clearInterval(timer);
  }, [syncing, waitingAfterId, run?.status, router]);

  async function startSync() {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/sync/run`, { method: 'POST' });
      if (!response.ok) throw new Error(`failed with ${response.status}`);
      const body: { queued: boolean; already_running: boolean; run_id?: number } = await response.json();

      // Either our new run, or the one already in progress (id run_id), is what we wait for.
      setWaitingAfterId(body.already_running && body.run_id ? body.run_id - 1 : (run?.id ?? 0));
    } catch {
      setError('Could not start a sync. Is the backend running?');
    }
  }

  let note: string;
  if (syncing) {
    note =
      run?.status === 'running'
        ? `Syncing with GitHub… started ${timeAgo(parseUtc(run.started_at), now)}`
        : 'Syncing with GitHub…';
  } else if (run === null) {
    note = 'Never synced';
  } else if (run.status === 'failed') {
    note = `Last sync failed ${timeAgo(parseUtc(run.finished_at ?? run.started_at), now)}`;
  } else {
    note = `Last synced ${timeAgo(parseUtc(run.finished_at ?? run.started_at), now)}`;
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-xs ${error || (!syncing && run?.status === 'failed') ? 'text-conflict' : 'text-fg-muted'}`}
        title={!syncing && run?.status === 'failed' ? (run.error_message ?? undefined) : undefined}
        suppressHydrationWarning
      >
        {error ?? note}
      </span>
      <button
        type="button"
        onClick={startSync}
        disabled={syncing}
        className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface-raised px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-edge-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {syncing ? 'Syncing…' : 'Sync now'}
      </button>
    </div>
  );
}
