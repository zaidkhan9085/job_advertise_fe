"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Briefcase,
  ArrowRight,
  MessageCircle,
  Building,
  LayoutGrid,
  List as ListIcon,
  RotateCcw,
  ChevronDown,
  Star,
} from "lucide-react";
import {
  getJobs,
  getJobTypes,
  getIndustries,
  searchJobLocations,
  type JobPost,
  ApiError,
} from "@/lib/api";
import JobPosterImage from "@/components/common/JobPosterImage";
import MultiSelectCombobox, { type ComboOption } from "@/components/common/MultiSelectCombobox";
import LocationCountFilter, { type LocationValue } from "@/components/common/LocationCountFilter";
import { useIsRecent } from "@/hooks/useIsRecent";

const PAGE_SIZE = 12;

const TIME_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "24h", label: "Last 24 hours" },
  { value: "3d", label: "Last 3 days" },
  { value: "7d", label: "Last week" },
  { value: "30d", label: "Last month" },
];

const JOB_TYPE_OPTIONS: ComboOption[] = [
  { value: "Long Term", label: "Long Term" },
  { value: "Shutdown", label: "Shutdown" },
  { value: "Free", label: "Free Recruitment" },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseCsv(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

function JobsListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [timeFilter, setTimeFilter] = useState(searchParams.get("time") || "any");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [industryOptions, setIndustryOptions] = useState<ComboOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLocations, setSelectedLocations] = useState<LocationValue[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<ComboOption[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<ComboOption[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [jobsData, industries] = await Promise.all([getJobs(), getIndustries()]);
      setJobs(jobsData);
      setIndustryOptions(industries.map((i) => ({ value: i.id, label: i.name })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load jobs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // One-time hydration from homepage links (?industry=id, ?location=slug) —
  // waits for industryOptions to load so its chip can actually be shown as
  // selected. Location has no preloaded list anymore (worldwide search), so
  // it resolves each slug against the search endpoint directly instead.
  useEffect(() => {
    if (hydrated || industryOptions.length === 0) return;

    const industryIds = new Set(parseCsv(searchParams.get("industry")));
    if (industryIds.size) {
      setSelectedIndustries(industryOptions.filter((o) => industryIds.has(o.value)));
    }

    const locationSlugs = parseCsv(searchParams.get("location"));
    if (locationSlugs.length) {
      Promise.all(
        locationSlugs.map(async (slug) => {
          const guess = slug.replace(/-/g, " ");
          const results = await searchJobLocations(guess).catch(() => []);
          return results.find((r) => slugify(r.name) === slug) ?? null;
        })
      ).then((matches) => {
        setSelectedLocations(matches.filter((m): m is LocationValue => !!m));
      });
    }

    const typeNames = new Set(parseCsv(searchParams.get("jobtype")));
    if (typeNames.size) {
      setSelectedJobTypes(JOB_TYPE_OPTIONS.filter((o) => typeNames.has(o.value)));
    }

    setHydrated(true);
  }, [hydrated, industryOptions, searchParams]);

  // Keeps the URL shareable/bookmarkable as filters change, mirroring the
  // pattern the page already used for `q`.
  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (timeFilter !== "any") params.set("time", timeFilter);
    if (selectedLocations.length) params.set("location", selectedLocations.map((o) => slugify(o.name)).join(","));
    if (selectedIndustries.length) params.set("industry", selectedIndustries.map((o) => o.value).join(","));
    if (selectedJobTypes.length) params.set("jobtype", selectedJobTypes.map((o) => o.value).join(","));
    router.replace(`/jobs${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router/searchParams intentionally excluded to avoid a loop with the hydration effect
  }, [hydrated, searchTerm, timeFilter, selectedLocations, selectedIndustries, selectedJobTypes]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, timeFilter, selectedLocations, selectedIndustries, selectedJobTypes]);

  const filteredJobs = useMemo(() => {
    const now = Date.now();
    const TIME_MS: Record<string, number> = { "24h": 86_400_000, "3d": 3 * 86_400_000, "7d": 7 * 86_400_000, "30d": 30 * 86_400_000 };

    const selectedLocationIds = new Set(selectedLocations.map((o) => o.id));
    const selectedIndustryIds = new Set(selectedIndustries.map((o) => o.value));
    const selectedTypeNames = new Set(selectedJobTypes.map((o) => o.value));

    return jobs.filter((job) => {
      const location = job.location ?? "";
      const matchesSearch =
        !searchTerm ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTime = timeFilter === "any" || now - new Date(job.createdAt).getTime() <= TIME_MS[timeFilter];

      // A selected filter result can be at any level (city/state/country),
      // so match a job if the selection is either its exact location or one
      // of its denormalized ancestors (e.g. selecting "Maharashtra" matches
      // a job posted in "Mumbai"). Text fallback stays as a safety net for
      // jobs saved before jobLocationCountryId/StateId existed.
      const matchesLocation =
        selectedLocationIds.size === 0 ||
        (job.jobLocationId && selectedLocationIds.has(job.jobLocationId)) ||
        (job.jobLocationCountryId && selectedLocationIds.has(job.jobLocationCountryId)) ||
        (job.jobLocationStateId && selectedLocationIds.has(job.jobLocationStateId)) ||
        selectedLocations.some((o) => location.toLowerCase().includes(o.name.toLowerCase()));

      const matchesIndustry = selectedIndustryIds.size === 0 || (!!job.industryId && selectedIndustryIds.has(job.industryId));

      const matchesJobType =
        selectedTypeNames.size === 0 ||
        (selectedTypeNames.has("Long Term") && job.jobType?.name === "Long Term") ||
        (selectedTypeNames.has("Shutdown") && job.jobType?.name === "Shutdown") ||
        (selectedTypeNames.has("Free") && job.isFreeRecruitment);

      return matchesSearch && matchesTime && matchesLocation && matchesIndustry && matchesJobType;
    });
  }, [jobs, searchTerm, timeFilter, selectedLocations, selectedIndustries, selectedJobTypes]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);

  const hasActiveFilters =
    !!searchTerm || timeFilter !== "any" || selectedLocations.length > 0 || selectedIndustries.length > 0 || selectedJobTypes.length > 0;

  const resetAllFilters = () => {
    setSearchTerm("");
    setTimeFilter("any");
    setSelectedLocations([]);
    setSelectedIndustries([]);
    setSelectedJobTypes([]);
    router.replace("/jobs", { scroll: false });
  };

  const headingLabel =
    selectedIndustries.length === 1
      ? `${selectedIndustries[0].label} Jobs`
      : selectedLocations.length === 1
      ? `Jobs in ${selectedLocations[0].name}`
      : "Find Your Dream Job Today";

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      <div className="bg-hero-gradient text-white pt-16 pb-24 md:pt-20 md:pb-28 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue-light/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="container-site relative text-center px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">{headingLabel}</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Browse verified overseas job vacancies across the Middle East, Europe, and Asia.
          </p>
        </div>
      </div>

      <div className="container-site relative -mt-10 mb-8 z-10 px-4">
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-xl border border-border/60 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Job title, company, or location..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-secondary/50 border-none outline-none focus:ring-2 focus:ring-brand-blue transition-all font-medium text-foreground h-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-52 relative shrink-0">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full pl-4 pr-9 py-3.5 rounded-xl bg-secondary/50 border-none outline-none focus:ring-2 focus:ring-brand-blue transition-all font-medium text-foreground appearance-none h-full cursor-pointer"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
            <LocationCountFilter
              label="Location"
              placeholder="Search city, state, or country..."
              selected={selectedLocations}
              onChange={setSelectedLocations}
              jobs={jobs}
            />
            <MultiSelectCombobox
              label="Industry"
              placeholder="Any industry"
              options={industryOptions}
              selected={selectedIndustries}
              onChange={setSelectedIndustries}
            />
            <MultiSelectCombobox
              label="Job Type"
              placeholder="Any type"
              options={JOB_TYPE_OPTIONS}
              selected={selectedJobTypes}
              onChange={setSelectedJobTypes}
            />
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container-site px-4">
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-foreground">
              Showing <span className="text-brand-blue">{Math.min(visibleJobs.length, filteredJobs.length)}</span> of{" "}
              <span className="text-brand-blue">{filteredJobs.length}</span> jobs
            </h2>

            <div className="flex items-center bg-white rounded-lg border border-border/60 p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-brand-blue/5 text-brand-blue shadow-inner" : "text-muted-foreground hover:text-foreground"}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-brand-blue/5 text-brand-blue shadow-inner" : "text-muted-foreground hover:text-foreground"}`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>
          )}

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-border/40 p-12 text-center shadow-sm text-muted-foreground font-medium">
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border/40 p-12 text-center shadow-sm">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground">No jobs found</h3>
              <p className="text-muted-foreground mt-2">
                {jobs.length === 0 ? "There are no approved jobs yet — check back soon." : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <>
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "space-y-4"}>
                {visibleJobs.map((job) => (
                  <JobCardView key={job.id} job={job} mode={viewMode} />
                ))}
              </div>

              {visibleCount < filteredJobs.length && (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-white border border-border/60 text-brand-blue font-bold hover:bg-brand-blue-muted/40 hover:border-brand-blue/30 transition-all shadow-sm"
                  >
                    Load More Jobs
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function JobCardView({ job, mode }: { job: JobPost; mode: "grid" | "list" }) {
  const router = useRouter();
  const isNew = useIsRecent(job.createdAt);
  const goToJob = () => router.push(`/jobs/${job.id}`);

  if (mode === "grid") {
    return (
      <div
        onClick={goToJob}
        className={`group bg-white rounded-2xl border shadow-[0_4px_20px_rgb(30,58,138,0.04)] hover:shadow-[0_20px_40px_rgba(30,58,138,0.08)] transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer ${
          job.type === "FEATURED"
            ? "border-[#DAA520]/40 hover:border-[#DAA520]/70 hover:bg-amber-50/20"
            : "border-brand-blue/15 hover:border-brand-blue/40 hover:bg-brand-blue-muted/5"
        }`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-brand-blue/10 bg-secondary/20">
          <JobPosterImage image={job.image} title={job.title} company={job.company} className="w-full h-full" />
          {job.type === "FEATURED" && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-[#DAA520] to-[#FFD700] py-1.5 px-3 flex items-center gap-1.5 shadow-md">
              <Star className="w-3 h-3 fill-white text-white shrink-0" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Featured</span>
            </div>
          )}
          {isNew && (
            <span className="absolute bottom-2.5 left-2.5 z-10 text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md bg-emerald-500 text-white shadow-md">
              New
            </span>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-extrabold text-[13px] leading-tight group-hover:text-brand-blue transition-colors line-clamp-1 mb-1">
            {job.title}
          </h3>
          <div className="flex items-center gap-1 mb-2 text-[11px] font-medium text-muted-foreground group-hover:text-brand-blue transition-colors">
            <Building className="w-3 h-3 text-brand-blue/40 shrink-0" />
            <span className="truncate">{job.company}</span>
            <span className="text-brand-blue/20 shrink-0">·</span>
            <MapPin className="w-3 h-3 text-brand-blue/40 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="mt-auto pt-2 border-t border-brand-blue/10 flex items-center justify-end gap-1.5">
            {job.contactWhatsapp && (
              <a
                href={`https://wa.me/${job.contactWhatsapp.replace(/[^\d+]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}
            <div className="p-1.5 rounded-md bg-brand-blue/5 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all" title="Apply">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={goToJob}
      className={`group bg-white rounded-2xl border p-4 sm:p-5 shadow-[0_4px_20px_rgb(30,58,138,0.04)] hover:shadow-[0_20px_40px_rgba(30,58,138,0.08)] transition-all duration-300 cursor-pointer ${
        job.type === "FEATURED"
          ? "border-[#DAA520]/40 hover:border-[#DAA520]/70 bg-amber-50/10"
          : "border-brand-blue/15 hover:border-brand-blue/40 hover:bg-brand-blue-muted/5"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        <div className="relative w-full sm:w-24 h-32 sm:h-24 shrink-0">
          <JobPosterImage image={job.image} title={job.title} company={job.company} className="w-full h-full rounded-xl border border-brand-blue/10" />
          {isNew && (
            <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-emerald-500 text-white shadow-md">
              New
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-brand-blue group-hover:text-brand-blue-medium transition-colors line-clamp-1 leading-snug">
              {job.title}
            </h3>
            {job.type === "FEATURED" && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-white shadow-sm">
                <Star className="w-3 h-3 fill-white" /> Featured
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm font-bold text-muted-foreground group-hover:text-brand-blue transition-colors mb-4">
            <span className="flex items-center gap-1.5"><Building className="w-4 h-4 opacity-50 text-brand-blue" /> {job.company}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-50 text-brand-blue" /> {job.location}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 opacity-50 text-brand-blue" /> {job.type}</span>
          </div>
        </div>
        <div className="w-full sm:w-auto sm:border-l sm:border-brand-blue/10 sm:pl-6 flex flex-row sm:flex-col gap-2 shrink-0">
          {job.contactWhatsapp && (
            <a
              href={`https://wa.me/${job.contactWhatsapp.replace(/[^\d+]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 sm:w-32 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-bold text-[13px] transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          )}
          <div className="flex-1 sm:w-32 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-blue/5 text-brand-blue group-hover:bg-brand-blue group-hover:text-white font-bold text-[13px] transition-all">
            Details <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/10 animate-pulse" />}>
      <JobsListingContent />
    </Suspense>
  );
}
