import type { Metadata } from "next";
import type { JobPost } from "@/lib/api";

// The job page itself is a client component (it can't export
// generateMetadata), and link-preview crawlers (WhatsApp, Facebook,
// Telegram, ...) never run JavaScript -- so without this server-side layout
// every shared job link looked identical and had no thumbnail. This
// produces the per-job Open Graph / Twitter tags in the initial HTML.

// NEXT_PUBLIC_API_URL can legitimately be empty/relative in production
// (requests then go through the /api rewrite in vercel.json), which a
// server-side fetch can't use -- fall back to the real API host.
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_API_URL
  : "https://api.thejobs4u.com";

const SITE_NAME = "thejobs4u";

async function fetchJob(id: string): Promise<JobPost | null> {
  try {
    const res = await fetch(`${API_BASE}/api/jobs/${encodeURIComponent(id)}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as JobPost;
  } catch {
    return null;
  }
}

// Preview crawlers need an absolute, publicly reachable URL, and
// WhatsApp/Facebook silently drop preview images over roughly 300 KB -- an
// original poster can be a multi-MB PNG, and even a 1200px q_auto JPEG of a
// dense poster measured 328 KB. Cloudinary (where uploads live) resizes and
// re-encodes via the URL, so cap at 800px wide "eco" JPEG (~150-170 KB for
// the same posters); the thumbnail is shown small in chat anyway.
function previewImageUrl(raw: string): string {
  const absolute = /^https?:\/\//.test(raw) ? raw : `${API_BASE}${raw}`;
  return absolute.replace("/image/upload/", "/image/upload/f_jpg,q_auto:eco,c_limit,w_800/");
}

// Deliberately short and fixed-format rather than an excerpt of the job's
// own description: poster-scanned listings start with a raw position/salary
// dump, which reads as noise in a chat preview. The title and poster
// thumbnail already carry the specifics.
function buildDescription(job: JobPost): string {
  const where = job.location ? ` in ${job.location}` : "";
  const isSiteAccount = job.company.trim().toLowerCase() === SITE_NAME;
  const who = isSiteAccount ? `Job opening${where}.` : `${job.company} is hiring${where}.`;
  return `${who} View full details and apply now on thejobs4u.com.`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJob(id);

  if (!job) {
    return { title: "Job not found", robots: { index: false } };
  }

  const description = buildDescription(job);
  // A text-only listing has no poster -- fall back to the site logo so the
  // preview still carries a thumbnail instead of nothing.
  const image = job.image ? previewImageUrl(job.image) : "/logo-icon.png";

  return {
    title: job.title,
    description,
    alternates: { canonical: `/jobs/${id}` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: `/jobs/${id}`,
      title: job.title,
      description,
      images: [{ url: image, alt: `${job.title} — ${job.company}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: job.title,
      description,
      images: [image],
    },
  };
}

export default function JobDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
