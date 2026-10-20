import Link from 'next/link';
import { getPerson } from '@/lib/api';
import { StatusBadge, statusVariantFor } from '@/components/StatusBadge';

export default async function PersonPage({
  params,
}: {
  params: Promise<{ person: string }>;
}) {
  const { person: githubLogin } = await params;
  const person = await getPerson(githubLogin);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {person.display_name ?? person.github_login}
        </h1>
        <Link href="/" className="text-sm text-accent hover:text-accent-hover">
          &larr; Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {person.pull_requests.map((pr) => (
          <a
            key={`${pr.repo}#${pr.number}`}
            href={pr.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col gap-2 rounded-lg border border-edge bg-surface-raised p-4 transition-colors hover:border-edge-strong sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm font-medium text-fg">{pr.title}</span>
              <span className="text-xs text-fg-subtle">
                {pr.repo} #{pr.number}
              </span>
            </div>
            <StatusBadge variant={statusVariantFor(pr)} />
          </a>
        ))}
        {person.pull_requests.length === 0 && (
          <p className="rounded-lg border border-edge bg-surface-raised px-4 py-6 text-center text-sm text-fg-muted">
            No PRs found for this person yet.
          </p>
        )}
      </div>
    </main>
  );
}
