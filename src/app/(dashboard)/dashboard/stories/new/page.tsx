"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Clock, ImagePlus, Phone, MessageSquare, Zap, Crown, Loader2 } from "lucide-react";
import {
  createJob,
  getMyBilling,
  parseJobPoster,
  ApiError,
  type StoryTag,
  type ParsedJobPoster,
  type PosterScanMeta,
} from "@/lib/api";
import PhoneInput from "@/components/common/PhoneInput";
import CityAutocomplete, { type LocationValue } from "@/components/common/CityAutocomplete";
import { validateFileSize } from "@/lib/fileValidation";
import { compressForScan } from "@/lib/compressImage";
import { resolveBestLocationMatch } from "@/lib/resolveLocationMatch";
import PosterScanPanel, { SCAN_STEPS, type ScanPhase } from "@/components/jobs/PosterScanPanel";

const STORY_TAGS: StoryTag[] = ["Long Term", "Short Term", "Urgent", "Contract"];

// Stories have no separate vacancies/salary/benefits fields -- everything
// collapses into the one short (300-char) description, so this is a lean
// version of jobs/new's buildTitleFromPoster/buildDescriptionFromPoster,
// not a reuse of the full multi-section composer (which assumes far more
// room than a Story's description has).
function buildStoryTitle(parsed: ParsedJobPoster): string {
  if (parsed.title) return parsed.title.trim();
  if (parsed.jobs.length === 1) return (parsed.jobs[0].category || parsed.jobs[0].title || "").trim();
  return "";
}

function buildStoryDescription(parsed: ParsedJobPoster): string {
  if (parsed.overview?.length > 0) return parsed.overview.join(" ");
  const roles = parsed.jobs.map((j) => j.category || j.title).filter(Boolean);
  if (roles.length > 0) return `Hiring: ${roles.join(", ")}`;
  return "";
}

// Checked once on mount rather than only at submit -- letting a Free-plan
// employer fill in a title, upload an image, and pick contact numbers just
// to get blocked at the very end (the old behavior) wastes their time for
// no reason; the plan gate is knowable up front.
function useStoriesAllowed() {
  const [status, setStatus] = useState<"checking" | "blocked" | "allowed">("checking");

  useEffect(() => {
    getMyBilling()
      .then((billing) => setStatus(billing.plan.storiesAllowed ? "allowed" : "blocked"))
      .catch(() => setStatus("allowed")); // fail open -- a billing-check hiccup shouldn't block a Pro employer who's actually entitled; the real createJob call still enforces this server-side regardless.
  }, []);

  return status;
}

function StoriesBlockedNotice() {
  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-500">
      <Link href="/dashboard/stories" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-blue transition-colors w-fit mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="bg-white rounded-3xl border border-border/60 shadow-sm p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
          <Crown className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">Stories are a Pro feature</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your current plan doesn&apos;t include Stories. Upgrade to Pro to post one — it also raises your
            featured and general job posting limits.
          </p>
        </div>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white font-black hover:bg-brand-blue-medium transition-colors"
        >
          <Crown className="w-4 h-4" /> Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}

export default function PostStoryPage() {
  const router = useRouter();
  const storiesAllowed = useStoriesAllowed();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [tag, setTag] = useState<StoryTag>("Long Term");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");

  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Same AI poster-scan flow as Post Job (PosterScanPanel/parseJobPoster) --
  // the recruiter uploads first, then chooses AI auto-fill or manual entry.
  const [scanPhase, setScanPhase] = useState<ScanPhase | null>(null);
  const isParsingPoster = scanPhase === "scanning";
  const [parsingStep, setParsingStep] = useState(0);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsedPoster, setParsedPoster] = useState<ParsedJobPoster | null>(null);
  const [scanBasic, setScanBasic] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanLocked, setScanLocked] = useState(false);
  const [scanQuota, setScanQuota] = useState<PosterScanMeta["quota"]>(null);
  const [posterLocationText, setPosterLocationText] = useState<string | null>(null);

  // Resets the cosmetic stepper/progress when a scan isn't running -- same
  // pattern already used for this exact purpose in jobs/new/page.tsx.
  useEffect(() => {
    if (!isParsingPoster) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParsingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setParsingStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1));
    }, 1700);
    return () => clearInterval(interval);
  }, [isParsingPoster]);

  useEffect(() => {
    if (!isParsingPoster) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParsingProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setParsingProgress((p) => (p >= 92 ? 92 : p + Math.max(1, (92 - p) / 8)));
    }, 200);
    return () => clearInterval(interval);
  }, [isParsingPoster]);

  const applyParsedPoster = async (parsed: ParsedJobPoster, overwrite: boolean) => {
    const canFill = (current: string) => overwrite || !current.trim();

    const nextTitle = buildStoryTitle(parsed).slice(0, 100);
    if (nextTitle && canFill(title)) setTitle(nextTitle);

    const nextDescription = buildStoryDescription(parsed).slice(0, 300);
    if (nextDescription && canFill(description)) setDescription(nextDescription);

    if (parsed.job_type === "short" && (overwrite || tag === "Long Term")) {
      setTag("Short Term");
    }

    const phone = parsed.phone_numbers[0];
    if (phone) {
      if (canFill(contactPhone)) setContactPhone(phone);
      if (canFill(contactWhatsapp)) setContactWhatsapp(phone);
    }

    setPosterLocationText(parsed.location);
    if (parsed.location && (overwrite || !location)) {
      const match = await resolveBestLocationMatch(parsed.location);
      if (match) setLocation(match);
    }
  };

  const runScan = async (file: File, { rescan = false }: { rescan?: boolean } = {}) => {
    setParsedPoster(null);
    setScanError(null);
    setScanLocked(false);
    setScanBasic(false);
    setScanPhase("scanning");
    try {
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
        toast.success("We've read your poster and filled the form — please review before posting.");
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "";
      const shown =
        message && message.length <= 160
          ? message
          : "This doesn't look like a job poster — try a different image or fill in the form manually.";
      setScanError(shown);
      const code = err instanceof ApiError ? (err.body as { code?: string } | undefined)?.code : undefined;
      setScanLocked(code === "AI_SCAN_LIMIT" || code === "AI_SCAN_PAUSED");
      toast.error(shown);
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
    // Nothing is scanned automatically: the panel asks first, same as Post Job.
    setScanPhase(file ? "choose" : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!poster) {
      toast.error("A story image is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createJob({
        title,
        jobLocationId: location?.id,
        location: posterLocationText || undefined,
        description,
        type: "STORY",
        tag,
        contactPhone: contactPhone || undefined,
        contactWhatsapp: contactWhatsapp || undefined,
        poster,
      });

      toast.success(result.message);
      router.push("/dashboard/stories");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      const code = err instanceof ApiError ? (err.body as { code?: string } | undefined)?.code : undefined;
      if (code === "PLAN_LIMIT_REACHED") {
        toast.error(message, { action: { label: "Upgrade to Pro", onClick: () => router.push("/dashboard/billing") } });
      } else {
        toast.error(message);
      }
      setIsSubmitting(false);
    }
  };

  if (storiesAllowed === "checking") {
    return (
      <div className="max-w-xl mx-auto py-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (storiesAllowed === "blocked") {
    return <StoriesBlockedNotice />;
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-2">
        <Link href="/dashboard/stories" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-blue transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Post a Story</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Stories disappear after 24 hours
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-border/60 shadow-sm p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
            Story Image <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground">Stories need an eye-catching image. This is what people see first.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handlePosterChange(e.target.files?.[0] ?? null)}
          />
          {posterPreview ? (
            <div className="relative w-full max-w-[200px] mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterPreview} alt="Story preview" className="w-full aspect-9/16 object-cover rounded-2xl border border-border/60" />
              <button
                type="button"
                disabled={isParsingPoster}
                onClick={() => { handlePosterChange(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute top-2 right-2 bg-white/90 text-foreground text-xs font-bold px-3 py-1.5 rounded-full border border-border/60 hover:bg-white disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-[200px] mx-auto aspect-9/16 flex flex-col items-center justify-center gap-2 rounded-2xl bg-secondary/30 border-2 border-dashed border-brand-blue/40 hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-muted-foreground hover:text-brand-blue"
            >
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm font-bold">Tap to upload image</span>
              <span className="text-xs">Max 5MB &bull; JPG, PNG, WebP</span>
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

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            required
            type="text"
            placeholder="e.g. We're Hiring Sales Executives!"
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
          />
          <div className="text-xs text-muted-foreground text-right">{title.length}/100</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 300))}
            rows={3}
            placeholder="Brief info about the role..."
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">{description.length}/300</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Location (optional)</label>
          <CityAutocomplete value={location} onChange={setLocation} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Job Type *</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as StoryTag)}
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
          >
            {STORY_TAGS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Shown as a tag on the story card.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </label>
            <PhoneInput value={contactPhone} onChange={setContactPhone} placeholder="98765 43210" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Number
            </label>
            <PhoneInput value={contactWhatsapp} onChange={setContactWhatsapp} placeholder="98765 43210" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground -mt-4">These numbers will show as Call & WhatsApp buttons on your story.</p>

        <div className="bg-secondary/30 rounded-2xl p-5 space-y-2">
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-brand-blue" /> How Stories Work
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Stories appear on the homepage for <strong>24 hours</strong></li>
            <li>Only <strong>1 story at a time</strong> per employer</li>
            <li>Upload a poster image to grab attention</li>
            <li>Stories are separate from Standard & Highlighted job ads</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isParsingPoster}
          className="w-full py-4 rounded-2xl bg-brand-blue text-white font-black shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-medium transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" /> {isSubmitting ? "Posting..." : "Post Story"}
        </button>
      </form>
    </div>
  );
}
