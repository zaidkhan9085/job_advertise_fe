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
  Sparkles,
  PenLine,
  Check,
  RotateCcw,
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
} from "@/lib/api";
import CityAutocomplete, { type LocationValue } from "@/components/common/CityAutocomplete";
import PhoneInput from "@/components/common/PhoneInput";
import SearchableSelect from "@/components/common/SearchableSelect";
import { validateFileSize } from "@/lib/fileValidation";
import { useAuth } from "@/context/AuthContext";

// Cosmetic progress steps shown while a poster scan is in flight -- the
// backend is a single opaque Gemini call (plus retries), it doesn't report
// discrete stages, so this is a simulated sequence (see the timer effect
// below) rather than real backend progress. Purely to give the recruiter
// something concrete to look at instead of an indefinite spinner.
const PARSING_STEPS = ["Reading your poster", "Extracting job details", "Matching location", "Filling your form"];

// A poster with multiple job categories becomes ONE job listing, not one
// per category (matching how similar sites present multi-role posters) --
// so the title has to represent the whole posting, not a single role.
function buildTitleFromPoster(parsed: ParsedJobPoster): string {
  if (parsed.jobs.length === 1) {
    return (parsed.jobs[0].title || parsed.jobs[0].category || "").trim();
  }
  if (parsed.jobs.length > 1) {
    const where = [parsed.company_name, parsed.location].filter(Boolean).join(" — ");
    return where ? `Urgently Required — ${where}` : "Urgently Required — Multiple Positions";
  }
  return parsed.company_name ? `Job Opening at ${parsed.company_name}` : "";
}

function formatSalary(job: ParsedJobEntry): string | null {
  const currency = job.salary_currency ? `${job.salary_currency} ` : "";
  if (job.salary_min && job.salary_max) return `${currency}${job.salary_min}-${job.salary_max}`;
  if (job.salary_min) return `${currency}${job.salary_min}+`;
  return job.salary_raw || null;
}

// Turns the poster-wide extracted fields into the free-text Job.description
// -- there's no structured vacancies/salary/benefits column on Job, so this
// is the only place that data can live. Every section is optional and
// omitted when empty; the result stays fully editable afterward, never
// regenerated on its own. Multiple detected jobs are listed out here (one
// line each) since they all become a single job posting, not separate ones.
function buildDescriptionFromPoster(parsed: ParsedJobPoster): string {
  const lines: string[] = [];
  const jobs = parsed.jobs;

  if (jobs.length === 1) {
    const job = jobs[0];
    if (job.vacancies) lines.push(`Vacancies: ${job.vacancies}`);
    const salary = formatSalary(job);
    if (salary) lines.push(`Salary: ${salary} / month`);
  } else if (jobs.length > 1) {
    lines.push("Positions:");
    // Group roles that share the exact same salary (and vacancy count) --
    // a dense multi-role poster can list 50+ positions across only a
    // handful of real salary tiers, so grouping keeps every single role
    // name visible (nothing hidden behind a "+N more") while staying
    // compact instead of one bullet line per role.
    const groups: { label: string; roles: string[] }[] = [];
    const indexByLabel = new Map<string, number>();
    jobs.forEach((job) => {
      const role = job.category || job.title || "Position";
      const bits: string[] = [];
      if (job.vacancies) bits.push(`${job.vacancies} vacancies`);
      const salary = formatSalary(job);
      if (salary) bits.push(`${salary}/month`);
      const label = bits.join(" — ");
      let idx = indexByLabel.get(label);
      if (idx === undefined) {
        idx = groups.length;
        indexByLabel.set(label, idx);
        groups.push({ label, roles: [] });
      }
      groups[idx].roles.push(role);
    });
    groups.forEach(({ label, roles }) => {
      const roleText = roles.join(", ");
      lines.push(label ? `- ${roleText} — ${label}` : `- ${roleText}`);
    });
  }

  if (parsed.requirements.length > 0) {
    lines.push("", "Requirements:", ...parsed.requirements.map((r) => `- ${r}`));
  }

  if (parsed.benefits.length > 0) {
    lines.push("", "Benefits:", ...parsed.benefits.map((b) => `- ${b}`));
  }

  if (parsed.project_name) lines.push("", `Project: ${parsed.project_name}`);

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
    // confidently guessed (see ruleBasedJobPosterParser.js) -- otherwise
    // it's just the raw handle text, shown as-is rather than mislabeled.
    parsed.social_links.forEach((s) => lines.push(s.includes(":") ? s : `Social: ${s}`));
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
  const [isFreeRecruitment, setIsFreeRecruitment] = useState(false);

  const [jobLocation, setJobLocation] = useState<LocationValue | null>(null);

  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobTypeId, setJobTypeId] = useState("");

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryId, setIndustryId] = useState("");

  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI poster-scan mode: uploading a poster image pre-fills the fields
  // below for review instead of typing everything manually. Defaults to
  // manual so an untouched page behaves exactly as before this feature.
  const [posterMode, setPosterMode] = useState<"manual" | "scan">("manual");
  const [isParsingPoster, setIsParsingPoster] = useState(false);
  const [parsingStep, setParsingStep] = useState(0);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsedPoster, setParsedPoster] = useState<ParsedJobPoster | null>(null);
  const [scanFailed, setScanFailed] = useState(false);
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

  // Cosmetic step advance while a scan is in flight -- see PARSING_STEPS.
  useEffect(() => {
    if (!isParsingPoster) {
      setParsingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setParsingStep((s) => Math.min(s + 1, PARSING_STEPS.length - 1));
    }, 1300);
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

  const applyParsedPoster = async (parsed: ParsedJobPoster) => {
    setTitle(buildTitleFromPoster(parsed).slice(0, 100));
    setDescription(buildDescriptionFromPoster(parsed).slice(0, 2500));
    if (parsed.phone_numbers[0]) {
      setContactPhone(parsed.phone_numbers[0]);
      setContactWhatsapp(parsed.phone_numbers[0]);
    }
    if (parsed.email) setContactEmail(parsed.email);
    setPosterLocationText(parsed.location);
    if (parsed.location) {
      const match = await resolveBestLocationMatch(parsed.location);
      if (match) setJobLocation(match);
    }
  };

  const runScan = async (file: File) => {
    // Starting a scan replaces any previous result/error.
    setParsedPoster(null);
    setScanFailed(false);

    setIsParsingPoster(true);
    try {
      const result = await parseJobPoster(file);
      setParsedPoster(result.parsed);
      await applyParsedPoster(result.parsed);
      // Same messaging regardless of which path (Gemini or the rule-based
      // fallback) actually produced the result -- the recruiter reviews
      // every field before submitting either way, so there's no need to
      // flag which source read the poster.
      toast.success(
        result.parsed.jobs.length > 1
          ? `Found ${result.parsed.jobs.length} positions on this poster — all included in one listing below.`
          : "We've read your poster and filled the form — please review before submitting."
      );
    } catch (err) {
      // Cap what we'll show verbatim -- these fields are meant to hold a
      // short, deliberately-written status message (see jobController.js's
      // parseJobPoster), but if anything ever leaks through longer than
      // that (a raw network/parse error, say), a short generic line reads
      // better than a wall of text in a toast.
      const message = err instanceof ApiError ? err.message : "";
      toast.error(
        message && message.length <= 120
          ? message
          : "This doesn't look like a job poster — try a different image or fill in the form manually."
      );
      // The image itself is still perfectly valid and already attached --
      // no need to make the recruiter re-upload it just to try again (the
      // failure is almost always a transient AI-provider hiccup, not
      // anything wrong with the file).
      setScanFailed(true);
    } finally {
      setIsParsingPoster(false);
    }
  };

  const handlePosterChange = async (file: File | null) => {
    if (file) {
      const error = validateFileSize(file);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setPoster(file);
    setPosterPreview(file ? URL.createObjectURL(file) : null);
    setScanFailed(false);

    if (!file || posterMode !== "scan") return;
    await runScan(file);
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
        isFreeRecruitment,
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

          {/* Mode toggle + poster upload + scan progress -- always full
              opacity/visible, even while parsing, so the progress indicator
              never ends up out of view on a long form. */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-muted/30 p-1 rounded-2xl flex items-center border border-border/40 shadow-inner w-full sm:w-auto sm:min-w-70">
              <button
                type="button"
                disabled={isParsingPoster}
                onClick={() => setPosterMode("scan")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-all disabled:opacity-60 ${
                  posterMode === "scan" ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className={`w-4 h-4 shrink-0 ${posterMode === "scan" ? "text-white" : "text-muted-foreground"}`} />
                Scan with AI
              </button>
              <button
                type="button"
                disabled={isParsingPoster}
                onClick={() => setPosterMode("manual")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-all disabled:opacity-60 ${
                  posterMode === "manual" ? "bg-white text-brand-blue shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PenLine className={`w-4 h-4 shrink-0 ${posterMode === "manual" ? "text-brand-blue" : "text-muted-foreground"}`} />
                Fill Manually
              </button>
            </div>

            <label className="text-sm font-bold text-foreground/80">
              {posterMode === "scan" ? "Upload your job poster photo — we'll read it and fill this form" : "Poster Image (optional)"}
            </label>
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
                    setParsedPoster(null);
                  }}
                  className="absolute top-2 right-2 bg-white/90 text-foreground text-xs font-bold px-3 py-1.5 rounded-full border border-border/60 hover:bg-white disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isParsingPoster}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full max-w-xs flex flex-col items-center justify-center gap-2 py-8 rounded-2xl bg-secondary/30 border-2 border-dashed transition-all text-muted-foreground hover:text-brand-blue disabled:opacity-60 ${
                  posterMode === "scan" ? "border-brand-blue/40 hover:border-brand-blue bg-brand-blue/5" : "border-border/60 hover:border-brand-blue hover:bg-brand-blue/5"
                }`}
              >
                {posterMode === "scan" ? <Sparkles className="w-6 h-6" /> : <ImagePlus className="w-6 h-6" />}
                <span className="text-sm font-semibold">
                  {posterMode === "scan" ? "Upload poster to auto-fill" : "Upload a poster image"}
                </span>
                <span className="text-xs">JPG, PNG, WebP</span>
              </button>
            )}

            {isParsingPoster && (
              <div className="w-full max-w-xs pt-1">
                <div className="flex items-center">
                  {PARSING_STEPS.map((step, i) => (
                    <div key={step} className="flex-1 flex items-center last:flex-none">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                          i < parsingStep
                            ? "bg-brand-blue text-white"
                            : i === parsingStep
                              ? "bg-brand-blue text-white animate-pulse"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {i < parsingStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      {i < PARSING_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 rounded-full ${i < parsingStep ? "bg-brand-blue" : "bg-border"}`} />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-brand-blue mt-2.5">{PARSING_STEPS[parsingStep]}</p>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-brand-blue rounded-full transition-[width] duration-200 ease-linear"
                    style={{ width: `${parsingProgress}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-muted-foreground mt-1">{Math.round(parsingProgress)}%</p>
              </div>
            )}

            {!isParsingPoster && parsedPoster && parsedPoster.jobs.length > 1 && (
              <p className="text-sm font-bold text-brand-blue bg-brand-blue/5 border border-brand-blue/10 rounded-2xl px-4 py-2.5">
                Found {parsedPoster.jobs.length} positions on this poster — all included in the listing below.
              </p>
            )}

            {!isParsingPoster && scanFailed && poster && (
              <button
                type="button"
                onClick={() => runScan(poster)}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue bg-brand-blue/5 border border-brand-blue/10 rounded-2xl px-4 py-2.5 hover:bg-brand-blue/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retry scan
              </button>
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

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Free Recruitment</label>
              <select
                value={isFreeRecruitment ? "yes" : "no"}
                onChange={(e) => setIsFreeRecruitment(e.target.value === "yes")}
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              <p className="text-xs text-muted-foreground">Shown as a badge to candidates if the candidate pays nothing.</p>
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
                onChange={(e) => setDescription(e.target.value.slice(0, 2500))}
                rows={8}
                placeholder="Include job responsibilities, requirements, salary benefits, duty hours, and contract details."
                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">{description.length}/2500</div>
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
