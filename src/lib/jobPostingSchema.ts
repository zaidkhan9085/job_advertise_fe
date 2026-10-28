import type { JobPost } from "@/lib/api";
import { jobPageUrl } from "@/lib/jobShare";

// Maps our own Job fields onto Schema.org JobPosting -- the structured data
// Google's "Jobs" rich-result feature specifically requires. Deliberately
// conservative: every field here comes from real data on the job, nothing
// is guessed or fabricated (no baseSalary -- we don't collect a structured
// salary; jobLocation omitted rather than parsed from free text when there's
// no linked JobLocation row).
//
// "Long Term"/"Short Term" are this app's own JobType names (not an
// employment-duration concept Schema.org has a direct equivalent for) --
// FULL_TIME/TEMPORARY are the closest honest mapping, not a precise one.
const EMPLOYMENT_TYPE_BY_JOB_TYPE: Record<string, string> = {
  "Long Term": "FULL_TIME",
  "Short Term": "TEMPORARY",
};

function buildJobLocation(job: JobPost) {
  const loc = job.jobLocation;
  if (!loc) return undefined;

  const address: Record<string, string> = { "@type": "PostalAddress" };
  if (loc.countryName) {
    // A CITY-level pick -- the full breakdown is available.
    address.addressLocality = loc.name;
    if (loc.stateName) address.addressRegion = loc.stateName;
    address.addressCountry = loc.countryName;
  } else {
    // A coarser pick (state/country/region, no finer breakdown stored) --
    // still real location data, just less granular; use it as-is rather
    // than omitting the job's location entirely.
    address.addressCountry = loc.name;
  }

  return { "@type": "Place", address };
}

export function buildJobPostingJsonLd(job: JobPost): Record<string, unknown> {
  const employmentType = job.jobType ? EMPLOYMENT_TYPE_BY_JOB_TYPE[job.jobType.name] : undefined;
  const jobLocation = buildJobLocation(job);

  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: "thejobs4u",
      value: job.id,
    },
    datePosted: job.createdAt,
    ...(job.validThrough ? { validThrough: job.validThrough } : {}),
    ...(employmentType ? { employmentType } : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    ...(jobLocation ? { jobLocation } : {}),
    url: jobPageUrl(job),
    // Google-recommended extension (not core Schema.org) -- a real Apply
    // flow exists on this page, not an email-only/third-party listing.
    directApply: true,
  };
}
