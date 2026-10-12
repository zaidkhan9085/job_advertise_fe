"use client";

import { useRouter } from "next/navigation";
import { Building, MapPin, Briefcase, Star } from "lucide-react";
import type { JobPost } from "@/lib/api";
import JobPosterImage from "@/components/common/JobPosterImage";
import JobCardActions from "@/components/jobs/JobCardActions";
import { useIsRecent } from "@/hooks/useIsRecent";
import { jobPagePath } from "@/lib/jobShare";

// Shared between the /jobs listing and the job detail page's "Related
// Jobs" section (which used to be a much plainer thumbnail+text list with
// no Featured ribbon, no "New" badge, and no Apply/WhatsApp/Call actions --
// client asked for premium jobs to actually stand out there too, and for
// the section's UI generally to look as good as the rest of the site).
// Extracted rather than duplicated so both places automatically stay in
// sync with each other.
export default function JobCard({
  job,
  mode,
  hasApplied,
  onApplied,
}: {
  job: JobPost;
  mode: "grid" | "list";
  hasApplied: boolean;
  onApplied: () => void;
}) {
  const router = useRouter();
  const isNew = useIsRecent(job.createdAt);
  const goToJob = () => router.push(jobPagePath(job));

  if (mode === "grid") {
    return (
      <div
        onClick={goToJob}
        className={`group bg-white rounded-2xl border shadow-[0_4px_20px_rgb(16,152,240,0.04)] hover:shadow-[0_20px_40px_rgba(16,152,240,0.08)] transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer ${
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
            <span
              className={`absolute left-2.5 z-10 text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md bg-emerald-500 text-white shadow-md ${
                job.type === "FEATURED" ? "top-9" : "top-2.5"
              }`}
            >
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
          <div className="mt-auto pt-2 border-t border-brand-blue/10">
            <JobCardActions job={job} hasApplied={hasApplied} onApplied={onApplied} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={goToJob}
      className={`group bg-white rounded-2xl border p-4 sm:p-5 shadow-[0_4px_20px_rgb(16,152,240,0.04)] hover:shadow-[0_20px_40px_rgba(16,152,240,0.08)] transition-all duration-300 cursor-pointer ${
        job.type === "FEATURED"
          ? "border-[#DAA520]/40 hover:border-[#DAA520]/70 bg-amber-50/10"
          : "border-brand-blue/15 hover:border-brand-blue/40 hover:bg-brand-blue-muted/5"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        <div className="relative w-full sm:w-24 h-32 sm:h-24 shrink-0">
          <JobPosterImage image={job.image} title={job.title} company={job.company} className="w-full h-full rounded-xl border border-brand-blue/10" />
          {isNew && (
            <span className="absolute top-1.5 left-1.5 text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-emerald-500 text-white shadow-md">
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
        <div className="w-full sm:w-auto sm:border-l sm:border-brand-blue/10 sm:pl-6 shrink-0">
          <JobCardActions job={job} hasApplied={hasApplied} onApplied={onApplied} layout="list" />
        </div>
      </div>
    </div>
  );
}
