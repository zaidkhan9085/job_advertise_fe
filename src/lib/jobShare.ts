import type { JobPost, Company } from "@/lib/api";
import { SITE_URL, SITE_REF } from "@/lib/site";
import { slugify } from "@/lib/utils";
import { buildWaMeUrl } from "@/lib/whatsapp";

type ShareJob = Pick<JobPost, "id" | "title" | "company" | "location" | "slug">;

const SITE_NAME = "thejobs4u";

// Pure slug now (e.g. /jobs/urgent-hiring-for-abu-dhabi), no id at all --
// better for SEO than a trailing uuid, matching the sister site's own URL
// scheme. job.slug is generated once server-side at creation time
// (backend/utils/slug.js), not re-derived from the title here, so it can't
// drift from whatever the backend actually stored (e.g. if two jobs share
// a title and the backend disambiguated with a -2 suffix). Falls back to
// the older slug-prefixed-id format only if slug is somehow missing (a job
// created in the brief window before the backfill script ran) -- the
// backend's findBySlugOrId() resolves that format too, so this is just a
// defensive fallback, not something that should normally trigger.
export function jobPagePath(job: Pick<JobPost, "id" | "title" | "slug">) {
  if (job.slug) return `/jobs/${job.slug}`;
  const slug = slugify(job.title);
  return slug ? `/jobs/${slug}-${job.id}` : `/jobs/${job.id}`;
}

export function jobPageUrl(job: Pick<JobPost, "id" | "title" | "slug">) {
  return `${SITE_URL}${jobPagePath(job)}`;
}

// Same pure-slug scheme as jobPagePath, for a company's public page.
export function companyPagePath(company: Pick<Company, "id" | "name" | "slug">) {
  if (company.slug) return `/companies/${company.slug}`;
  const slug = slugify(company.name);
  return slug ? `/companies/${slug}-${company.id}` : `/companies/${company.id}`;
}

export function companyPageUrl(company: Pick<Company, "id" | "name" | "slug">) {
  return `${SITE_URL}${companyPagePath(company)}`;
}

// Jobs posted by staff use the site's own name as the "company" -- printing
// "Company: thejobs4u" in a message that already says it came from
// thejobs4u is just noise.
function hasRealCompany(job: ShareJob) {
  return !!job.company && job.company.trim().toLowerCase() !== SITE_NAME;
}

function detailLines(job: ShareJob, boldTitle: boolean) {
  return [
    `Position: ${boldTitle ? `*${job.title}*` : job.title}`,
    hasRealCompany(job) ? `Company: ${job.company}` : null,
    job.location ? `Location: ${job.location}` : null,
    `Link: ${jobPageUrl(job)}`,
  ].filter((line): line is string => !!line);
}

// First line names where the enquiry came from ("Ref By www..."), so a
// recruiter juggling several sites knows which one it was. The job link
// makes WhatsApp render the same poster-thumbnail preview card as a shared
// link (see jobs/[id]/layout.tsx) -- wa.me can only pre-fill text, it can't
// attach an image.
export function buildJobWhatsAppMessage(job: ShareJob) {
  return [
    `Ref By ${SITE_REF}`,
    "Hello, I'm interested in this job and would like more information.",
    "",
    ...detailLines(job, true),
    "",
    "Thank you.",
  ].join("\n");
}

export function buildJobWhatsAppUrl(number: string, job: ShareJob) {
  return buildWaMeUrl(number, buildJobWhatsAppMessage(job));
}

// mailto can only pre-fill a subject and plain-text body -- no thumbnail.
export function buildJobMailtoUrl(email: string, job: ShareJob) {
  const subject = `Interested: ${job.title} — via ${SITE_NAME}`;
  const body = [
    `Ref By ${SITE_REF}`,
    "Hello,",
    "",
    "I'm interested in this job and would like more information.",
    "",
    ...detailLines(job, false),
    "",
    "Thank you.",
  ].join("\r\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Same "Ref By" convention as the job-specific messages above, but for a
// company's own general contact details on its public profile page (no
// specific job to reference).
export function buildCompanyWhatsAppUrl(number: string, companyName: string) {
  const text = [`Ref By ${SITE_REF}`, `Hello, I found ${companyName} on thejobs4u and would like to know more about your job openings.`].join(
    "\n"
  );
  return buildWaMeUrl(number, text);
}

export function buildCompanyMailtoUrl(email: string, companyName: string) {
  const subject = `Enquiry via ${SITE_NAME}`;
  const body = [
    `Ref By ${SITE_REF}`,
    "Hello,",
    "",
    `I found ${companyName} on thejobs4u and would like to know more about your job openings.`,
    "",
    "Thank you.",
  ].join("\r\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// The text that travels WITH a shared job link (native share sheet, or
// copied to the clipboard) so it reads as a message rather than a bare URL.
export function buildJobShareText(job: ShareJob) {
  return [
    `*${job.title}*`,
    hasRealCompany(job) ? job.company : null,
    job.location,
    "",
    `Apply on ${SITE_REF}`,
  ]
    .filter((line): line is string => line !== null && line !== undefined)
    .join("\n");
}
