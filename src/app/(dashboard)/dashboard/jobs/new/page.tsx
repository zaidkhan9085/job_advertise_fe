"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Save,
  Info,
  BadgeCheck,
  Zap,
  ImagePlus,
  Mail,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createJob,
  getMyCompany,
  getJobTypes,
  getIndustries,
  parseJobPoster,
  searchJobLocations,
  ApiError,
  type JobType,
  type Industry,
  type ParsedJobPoster,
  type ParsedJobEntry,
  type PosterScanMeta,
} from "@/lib/api";
import CityAutocomplete, { type LocationValue } from "@/components/common/CityAutocomplete";
import PhoneInput from "@/components/common/PhoneInput";
import SearchableSelect from "@/components/common/SearchableSelect";
import { validateFileSize } from "@/lib/fileValidation";
import { useAuth } from "@/context/AuthContext";
import PosterScanPanel, { SCAN_STEPS, type ScanPhase } from "@/components/jobs/PosterScanPanel";
import { compressForScan } from "@/lib/compressImage";
import { DESCRIPTION_MAX_LENGTH } from "@/lib/jobLimits";

// The listing headline comes from the scan (about the ROLE, never the agency
// that posted it -- the backend strips the company name). Only if that's
// missing do we fall back to the single role's own name.
function buildTitleFromPoster(parsed: ParsedJobPoster): string {
  if (parsed.title) return parsed.title.trim();
  if (parsed.jobs.length === 1) return (parsed.jobs[0].category || "").trim();
  return "";
}

// The salary exactly as the poster prints it ("1,800 - 2,300 AED",
// "Negotiable"); the parsed numbers are only used when there's no printed text.
function formatSalary(job: ParsedJobEntry): string | null {
  if (job.salary_raw) return job.salary_raw;
  const currency = job.salary_currency ? `${job.salary_currency} ` : "";
  if (job.salary_min && job.salary_max) return `${currency}${job.salary_min}-${job.salary_max}`;
  if (job.salary_min) return `${currency}${job.salary_min}`;
  return null;
}

// Turns the poster-wide extracted fields into the free-text Job.description
// -- there's no structured vacancies/salary/benefits column on Job, so this
// is the only place that data can live. Every section is optional and
// omitted when empty; the result stays fully editable afterward, never
// regenerated on its own. A multi-role poster becomes ONE listing with one
// line per role (vacancies and salary on the same line) -- however many
// there are: the job page scrolls the description, so nothing is grouped,
// capped or hidden behind a "+N more".
function buildDescriptionFromPoster(parsed: ParsedJobPoster): string {
  const lines: string[] = [];
  const jobs = parsed.jobs;

  // A two-line summary first, so a reader gets the gist before the full list.
  // (`?.` because the backend deploys separately and may not send it yet.)
  if (parsed.overview?.length > 0) {
    lines.push("Overview:", ...parsed.overview, "");
  }

  if (jobs.length === 1) {
    const job = jobs[0];
    if (job.vacancies) lines.push(`Vacancies: ${job.vacancies}`);
    const salary = formatSalary(job);
    if (salary) lines.push(`Salary: ${salary}${/\d/.test(salary) ? " / month" : ""}`);
  } else if (jobs.length > 1) {
    lines.push("Positions:");
    jobs.forEach((job) => {
      const bits = [job.category || job.title || "Position"];
      if (job.vacancies) bits.push(`${job.vacancies} vacancies`);
      const salary = formatSalary(job);
      if (salary) bits.push(/\d/.test(salary) ? `${salary} / month` : salary);
      lines.push(`• ${bits.join(" — ")}`);
    });
  }

  if (parsed.requirements.length > 0) {
    lines.push("", "Requirements:", ...parsed.requirements.map((r) => `- ${r}`));
  }

  if (parsed.benefits.length > 0) {
    lines.push("", "Benefits:", ...parsed.benefits.map((b) => `- ${b}`));
  }

  if (parsed.interview_date || parsed.interview_time || parsed.interview_venue) {
    lines.push("", "Interview Details:");
    if (parsed.interview_date) lines.push(`Date: ${parsed.interview_date}`);
    if (parsed.interview_time) lines.push(`Time: ${parsed.interview_time}`);
    if (parsed.interview_venue) lines.push(`Venue: ${parsed.interview_venue}`);
  }

  if (parsed.contact_person || parsed.phone_numbers.length > 0 || parsed.address) {
    lines.push("", "Contact:");
    if (parsed.contact_person) lines.push(`Contact Person: ${parsed.contact_person}`);
    if (parsed.phone_numbers.length > 0) lines.push(`Phone: ${parsed.phone_numbers.join(", ")}`);
    if (parsed.address) lines.push(`Address: ${parsed.address}`);
  }

  if (parsed.website || parsed.social_links.length > 0) {
    lines.push("", "Connect with us:");
    if (parsed.website) lines.push(`Website: ${parsed.website}`);
    // Each entry is already "Platform: handle" when the platform could be
    // confidently guessed -- otherwise it's just the raw handle text, shown
    // as-is rather than mislabeled.
    parsed.social_links.forEach((s) => lines.push(s.includes(":") ? s : `Social: ${s}`));
  }

  // A basic (no-AI) read that couldn't pull out any roles: keep the
  // poster's own text so the recruiter has everything to work from.
  if (parsed.degraded && jobs.length === 0 && parsed.raw_text) {
    lines.push("", "Poster text (auto-scanned, please review):", parsed.raw_text);
  }

  return lines.join("\n").trim();
}

// Best-effort match against the real location tree -- searchJobLocations
// only does a prefix match on a single name, so a compound string like
// "Dubai, UAE" is split into tokens (most specific first) and each is tried
// in turn. Only an exact (or unambiguous single-result) match is returned;
// anything weaker is left for the recruiter to pick manually rather than
// risk silently attaching the wrong location.
async function resolveBestLocationMatch(text: string): Promise<LocationValue | null> {
  const tokens = text.split(/[,/-]/).map((t) => t.trim()).filter(Boolean);
  for (const token of tokens) {
    try {
      const results = await searchJobLocations(token);
      const exact = results.find((r) => r.name.toLowerCase() === token.toLowerCase());
      if (exact) return exact;
      if (results.length === 1 && results[0].name.toLowerCase().startsWith(token.toLowerCase())) {
        return results[0];
      }
    } catch {
      // Best-effort only — a failed lookup just means no auto-match.
    }
  }
  return null;
}

export default function PostJobPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [listingType, setListingType] = useState<"General" | "Premium">("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCompany, setIsCheckingCompany] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [jobLocation, setJobLocation] = useState<LocationValue | null>(null);

  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobTypeId, setJobTypeId] = useState("");

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryId, setIndustryId] = useState("");

  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poster scan: the recruiter uploads the image FIRST, then picks "Scan with
  // AI" or "Fill manually" (and can re-scan / switch any time) -- see
  // PosterScanPanel. `null` = no poster attached yet.
  const [scanPhase, setScanPhase] = useState<ScanPhase | null>(null);
  const isParsingPoster = scanPhase === "scanning";
  const [parsingStep, setParsingStep] = useState(0);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsedPoster, setParsedPoster] = useState<ParsedJobPoster | null>(null);
  const [scanBasic, setScanBasic] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  // The server refused the scan because the recruiter's daily allowance is used
  // up or an admin paused AI scanning for them -- retrying can't help.
  const [scanLocked, setScanLocked] = useState(false);
  // "3 of 10 AI scans left today", from the last successful scan.
  const [scanQuota, setScanQuota] = useState<PosterScanMeta["quota"]>(null);
  // Raw extracted location text, sent as the free-text `location` fallback
  // alongside jobLocationId -- the backend only uses it when jobLocationId
  // didn't resolve to a match, so an ambiguous/unmatched AI location isn't
  // silently lost even though the CityAutocomplete stays empty.
  const [posterLocationText, setPosterLocationText] = useState<string | null>(null);

  const isStaff = user?.role === "admin" || user?.role === "sub_admin";

  const loadFormData = useCallback(async () => {
    setIsCheckingCompany(true);
    try {
      // Admin/sub_admin have no Company of their own -- they're allowed to
      // post regardless (backend already permits this), so only employers
      // get redirected here for a missing company profile.
      const company = await getMyCompany();
      if (!company && !isStaff) {
        toast.error("Complete your company profile before posting a job.");
        router.push("/dashboard/profile");
        return;
      }
      const [jobTypeData, industryData] = await Promise.all([
        getJobTypes(),
        getIndustries(),
      ]);
      setJobTypes(jobTypeData);
      setIndustries(industryData);
      // Matches the backend's own default (see jobController.js's
      // createJob) -- pre-selecting it here means the form's visible
      // state is never out of sync with what actually gets saved when a
      // recruiter leaves these fields untouched.
      setJobTypeId((current) => current || jobTypeData.find((t) => t.name === "Long Term")?.id || current);
      setIndustryId((current) => current || industryData.find((i) => i.name === "Other Industries")?.id || current);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load the posting form.");
    } finally {
      setIsCheckingCompany(false);
    }
  }, [router, isStaff]);

  useEffect(() => {
    if (isAuthLoading) return;
    loadFormData();
  }, [loadFormData, isAuthLoading]);

  // Cosmetic step advance while a scan is in flight -- see SCAN_STEPS.
  useEffect(() => {
    if (!isParsingPoster) {
      setParsingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setParsingStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1));
    }, 1700);
    return () => clearInterval(interval);
  }, [isParsingPoster]);

  // Cosmetic linear progress below the stepper -- eases toward 92% and
  // holds there (never claims 100% until the real response lands) since
  // there's no real backend progress to report, just one opaque API call.
  useEffect(() => {
    if (!isParsingPoster) {
      setParsingProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setParsingProgress((p) => (p >= 92 ? 92 : p + Math.max(1, (92 - p) / 8)));
    }, 200);
    return () => clearInterval(interval);
  }, [isParsingPoster]);

  // What the most recent scan wrote into each field. A field still holding
  // exactly that text hasn't been touched by the recruiter, so scanning a
  // DIFFERENT poster may replace it -- while anything they typed or edited is
  // left alone.
  const autoFilled = useRef<{
    title?: string;
    description?: string;
    industryId?: string;
    jobTypeId?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    locationId?: string;
  }>({});

  // Fills the form from a scan. Only fields that are empty, still hold a
  // previous scan's own text, or (for industry) still sit on the "Other
  // Industries" default are filled; pressing Re-scan (overwrite) replaces
  // everything.
  const applyParsedPoster = async (parsed: ParsedJobPoster, overwrite: boolean) => {
    const filled = autoFilled.current;
    const canFill = (current: string, previous?: string) => overwrite || !current.trim() || current === previous;
    const otherIndustryId = industries.find((i) => i.name === "Other Industries")?.id;

    const nextTitle = buildTitleFromPoster(parsed).slice(0, 100);
    if (nextTitle && canFill(title, filled.title)) {
      setTitle(nextTitle);
      filled.title = nextTitle;
    }

    const nextDescription = buildDescriptionFromPoster(parsed).slice(0, DESCRIPTION_MAX_LENGTH);
    if (nextDescription && canFill(description, filled.description)) {
      setDescription(nextDescription);
      filled.description = nextDescription;
    }

    const industryUnset = !industryId || industryId === otherIndustryId || industryId === filled.industryId;
    if (parsed.industry && (overwrite || industryUnset)) {
      setIndustryId(parsed.industry.id);
      filled.industryId = parsed.industry.id;
    }

    // Short Term only when the poster says shutdown / short-term / similar,
    // otherwise the Long Term default. Unlike the text fields this ignores
    // "overwrite": it only ever moves a value that is still the default (or that
    // a previous scan set), so a Re-scan can't undo a job type the recruiter
    // chose themselves.
    const shortTermId = jobTypes.find((t) => t.name === "Short Term")?.id;
    const longTermId = jobTypes.find((t) => t.name === "Long Term")?.id;
    const wantedJobTypeId = parsed.job_type === "short" ? shortTermId : longTermId;
    const jobTypeUnset = !jobTypeId || jobTypeId === longTermId || jobTypeId === filled.jobTypeId;
    if (wantedJobTypeId && jobTypeUnset) {
      setJobTypeId(wantedJobTypeId);
      filled.jobTypeId = wantedJobTypeId;
    }

    const phone = parsed.phone_numbers[0];
    if (phone) {
      if (canFill(contactPhone, filled.phone)) {
        setContactPhone(phone);
        filled.phone = phone;
      }
      if (canFill(contactWhatsapp, filled.whatsapp)) {
        setContactWhatsapp(phone);
        filled.whatsapp = phone;
      }
    }
    if (parsed.email && canFill(contactEmail, filled.email)) {
      setContactEmail(parsed.email);
      filled.email = parsed.email;
    }

    setPosterLocationText(parsed.location);
    if (parsed.location && (overwrite || !jobLocation || jobLocation.id === filled.locationId)) {
      const match = await resolveBestLocationMatch(parsed.location);
      if (match) {
        setJobLocation(match);
        filled.locationId = match.id;
      }
    }
  };

  const runScan = async (file: File, { rescan = false }: { rescan?: boolean } = {}) => {
    // Starting a scan replaces any previous result/error.
    setParsedPoster(null);
    setScanError(null);
    setScanLocked(false);
    setScanBasic(false);
    setScanPhase("scanning");
    try {
      // A shrunken copy is what gets scanned (the original is still what's
      // posted with the job) -- the OCR service's free plan rejects >1MB.
      const scanFile = await compressForScan(file);
      const result = await parseJobPoster(scanFile, { rescan });
      setParsedPoster(result.parsed);
      await applyParsedPoster(result.parsed, rescan);
      setScanBasic(result.parsed.degraded);
      setScanQuota(result.meta?.quota ?? null);
      setScanPhase("scanned");
      if (result.parsed.degraded) {
        toast.warning("AI was busy, so we used a basic scan — please check every field carefully.");
      } else {
        toast.success(
          result.parsed.jobs.length > 1
            ? `Found ${result.parsed.jobs.length} positions on this poster — all included in one listing below.`
            : "We've read your poster and filled the form — please review before submitting."
        );
      }
    } catch (err) {
      // Cap what we'll show verbatim -- these are meant to be short,
      // deliberately-written messages (see jobController.js's parseJobPoster),
      // but anything longer (a raw network error, say) reads better as a
      // generic line than a wall of text.
      const message = err instanceof ApiError ? err.message : "";
      const shown =
        message && message.length <= 160
          ? message
          : "This doesn't look like a job poster — try a different image or fill in the form manually.";
      setScanError(shown);
      const code = err instanceof ApiError ? (err.body as { code?: string } | undefined)?.code : undefined;
      setScanLocked(code === "AI_SCAN_LIMIT" || code === "AI_SCAN_PAUSED");
      toast.error(shown);
      // The image is still attached and valid -- the panel offers Try again
      // without re-uploading (failures are usually a transient outage).
      setScanPhase("failed");
    }
  };

  const handlePosterChange = (file: File | null) => {
    if (file) {
      const error = validateFileSize(file);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setPoster(file);
    setPosterPreview(file ? URL.createObjectURL(file) : null);
    setParsedPoster(null);
    setScanError(null);
    setScanBasic(false);
    // Nothing is scanned automatically: the panel asks first.
    setScanPhase(file ? "choose" : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createJob({
        title,
        description: description || undefined,
        type: listingType === "Premium" ? "FEATURED" : "NORMAL",
        contactPhone: contactPhone || undefined,
        contactWhatsapp,
        contactEmail,
        jobLocationId: jobLocation?.id || undefined,
        location: posterLocationText || undefined,
        jobTypeId: jobTypeId || undefined,
        industryId: industryId || undefined,
        poster: poster || undefined,
      });

      toast.success(result.message);
      router.push("/dashboard/jobs");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isCheckingCompany) {
    return (
      <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-blue transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Post a Job</h1>
            <p className="text-muted-foreground mt-1 text-base font-medium">
              Submitted jobs go to an admin for approval before they appear on the site.
            </p>
          </div>
        </div>

        <div className="bg-muted/30 p-1 rounded-2xl flex items-center border border-border/40 shadow-inner w-full sm:w-auto sm:min-w-70">
          <button
            type="button"
            onClick={() => setListingType("General")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              listingType === "General" ? "bg-white text-brand-blue shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BadgeCheck className={`w-4 h-4 ${listingType === "General" ? "text-brand-blue" : "text-muted-foreground"}`} />
            General
          </button>
          <button
            type="button"
            onClick={() => setListingType("Premium")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              listingType === "Premium" ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className={`w-4 h-4 ${listingType === "Premium" ? "text-white" : "text-muted-foreground"}`} />
            Featured
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl border border-border/60 shadow-sm overflow-hidden p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-border/40 pb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Job Basic Details</h2>
          </div>

          {/* Poster upload + scan panel -- always full opacity/visible, even
              while scanning, so progress never ends up out of view on a long
              form. The upload comes first; the panel then asks whether to
              scan it with AI or fill in the form by hand. */}
          <div className="flex flex-col items-center gap-4 text-center">
            <label className="text-sm font-bold text-foreground/80">Poster Image (optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handlePosterChange(e.target.files?.[0] ?? null)}
            />
            {posterPreview ? (
              <div className="relative w-full max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={posterPreview} alt="Poster preview" className="w-full rounded-2xl border border-border/60 object-cover" />
                <button
                  type="button"
                  disabled={isParsingPoster}
                  onClick={() => {
                    handlePosterChange(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 bg-white/90 text-foreground text-xs font-bold px-3 py-1.5 rounded-full border border-border/60 hover:bg-white disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-xs flex flex-col items-center justify-center gap-2 py-8 rounded-2xl bg-secondary/30 border-2 border-dashed border-border/60 hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-muted-foreground hover:text-brand-blue"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-sm font-semibold">Upload a poster image</span>
                <span className="text-xs">JPG, PNG, WebP — you can auto-fill the form from it</span>
              </button>
            )}

            {poster && scanPhase && (
              <PosterScanPanel
                phase={scanPhase}
                step={parsingStep}
                progress={parsingProgress}
                roleCount={parsedPoster?.jobs.length}
                shortTerm={parsedPoster?.job_type === "short"}
                basic={scanBasic}
                quota={scanQuota}
                locked={scanLocked}
                errorMessage={scanError}
                onScan={() => runScan(poster)}
                onManual={() => setScanPhase("manual")}
                onRescan={() => runScan(poster, { rescan: true })}
              />
            )}
          </div>

          {/* Rest of Basic Details -- dimmed and non-interactive while a
              scan is in flight, so typing here can't race with the
              pre-fill that lands when parsing finishes. */}
          <div
            aria-busy={isParsingPoster}
            inert={isParsingPoster}
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity ${isParsingPoster ? "opacity-40 pointer-events-none" : ""}`}
          >
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                required
                type="text"
                placeholder="e.g. Senior Site Engineer"
                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
              />
              <div className="text-xs text-muted-foreground text-right">{title.length}/100</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">
                <MapPin className="w-4 h-4" /> Job Location (optional)
              </label>
              <CityAutocomplete value={jobLocation} onChange={setJobLocation} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Industry (optional)</label>
              <SearchableSelect
                value={industryId}
                onChange={setIndustryId}
                options={industries.map((i) => ({ value: i.id, label: i.name }))}
                placeholder="Search and select an industry..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Type (optional)</label>
              <select
                value={jobTypeId}
                onChange={(e) => setJobTypeId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
              >
                <option value="">Not specified</option>
                {jobTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div
          aria-busy={isParsingPoster}
          inert={isParsingPoster}
          className={`space-y-8 transition-opacity ${isParsingPoster ? "opacity-40 pointer-events-none" : ""}`}
        >
          <div className="bg-white rounded-3xl border border-border/60 shadow-sm overflow-hidden p-8 space-y-6">
            <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Recruiter Details</h2>
            <p className="text-sm text-muted-foreground -mt-4">Shown as Call/WhatsApp/Email buttons on the job listing.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Calling Number</label>
                <PhoneInput value={contactPhone} onChange={setContactPhone} placeholder="234 567 890" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">WhatsApp Number *</label>
                <PhoneInput value={contactWhatsapp} onChange={setContactWhatsapp} placeholder="234 567 890" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    type="email"
                    placeholder="hr@company.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-border/60 shadow-sm overflow-hidden p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-border/40 pb-5">
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.47_0.20_25)]/10 text-[oklch(0.47_0.20_25)] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Job Content</h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
                rows={8}
                placeholder="Include job responsibilities, requirements, salary benefits, duty hours, and contract details."
                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">{description.length}/{DESCRIPTION_MAX_LENGTH}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex-1 py-5 px-8 rounded-2xl bg-brand-blue text-white font-black text-xl shadow-xl shadow-brand-blue/25 hover:bg-brand-blue-medium hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Save className="w-6 h-6" /> Submit for Approval
                </>
              )}
            </button>
            <Link
              href="/dashboard/jobs"
              className="w-full sm:w-auto flex items-center justify-center py-4 px-8 rounded-2xl bg-white text-muted-foreground font-black uppercase tracking-widest text-xs border border-border/60 hover:bg-secondary transition-all"
            >
              Cancel
            </Link>
          </div>

          <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-5 flex gap-4">
            <Info className="w-6 h-6 text-brand-blue shrink-0 mt-1" />
            <p className="text-sm text-brand-blue font-medium leading-relaxed">
              Your job will appear as &ldquo;Pending&rdquo; on your Manage Jobs page until an admin approves it.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
