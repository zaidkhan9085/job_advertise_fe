import type { MetadataRoute } from "next";
import type { JobPost } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import { jobPagePath, companyPagePath } from "@/lib/jobShare";

// NEXT_PUBLIC_API_URL can legitimately be empty/relative in production
// (requests then go through the /api rewrite in vercel.json), which a
// server-side fetch can't use -- fall back to the real API host. Same
// fallback as fetchJobForSeo.ts.
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_API_URL
  : "https://api.thejobs4u.com";

type SitemapCompany = { id: string; slug: string | null; name: string; createdAt: string };

// Current job/company volume is tens, not thousands -- one flat sitemap is
// fine. Next supports a paginated generateSitemaps() export if that ever
// changes, not needed now.
const STATIC_PATHS = [
  "",
  "/jobs",
  "/post-job",
  "/pricing",
  "/about",
  "/contact",
  "/solutions",
  "/blog",
  "/case-studies",
  "/group",
  "/resume",
  "/resume-builder",
  "/salary-guide",
  "/privacy",
  "/terms",
  "/refund",
  "/disclaimer",
  "/legal-notice",
];

async function fetchJobs(): Promise<JobPost[]> {
  try {
    const res = await fetch(`${API_BASE}/api/jobs`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    return (await res.json()) as JobPost[];
  } catch {
    return [];
  }
}

async function fetchCompanies(): Promise<SitemapCompany[]> {
  try {
    const res = await fetch(`${API_BASE}/api/companies/sitemap`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    return (await res.json()) as SitemapCompany[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, companies] = await Promise.all([fetchJobs(), fetchCompanies()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${SITE_URL}${jobPagePath(job)}`,
    lastModified: new Date(job.updatedAt),
  }));

  // No updatedAt column on Company -- createdAt is the honest choice here
  // rather than fabricating one.
  const companyEntries: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${SITE_URL}${companyPagePath(company)}`,
    lastModified: new Date(company.createdAt),
  }));

  return [...staticEntries, ...jobEntries, ...companyEntries];
}
