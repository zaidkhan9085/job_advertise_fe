import type { JobPost, ExpiredJobInfo } from "@/lib/api";

// Server-only (no "use client") -- used from jobs/[id]/layout.tsx
// (generateMetadata + the JobPosting JSON-LD script) and jobs/[id]/page.tsx
// (the actual server-rendered content). All three call sites use the exact
// same fetch() URL/options, so Next's request memoization collapses them
// into one real network call per page request, not three.

// NEXT_PUBLIC_API_URL can legitimately be empty/relative in production
// (requests then go through the /api rewrite in vercel.json), which a
// server-side fetch can't use -- fall back to the real API host.
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_API_URL
  : "https://api.thejobs4u.com";

export type JobFetchResult =
  | { status: "active"; job: JobPost }
  | { status: "expired"; job: ExpiredJobInfo }
  | { status: "missing" };

export async function fetchJobForSeo(id: string): Promise<JobFetchResult> {
  try {
    // A slow API must never hold a page load hostage -- give up after 3s
    // and let the caller fall back to a generic/missing state.
    const res = await fetch(`${API_BASE}/api/jobs/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    });

    if (res.status === 410) {
      const body = (await res.json().catch(() => null)) as { job?: ExpiredJobInfo } | null;
      return body?.job ? { status: "expired", job: body.job } : { status: "missing" };
    }

    if (!res.ok) return { status: "missing" };

    const job = (await res.json()) as JobPost;
    return { status: "active", job };
  } catch {
    return { status: "missing" };
  }
}
