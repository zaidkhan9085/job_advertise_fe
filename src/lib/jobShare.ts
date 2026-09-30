import type { JobPost, Company } from "@/lib/api";
import { SITE_URL, SITE_REF } from "@/lib/site";
import { slugify } from "@/lib/utils";

type ShareJob = Pick<JobPost, "id" | "title" | "company" | "location">;

const SITE_NAME = "thejobs4u";

// A human-readable slug in front of the real id -- e.g.
// /jobs/urgent-hiring-for-abu-dhabi-<uuid> instead of the bare uuid alone.
// The backend only ever reads the trailing uuid back out (see
// backend/utils/slugId.js's extractId), so this is purely cosmetic/SEO: no
// schema change, and a bare-uuid link from before this change still works
// since the id is still right there, just without a slug in front of it.
export function jobPagePath(job: Pick<JobPost, "id" | "title">) {
  const slug = slugify(job.title);
  return slug ? `/jobs/${slug}-${job.id}` : `/jobs/${job.id}`;
}

export function jobPageUrl(job: Pick<JobPost, "id" | "title">) {
  return `${SITE_URL}${jobPagePath(job)}`;
}

// Same slug-prefixed-id pattern as jobPagePath, for a company's public page.
export function companyPagePath(company: Pick<Company, "id" | "name">) {
  const slug = slugify(company.name);
  return slug ? `/companies/${slug}-${company.id}` : `/companies/${company.id}`;
}

export function companyPageUrl(company: Pick<Company, "id" | "name">) {
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
  const digits = number.replace(/[^\d+]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(buildJobWhatsAppMessage(job))}`;
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
  const digits = number.replace(/[^\d+]/g, "");
  const text = [`Ref By ${SITE_REF}`, `Hello, I found ${companyName} on thejobs4u and would like to know more about your job openings.`].join(
    "\n"
  );
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
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
