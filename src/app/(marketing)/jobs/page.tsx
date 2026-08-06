"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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
} from "lucide-react";
import { getJobs, type JobPost, ApiError } from "@/lib/api";
import JobPosterImage from "@/components/common/JobPosterImage";
import { useIsRecent } from "@/hooks/useIsRecent";

function JobsListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "Any Location");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setJobs(await getJobs());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load jobs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredJobs = jobs.filter((job) => {
    const location = job.location ?? "";
    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      selectedLocation === "Any Location" ||
      location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      (selectedLocation === "GCC" && /uae|saudi|qatar/i.test(location));

    return matchesSearch && matchesLocation;
  });

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "Any Location") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      <div className="bg-hero-gradient text-white pt-16 pb-24 md:pt-20 md:pb-28 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue-light/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="container-site relative text-center px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            {selectedLocation !== "Any Location" ? `Jobs in ${selectedLocation}` : "Find Your Dream Job Today"}
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Browse verified overseas job vacancies across the Middle East, Europe, and Asia.
          </p>
        </div>
      </div>

      <div className="container-site relative -mt-10 mb-10 z-10 px-4">
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-border/60">
          <div className="flex flex-col md:flex-row gap-4">
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
            <div className="md:w-64 relative shrink-0">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-secondary/50 border-none outline-none focus:ring-2 focus:ring-brand-blue transition-all font-medium text-foreground appearance-none h-full cursor-pointer"
                value={selectedLocation}
                onChange={(e) => { setSelectedLocation(e.target.value); updateFilters("location", e.target.value); }}
              >
                <option>Any Location</option>
                <option>Dubai, UAE</option>
                <option>Riyadh, Saudi Arabia</option>
                <option>GCC</option>
                <option>Europe</option>
                <option>India</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container-site px-4">
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-foreground">
              Showing <span className="text-brand-blue">{filteredJobs.length}</span> jobs
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
                {jobs.length === 0 ? "There are no approved jobs yet — check back soon." : "Try adjusting your search or location filter."}
              </p>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5" : "space-y-4"}>
              {filteredJobs.map((job) => (
                <JobCardView key={job.id} job={job} mode={viewMode} />
              ))}
            </div>
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
        className="group bg-white rounded-2xl border border-brand-blue/15 shadow-[0_4px_20px_rgb(30,58,138,0.04)] hover:shadow-[0_20px_40px_rgba(30,58,138,0.08)] hover:border-brand-blue/40 hover:bg-brand-blue-muted/5 transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-brand-blue/10">
          <JobPosterImage image={job.image} title={job.title} company={job.company} className="w-full h-full" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {isNew && (
              <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-black/80 text-white backdrop-blur-sm">New</span>
            )}
            {job.type === "FEATURED" && (
              <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-brand-blue text-white backdrop-blur-sm">Featured</span>
            )}
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="block mb-3">
            <h3 className="font-extrabold text-lg leading-tight group-hover:text-brand-blue transition-colors line-clamp-2">
              {job.title}
            </h3>
          </div>
          <div className="space-y-2 mb-4 text-sm font-medium text-muted-foreground group-hover:text-brand-blue transition-colors">
            <div className="flex items-center gap-1.5"><Building className="w-4 h-4 text-brand-blue/40" /> {job.company}</div>
            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brand-blue/40" /> {job.location}</div>
          </div>
          <div className="mt-auto pt-4 border-t border-brand-blue/10 flex items-center justify-end gap-2">
            {job.contactWhatsapp && (
              <a
                href={`https://wa.me/${job.contactWhatsapp.replace(/[^\d+]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            <div className="p-2 rounded-lg bg-brand-blue/5 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={goToJob}
      className="group bg-white rounded-2xl border border-brand-blue/15 p-4 sm:p-5 shadow-[0_4px_20px_rgb(30,58,138,0.04)] hover:shadow-[0_20px_40px_rgba(30,58,138,0.08)] hover:border-brand-blue/40 hover:bg-brand-blue-muted/5 transition-all duration-300 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        <JobPosterImage image={job.image} title={job.title} company={job.company} className="w-full sm:w-24 h-32 sm:h-24 shrink-0 rounded-xl border border-brand-blue/10" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-brand-blue group-hover:text-brand-blue-medium transition-colors line-clamp-1 leading-snug">
              {job.title}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm font-bold text-muted-foreground group-hover:text-brand-blue transition-colors mb-4">
            <span className="flex items-center gap-1.5"><Building className="w-4 h-4 opacity-50 text-brand-blue" /> {job.company}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-50 text-brand-blue" /> {job.location}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 opacity-50 text-brand-blue" /> {job.type}</span>
          </div>
          <div className="flex items-center gap-2">
            {isNew && <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-secondary text-muted-foreground">New</span>}
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
