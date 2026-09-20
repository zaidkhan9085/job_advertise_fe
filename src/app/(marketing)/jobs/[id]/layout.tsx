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
    // Metadata is now resolved before the page is sent to EVERY visitor (see
    // htmlLimitedBots in next.config.ts), so a slow API must never hold a
    // page load hostage -- give up after 3s and fall back to generic tags.
    const res = await fetch(`${API_BASE}/api/jobs/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return (await res.json()) as JobPost;
  } catch {
    return null;
  }
}

const PREVIEW_W = 1200;
const PREVIEW_H = 630;

// Preview crawlers need an absolute, publicly reachable URL, and
// WhatsApp/Facebook drop preview images over roughly 300 KB (a dense poster
// measured 328 KB as a plain 1200px JPEG). Cloudinary (where uploads live)
// re-encodes via the URL, so this produces an exact 1200x630 canvas with the
// WHOLE poster padded onto it (~60-100 KB). Padding instead of cropping
// matters: link cards are landscape, and cropping a tall poster to fit showed
// a random middle slice. The exact size is also declared (og:image:width /
// height), which lets the app lay the card out before downloading the image.
// Anything not on Cloudinary (legacy local uploads, the logo fallback) is
// passed through untouched, with no size hint since we don't know it.
function previewImage(raw: string): { url: string; width?: number; height?: number } {
  const absolute = /^https?:\/\//.test(raw) ? raw : `${API_BASE}${raw}`;
  if (!absolute.includes("/image/upload/")) return { url: absolute };
  return {
    url: absolute.replace(
      "/image/upload/",
      `/image/upload/f_jpg,q_auto:eco,c_pad,w_${PREVIEW_W},h_${PREVIEW_H},b_rgb:f5efe9/`
    ),
    width: PREVIEW_W,
    height: PREVIEW_H,
  };
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
  const image = job.image ? previewImage(job.image) : { url: "/logo-icon.png" };

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
      images: [{ ...image, secureUrl: image.url, alt: `${job.title} — ${job.company}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: job.title,
      description,
      images: [image.url],
    },
  };
}

export default function JobDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
