"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import {
  Coins,
  Lock,
  MessageCircle,
  Mail,
  Printer,
  Download,
  X,
  Loader2,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Search,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  searchCandidates,
  unlockCandidate,
  getMyCredits,
  getQualifications,
  type ATSCandidate,
  type CreditsSummary,
  type Qualification,
  type PaginatedMeta,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import Preview from "@/components/resume-builder/Preview";
import CityAutocomplete, { type LocationValue } from "@/components/common/CityAutocomplete";
import SimpleSelect from "@/components/common/SimpleSelect";

// Naukri-style min-max range filters, not fixed bands — a plain number
// dropdown for each bound so a recruiter can build any custom range (e.g.
// 2-6 years) instead of being locked into a handful of preset buckets.
const EXPERIENCE_YEAR_OPTIONS = Array.from({ length: 41 }, (_, i) => i);
const AGE_OPTIONS = Array.from({ length: 48 }, (_, i) => i + 18); // 18-65

const PAGE_LIMIT = 20;
const UNLOCK_COST = 1;

// Shared by every "More filters" control so they all sit on the same
// visual baseline as CityAutocomplete/MultiSelectCombobox's own built-in
// label styling (text-[11px] font-bold uppercase, same select chrome).
const filterLabelClass = "block text-[11px] font-bold text-muted-foreground uppercase tracking-wide";
const filterSelectClass =
  "w-full px-3 py-2.5 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium appearance-none cursor-pointer";

// One "Min – Max" pair of <select>s for a numeric range filter (experience
// years, age) — a real min-max range like Naukri's, not a fixed band, so a
// recruiter can build any custom range.
function RangeSelectPair<T extends number>({
  min,
  max,
  onMinChange,
  onMaxChange,
  options,
  formatOption,
}: {
  min: T | "";
  max: T | "";
  onMinChange: (value: T | "") => void;
  onMaxChange: (value: T | "") => void;
  options: readonly T[];
  formatOption: (value: T) => string;
}) {
  const selectOptions = options.map((o) => ({ value: String(o), label: formatOption(o) }));
  const rangeTriggerClass =
    "w-full flex items-center justify-between gap-1 px-2.5 py-2.5 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium cursor-pointer";
  return (
    <div className="flex items-center gap-1.5">
      <SimpleSelect
        value={min === "" ? "" : String(min)}
        onChange={(v) => onMinChange(v === "" ? "" : (Number(v) as T))}
        options={selectOptions}
        placeholder="Min"
        className={rangeTriggerClass}
      />
      <span className="text-muted-foreground text-xs shrink-0">–</span>
      <SimpleSelect
        value={max === "" ? "" : String(max)}
        onChange={(v) => onMaxChange(v === "" ? "" : (Number(v) as T))}
        options={selectOptions}
        placeholder="Max"
        className={rangeTriggerClass}
      />
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatFreshness(candidate: ATSCandidate): string {
  if (!candidate.hasResume || !candidate.resumeUpdatedAt) return "No resume uploaded yet";
  const days = Math.floor((Date.now() - new Date(candidate.resumeUpdatedAt).getTime()) / 86_400_000);
  if (days <= 0) return "Resume updated today";
  if (days === 1) return "Resume updated yesterday";
  if (days < 30) return `Resume updated ${days} days ago`;
  const months = Math.floor(days / 30);
  return `Resume updated ${months} month${months > 1 ? "s" : ""} ago`;
}

function ResumeModal({
  candidate,
  resume,
  uploadedResumeUrl,
  onClose,
}: {
  candidate: ATSCandidate;
  resume: { theme: unknown; sections: unknown } | null;
  uploadedResumeUrl: string | null;
  onClose: () => void;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: previewRef, documentTitle: `Resume_${candidate.name}` });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/60 shrink-0">
          <div>
            <h3 className="font-bold text-foreground">{candidate.name}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              {candidate.whatsapp && (
                <a
                  href={`https://wa.me/${candidate.whatsapp.replace(/[^\d+]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> {candidate.whatsapp}
                </a>
              )}
              {candidate.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {candidate.email}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {uploadedResumeUrl && (
              <a
                href={uploadedResumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue/90"
              >
                <Download className="w-4 h-4" /> Download Resume
              </a>
            )}
            {resume && (
              <button
                onClick={() => handlePrint()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue/90"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            )}
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-secondary/30 p-6 flex justify-center">
          {resume ? (
            <Preview ref={previewRef} data={{ theme: resume.theme, sections: resume.sections }} />
          ) : uploadedResumeUrl ? (
            <div className="text-center text-muted-foreground py-20">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="mb-4">This candidate uploaded a resume file.</p>
              <a
                href={uploadedResumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue/90"
              >
                <Download className="w-4 h-4" /> Download Resume
              </a>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-20">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              This candidate hasn&apos;t uploaded or built a resume yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-border/60 rounded-2xl px-4 py-3.5 shadow-sm">
      <div className="text-xs font-bold text-muted-foreground mb-1.5">{label}</div>
      <div className="text-xl font-black text-foreground tabular-nums">
        {value}
        {sub && <span className="text-xs font-bold text-emerald-600 ml-2">{sub}</span>}
      </div>
    </div>
  );
}

export default function SearchCandidatesPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "sub_admin";

  const [candidates, setCandidates] = useState<ATSCandidate[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [stats, setStats] = useState<{ totalCandidates: number; withResumeCount: number } | null>(null);
  const [credits, setCredits] = useState<CreditsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [keywordMode, setKeywordMode] = useState<"all" | "any">("any");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [qualification, setQualification] = useState("");
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [expMin, setExpMin] = useState<number | "">("");
  const [expMax, setExpMax] = useState<number | "">("");
  const [ageMax, setAgeMax] = useState<number | "">("");
  const [nationality, setNationality] = useState("");
  const [gender, setGender] = useState("");
  const [resumeWithinDays, setResumeWithinDays] = useState<number | undefined>(undefined);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [unlockingId, setUnlockingId] = useState<number | null>(null);
  const [viewing, setViewing] = useState<{
    candidate: ATSCandidate;
    resume: { theme: unknown; sections: unknown } | null;
    uploadedResumeUrl: string | null;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, keywordMode, location, qualification, expMin, expMax, ageMax, nationality, gender, resumeWithinDays]);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      keywordMode,
      jobLocationId: location?.id || undefined,
      qualification: qualification || undefined,
      expMin: expMin === "" ? undefined : expMin,
      expMax: expMax === "" ? undefined : expMax,
      ageMax: ageMax === "" ? undefined : ageMax,
      nationality: nationality || undefined,
      gender: gender || undefined,
      resumeWithinDays,
    }),
    [search, keywordMode, location, qualification, expMin, expMax, ageMax, nationality, gender, resumeWithinDays]
  );

  const loadCredits = useCallback(async () => {
    if (isStaff) return;
    try {
      setCredits(await getMyCredits());
    } catch {
      // non-fatal — the balance just won't show
    }
  }, [isStaff]);

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [result] = await Promise.all([searchCandidates({ ...filters, page, limit: PAGE_LIMIT }), loadCredits()]);
      setCandidates(result.data);
      setMeta(result.meta);
      setStats(result.stats);
      setSelectedUserId((prev) =>
        prev && result.data.some((c) => c.userId === prev) ? prev : result.data[0]?.userId ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to search candidates.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, loadCredits]);

  useEffect(() => {
    if (user && (user.role === "employer" || user.role === "sub_admin" || user.role === "admin")) {
      getQualifications().then(setQualifications).catch(() => {});
      loadCandidates();
    }
  }, [user, loadCandidates]);

  if (user && user.role !== "employer" && user.role !== "sub_admin" && user.role !== "admin") {
    return <ComingSoon title="Search Candidates" />;
  }

  const selected = candidates.find((c) => c.userId === selectedUserId) ?? null;

  const handleSelect = (c: ATSCandidate) => {
    setSelectedUserId(c.userId);
    setMobileDetailOpen(true);
  };

  const handleUnlock = async (candidate: ATSCandidate, openResume = true) => {
    setUnlockingId(candidate.userId);
    try {
      const result = await unlockCandidate(candidate.userId);
      toast.success(candidate.isUnlocked ? "Resume opened" : `Unlocked — ${result.creditsRemaining} credit(s) remaining`);
      // Refetch rather than patching local state piecemeal — once
      // isUnlocked flips server-side, searchCandidates also reveals
      // summary/skills/experience/education/certifications/projects (see
      // atsController.js), which unlockCandidate's own response doesn't
      // carry back. loadCandidates already refreshes credits too.
      await loadCandidates();
      if (openResume)
        setViewing({
          candidate: { ...candidate, isUnlocked: true, ...result.candidate },
          resume: result.resume,
          uploadedResumeUrl: result.uploadedResumeUrl,
        });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to unlock candidate.");
    } finally {
      setUnlockingId(null);
    }
  };

  // Drives both the "Reset" button's visibility and the removable chips row
  // below the filter bar — each chip clears just that one filter, derived
  // straight from the same state the filter controls themselves use.
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (searchInput) chips.push({ key: "search", label: `"${searchInput}"`, onRemove: () => setSearchInput("") });
    if (location) {
      chips.push({
        key: "location",
        label: [location.name, location.state, location.country].filter(Boolean).join(", "),
        onRemove: () => setLocation(null),
      });
    }
    if (qualification) chips.push({ key: "qualification", label: qualification, onRemove: () => setQualification("") });
    if (expMin !== "" || expMax !== "") {
      chips.push({
        key: "exp",
        label: `Experience: ${expMin === "" ? "0" : expMin}-${expMax === "" ? "40+" : expMax} yrs`,
        onRemove: () => {
          setExpMin("");
          setExpMax("");
        },
      });
    }
    if (ageMax !== "") {
      chips.push({ key: "age", label: `Age: up to ${ageMax}`, onRemove: () => setAgeMax("") });
    }
    if (gender) chips.push({ key: "gender", label: gender, onRemove: () => setGender("") });
    if (nationality) chips.push({ key: "nationality", label: nationality, onRemove: () => setNationality("") });
    if (resumeWithinDays) {
      chips.push({
        key: "resumeWithinDays",
        label: `Updated in ${resumeWithinDays}d`,
        onRemove: () => setResumeWithinDays(undefined),
      });
    }
    return chips;
  }, [searchInput, location, qualification, expMin, expMax, ageMax, gender, nationality, resumeWithinDays]);

  const hasActiveFilters = activeFilterChips.length > 0;
  const resetFilters = () => {
    setSearchInput("");
    setKeywordMode("any");
    setLocation(null);
    setQualification("");
    setExpMin("");
    setExpMax("");
    setAgeMax("");
    setNationality("");
    setGender("");
    setResumeWithinDays(undefined);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">Search Candidates</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {isStaff
              ? "Admin access — every candidate's contact info and resume is visible directly, no unlock needed."
              : "Scan the roster on the left, then unlock a profile on the right to reveal contact info and resume."}
          </p>
        </div>
        {credits && !isStaff && (
          <div className="inline-flex items-center gap-2 bg-white border border-border/60 rounded-xl px-4 py-2.5 shadow-sm shrink-0">
            <Coins className="w-4 h-4 text-brand-orange" />
            <span className="font-black text-foreground">{credits.creditsRemaining}</span>
            <span className="text-xs text-muted-foreground font-medium">credits remaining</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total candidates" value={stats ? stats.totalCandidates.toLocaleString() : "—"} />
        <StatCard
          label="With a resume on file"
          value={stats ? stats.withResumeCount.toLocaleString() : "—"}
          sub={stats && stats.totalCandidates > 0 ? `${Math.round((stats.withResumeCount / stats.totalCandidates) * 100)}%` : undefined}
        />
        <StatCard label="Matching current filters" value={meta ? meta.total.toLocaleString() : "—"} />
      </div>

      <div className="bg-white border border-border/60 rounded-2xl p-3 shadow-sm space-y-3">
        {/* Every control shares the same "small uppercase label + input"
            shape (matching CityAutocomplete/MultiSelectCombobox's own
            built-in label styling) so the whole bar sits on one visual
            baseline instead of some controls floating higher than others. */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px] space-y-1.5">
            <label className={filterLabelClass}>Keyword</label>
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, position, qualification..."
                className="w-full pl-9 pr-24 py-3 rounded-xl border-[1.5px] border-border bg-white shadow-sm hover:border-brand-blue/40 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm font-medium"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex bg-secondary/60 rounded-full p-0.5">
                <button
                  onClick={() => setKeywordMode("all")}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    keywordMode === "all" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setKeywordMode("any")}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    keywordMode === "any" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Any
                </button>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <CityAutocomplete label="Location" placeholder="Any location" value={location} onChange={setLocation} />
          </div>
          <button
            onClick={() => setShowMoreFilters((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-3 rounded-xl border text-sm font-bold transition-colors shrink-0 ${
              showMoreFilters ? "border-brand-blue bg-brand-blue/5 text-brand-blue" : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> More filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-3 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        {showMoreFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-border/60">
            <div className="space-y-1.5">
              <label className={filterLabelClass}>Qualification</label>
              <SimpleSelect
                value={qualification}
                onChange={setQualification}
                options={qualifications.map((q) => ({ value: q.name, label: q.name }))}
                placeholder="Any qualification"
              />
            </div>
            <div className="space-y-1.5">
              <label className={filterLabelClass}>Experience</label>
              <RangeSelectPair
                min={expMin}
                max={expMax}
                onMinChange={setExpMin}
                onMaxChange={setExpMax}
                options={EXPERIENCE_YEAR_OPTIONS}
                formatOption={(y) => `${y} yr${y === 1 ? "" : "s"}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={filterLabelClass}>Age (up to)</label>
              <SimpleSelect
                value={ageMax === "" ? "" : String(ageMax)}
                onChange={(v) => setAgeMax(v === "" ? "" : Number(v))}
                options={AGE_OPTIONS.map((a) => ({ value: String(a), label: String(a) }))}
                placeholder="Any age"
              />
            </div>
            <div className="space-y-1.5">
              <label className={filterLabelClass}>Gender</label>
              <SimpleSelect
                value={gender}
                onChange={setGender}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
                placeholder="All"
              />
            </div>
            <div className="space-y-1.5">
              <label className={filterLabelClass}>Resume Updated</label>
              <SimpleSelect
                value={resumeWithinDays ? String(resumeWithinDays) : ""}
                onChange={(v) => setResumeWithinDays(v ? Number(v) : undefined)}
                options={[
                  { value: "7", label: "In 7 days" },
                  { value: "30", label: "In 30 days" },
                  { value: "90", label: "In 90 days" },
                ]}
                placeholder="Any time"
              />
            </div>
            <div className="space-y-1.5">
              <label className={filterLabelClass}>Nationality</label>
              <input
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Any nationality"
                className={filterSelectClass}
              />
            </div>
          </div>
        )}

        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/60">
            {activeFilterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue bg-brand-blue/10 rounded-full pl-2.5 pr-1.5 py-1"
              >
                {chip.label}
                <button onClick={chip.onRemove} className="p-0.5 rounded-full hover:bg-brand-blue/20 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4 items-start">
        {/* ── Roster ──
            The dashboard shell's own sidebar already reserves ~230-270px, so
            the split view only gets real breathing room from `xl` (1280px)
            up — below that, both panels are full-width and one is hidden,
            same collapsing behavior as phone/tablet. */}
        <div className={`bg-white border border-border/60 rounded-2xl shadow-sm overflow-hidden ${mobileDetailOpen ? "hidden xl:block" : ""}`}>
          <div className="px-4 py-3 border-b border-border/60 flex items-baseline justify-between">
            <h2 className="text-sm font-bold text-foreground">
              {isLoading ? "Searching…" : `Showing ${candidates.length}`}
            </h2>
            <span className="text-xs text-muted-foreground font-medium">{meta ? `of ${meta.total.toLocaleString()}` : ""}</span>
          </div>

          <div className="max-h-[460px] xl:max-h-[600px] overflow-y-auto divide-y divide-border/60">
            {isLoading && candidates.length === 0 ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground font-medium">No candidates match your search yet.</div>
            ) : (
              candidates.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
                    c.userId === selectedUserId ? "bg-brand-blue/5 border-l-2 border-l-brand-blue" : "border-l-2 border-l-transparent hover:bg-secondary/40"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-light text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.position}</div>
                  </div>
                  {c.isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between text-xs font-bold">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-lg text-muted-foreground disabled:opacity-30 hover:bg-secondary/60"
              >
                Prev
              </button>
              <span className="text-muted-foreground">Page {meta.page} of {meta.totalPages}</span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1.5 rounded-lg text-muted-foreground disabled:opacity-30 hover:bg-secondary/60"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* ── Detail ── */}
        {/* DashboardHeader is a normal flex sibling above <main>, not sticky/fixed
            itself, so it never overlaps <main>'s scrolled content — this only
            needs a small breathing-room offset, not clearance for a header. */}
        <div className={`bg-white border border-border/60 rounded-2xl shadow-sm overflow-hidden xl:sticky xl:top-0 ${!mobileDetailOpen ? "hidden xl:block" : ""}`}>
          <button
            onClick={() => setMobileDetailOpen(false)}
            className="xl:hidden flex items-center gap-1.5 px-4 py-3 text-xs font-bold text-muted-foreground border-b border-border/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to list
          </button>

          {!selected ? (
            <div className="p-12 text-center text-sm text-muted-foreground font-medium">Select a candidate to view their profile.</div>
          ) : (
            <>
              <div className="p-5 sm:p-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-light text-white text-lg font-black flex items-center justify-center shrink-0">
                    {initials(selected.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-black text-foreground">{selected.name}</div>
                    <div className="text-sm text-muted-foreground font-medium">{selected.position}</div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{formatFreshness(selected)}</div>
                  </div>
                </div>
                <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                  {selected.isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      {isStaff ? <ShieldCheck className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isStaff ? "Admin access" : "Unlocked"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </span>
                  )}
                  <div className="flex gap-2">
                    {selected.isUnlocked ? (
                      <>
                        {selected.whatsapp && (
                          <a
                            href={`https://wa.me/${selected.whatsapp.replace(/[^\d+]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                        <button
                          disabled={!selected.hasResume}
                          onClick={() => handleUnlock(selected, true)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 disabled:opacity-40"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Resume
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={unlockingId === selected.userId}
                        onClick={() => handleUnlock(selected)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue/90 disabled:opacity-60"
                      >
                        {unlockingId === selected.userId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                        Unlock &middot; {UNLOCK_COST} credit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 border-b border-border/60">
                {[
                  ["Qualification", selected.qualification],
                  ["Industry", selected.industry],
                  [
                    "Experience · India",
                    [selected.indianExp, selected.indianExpYears != null ? `(${selected.indianExpYears} yrs)` : null].filter(Boolean).join(" "),
                  ],
                  [
                    "Experience · Gulf",
                    [selected.gulfExp, selected.gulfExpYears != null ? `(${selected.gulfExpYears} yrs)` : null].filter(Boolean).join(" "),
                  ],
                  ["Age", selected.age != null ? `${selected.age}` : null],
                  ["Nationality", [selected.nationality, selected.gender].filter(Boolean).join(" · ")],
                  ["Current location", selected.currentLocation || selected.region?.name],
                  ["Preferred location", selected.preferredLocation],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
                    <div className="text-sm font-semibold text-foreground">{value || "—"}</div>
                  </div>
                ))}
              </div>

              {selected.summary && (
                <div className="p-5 sm:p-6 border-b border-border/60">
                  <div className="text-xs font-bold text-muted-foreground mb-2">Summary</div>
                  <p className="text-sm text-foreground leading-relaxed">{selected.summary}</p>
                </div>
              )}

              {selected.skills && selected.skills.length > 0 && (
                <div className="p-5 sm:p-6 border-b border-border/60">
                  <div className="text-xs font-bold text-muted-foreground mb-2.5">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills.map((skill) => (
                      <span key={skill} className="text-xs font-bold text-foreground bg-secondary/50 border border-border/60 rounded-full px-2.5 py-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.experience && selected.experience.length > 0 && (
                <div className="p-5 sm:p-6 border-b border-border/60 space-y-3">
                  <div className="text-xs font-bold text-muted-foreground">Experience</div>
                  {selected.experience.map((entry, i) => (
                    <div key={entry.id || i} className="text-sm">
                      <div className="font-bold text-foreground">
                        {entry.title}
                        {entry.subtitle ? ` · ${entry.subtitle}` : ""}
                      </div>
                      {entry.date && <div className="text-xs text-muted-foreground">{entry.date}</div>}
                      {entry.content && <div className="text-muted-foreground mt-0.5">{entry.content}</div>}
                    </div>
                  ))}
                </div>
              )}

              {selected.education && selected.education.length > 0 && (
                <div className="p-5 sm:p-6 border-b border-border/60 space-y-3">
                  <div className="text-xs font-bold text-muted-foreground">Education</div>
                  {selected.education.map((entry, i) => (
                    <div key={entry.id || i} className="text-sm">
                      <div className="font-bold text-foreground">
                        {entry.title}
                        {entry.subtitle ? ` · ${entry.subtitle}` : ""}
                      </div>
                      {entry.date && <div className="text-xs text-muted-foreground">{entry.date}</div>}
                      {entry.content && <div className="text-muted-foreground mt-0.5">{entry.content}</div>}
                    </div>
                  ))}
                </div>
              )}

              {selected.projects && selected.projects.length > 0 && (
                <div className="p-5 sm:p-6 border-b border-border/60 space-y-3">
                  <div className="text-xs font-bold text-muted-foreground">Projects</div>
                  {selected.projects.map((entry, i) => (
                    <div key={entry.id || i} className="text-sm">
                      <div className="font-bold text-foreground">
                        {entry.title}
                        {entry.subtitle ? ` · ${entry.subtitle}` : ""}
                      </div>
                      {entry.date && <div className="text-xs text-muted-foreground">{entry.date}</div>}
                      {entry.content && <div className="text-muted-foreground mt-0.5">{entry.content}</div>}
                    </div>
                  ))}
                </div>
              )}

              {selected.certifications && selected.certifications.length > 0 && (
                <div className="p-5 sm:p-6 border-b border-border/60">
                  <div className="text-xs font-bold text-muted-foreground mb-2.5">Certifications</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.certifications.map((cert) => (
                      <span key={cert} className="text-xs font-bold text-foreground bg-secondary/50 border border-border/60 rounded-full px-2.5 py-1">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-5 sm:p-6">
                <div className="text-xs font-bold text-muted-foreground mb-2.5">Resume</div>
                {!selected.hasResume ? (
                  <div className="rounded-xl border border-dashed border-border/60 p-5 flex items-center gap-3 text-sm text-muted-foreground font-medium">
                    <FileText className="w-5 h-5 opacity-40 shrink-0" />
                    This candidate hasn&apos;t uploaded a resume yet.
                  </div>
                ) : selected.isUnlocked ? (
                  <button
                    onClick={() => handleUnlock(selected, true)}
                    className="w-full rounded-xl border border-border/60 bg-secondary/30 p-5 flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-brand-blue shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-foreground">Resume on file</div>
                      <div className="text-xs text-muted-foreground">Click to view or download</div>
                    </div>
                  </button>
                ) : (
                  <div className="relative rounded-xl border border-border/60 bg-secondary/30 p-5 overflow-hidden">
                    <div className="space-y-2.5 blur-[3px] opacity-70">
                      <div className="h-2 rounded bg-border w-2/5" />
                      <div className="h-2 rounded bg-border w-4/5" />
                      <div className="h-2 rounded bg-border w-3/5" />
                      <div className="h-2 rounded bg-border w-2/3" />
                      <div className="h-2 rounded bg-border w-1/3" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary/50 backdrop-blur-[1px]">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground">Unlock to view the full resume</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {viewing && (
        <ResumeModal
          candidate={viewing.candidate}
          resume={viewing.resume}
          uploadedResumeUrl={viewing.uploadedResumeUrl}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}
