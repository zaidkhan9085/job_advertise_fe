import { notFound } from "next/navigation";
import { fetchJobForSeo } from "@/lib/server/fetchJobForSeo";
import JobDetailClient from "./JobDetailClient";

// Server Component -- fetches the job server-side (same fetchJobForSeo call
// jobs/[id]/layout.tsx already makes for metadata/JSON-LD; Next's request
// memoization collapses the two into one real network call) so the title/
// description/etc. are in the raw HTML response, not only present after
// client-side JS runs. All the actual interactive UI (Apply dialog, Follow/
// Rate/Block, Share, Report, Related Jobs...) stays in JobDetailClient,
// unchanged in behavior, just fed via props now instead of its own fetch.
export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchJobForSeo(id);

  // Genuinely missing (bad id, never existed, rejected, still pending) --
  // a real 404 now, not the old client-rendered 200 "not found" text
  // (a soft-404 search engines specifically flag).
  if (result.status === "missing") {
    notFound();
  }

  if (result.status === "expired") {
    return <JobDetailClient initialJob={null} initialExpiredJob={result.job} />;
  }

  return <JobDetailClient initialJob={result.job} initialExpiredJob={null} />;
}
