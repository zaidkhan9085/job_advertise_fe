import type { Metadata } from "next";
import type { JobPost } from "@/lib/api";
import { jobPagePath } from "@/lib/jobShare";
import { buildJobPostingJsonLd } from "@/lib/jobPostingSchema";
import { fetchJobForSeo } from "@/lib/server/fetchJobForSeo";

// The job page itself is a client component (it can't export
// generateMetadata), and link-preview crawlers (WhatsApp, Facebook,
// Telegram, ...) never run JavaScript -- so without this server-side layout
// every shared job link looked identical and had no thumbnail. This
// produces the per-job Open Graph / Twitter tags in the initial HTML, and
// (below) the Schema.org JobPosting JSON-LD Google's Jobs rich result needs.

// NEXT_PUBLIC_API_URL can legitimately be empty/relative in production
// (requests then go through the /api rewrite in vercel.json), which a
// server-side fetch can't use -- fall back to the real API host.
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_API_URL
  : "https://api.thejobs4u.com";

const SITE_NAME = "thejobs4u";

const PREVIEW_W = 1200;
const PREVIEW_H = 630;

// Preview crawlers need an absolute, publicly reachable URL, and
// WhatsApp/Facebook drop preview images over roughly 300 KB (a dense poster
// measured 328 KB as a plain 1200px JPEG). Link cards are also landscape
// (1.91:1) while posters are usually portrait/square, so a plain resize
// either crops away part of the poster or leaves blank bars. Cloudinary
// (where uploads live) builds the card from the URL alone: an exact
// 1200x630 canvas filled with a blurred, enlarged copy of the poster, with
// the WHOLE sharp poster centered on top (~70-80 KB). The exact size is
// declared (og:image:width / height) so the app can lay the card out before
// downloading the image. Anything not on Cloudinary (legacy local uploads,
// the logo fallback) is passed through untouched with no size hint, since
// its size isn't known.
const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)((?:v\d+\/)?)([A-Za-z0-9_\-/]+)(\.[A-Za-z0-9]+)?$/;

function previewImage(raw: string): { url: string; width?: number; height?: number } {
  const absolute = /^https?:\/\//.test(raw) ? raw : `${API_BASE}${raw}`;
  const size = { width: PREVIEW_W, height: PREVIEW_H };

  const m = absolute.match(CLOUDINARY_UPLOAD);
  if (m) {
    const [, base, version, publicId, ext = ""] = m;
    // In a layer reference the folder separators become ":".
    const layerId = publicId.replace(/\//g, ":");
    return {
      url:
        `${base}c_fill,w_${PREVIEW_W},h_${PREVIEW_H},e_blur:1500,q_auto:eco/` +
        `l_${layerId},c_fit,w_${PREVIEW_W},h_${PREVIEW_H}/fl_layer_apply,g_center/f_jpg/` +
        `${version}${publicId}${ext}`,
      ...size,
    };
  }

  // Cloudinary URL of an unexpected shape: plain padded canvas, no layers.
  if (absolute.includes("/image/upload/")) {
    return {
      url: absolute.replace(
        "/image/upload/",
        `/image/upload/f_jpg,q_auto:eco,c_pad,w_${PREVIEW_W},h_${PREVIEW_H},b_rgb:f5efe9/`
      ),
      ...size,
    };
  }
  return { url: absolute };
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
  const result = await fetchJobForSeo(id);

  // Expired jobs fall into this branch too (fetchJobForSeo only ever
  // returns "active" with a full JobPost) -- correct: a 410'd job has
  // already had its heavy fields cleared server-side, so there's nothing
  // left worth putting in a share preview, and noindex is exactly right
  // for something search engines should be dropping from their index.
  if (result.status !== "active") {
    return { title: "Job not found", robots: { index: false } };
  }
  const job = result.job;

  const description = buildDescription(job);
  // A text-only listing has no poster -- fall back to the site logo so the
  // preview still carries a thumbnail instead of nothing.
  const image = job.image ? previewImage(job.image) : { url: "/logo-icon.png" };
  // The slug-prefixed path (see jobPagePath) -- the canonical/OG URL should
  // point at the same pretty URL the page itself links to everywhere else,
  // not the bare id this route still also accepts for old shared links.
  const path = jobPagePath(job);

  return {
    title: job.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
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

export default async function JobDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Same fetchJobForSeo call generateMetadata above already makes -- Next's
  // request memoization collapses identical fetch()es within one request
  // into a single real network call, so this isn't a second round trip.
  const result = await fetchJobForSeo(id);

  return (
    <>
      {result.status === "active" && (
        // JSON.stringify of our own server-built object, not user-supplied
        // HTML -- safe to inject directly.
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJobPostingJsonLd(result.job)) }}
        />
      )}
      {children}
    </>
  );
}
