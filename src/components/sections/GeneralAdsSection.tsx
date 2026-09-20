"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getNormalJobs, type JobPost, ApiError } from "@/lib/api";
import JobPosterImage from "@/components/common/JobPosterImage";
import { useIsRecent } from "@/hooks/useIsRecent";
import { useAppliedJobs } from "@/hooks/useAppliedJobs";
import JobCardActions from "@/components/jobs/JobCardActions";

function GeneralAdCard({ job, hasApplied, onApplied }: { job: JobPost; hasApplied: boolean; onApplied: () => void }) {
  const router = useRouter();
  const isNew = useIsRecent(job.createdAt);

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="group h-full flex flex-col bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary/30">
        <JobPosterImage image={job.image} title={job.title} company={job.company} className="w-full h-full" />

        {isNew && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500 text-white shadow-sm">
              New
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-foreground text-[13px] leading-snug group-hover:text-brand-blue transition-colors line-clamp-1 mb-1">
          {job.title}
        </h3>
        <div className="flex items-center gap-1 mb-2 text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="text-[11px] font-medium truncate">{job.location}</span>
        </div>

        <div className="mt-auto">
          <JobCardActions job={job} hasApplied={hasApplied} onApplied={onApplied} />
        </div>
      </div>
    </div>
  );
}

export default function GeneralAdsSection() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const { appliedIds, markApplied } = useAppliedJobs();

  const loadJobs = useCallback(async () => {
    try {
      setJobs(await getNormalJobs());
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching from the backend API on mount, not duplicated React state
    loadJobs();
  }, [loadJobs]);

  if (jobs.length === 0) return null;

  return (
    <section className="py-8 md:py-10 bg-brand-blue-muted/10">
      <div className="container-site">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              General Ads & Opportunities
            </h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              Quickly browse and connect with employers for the latest job openings across various industries.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:underline whitespace-nowrap"
          >
            Explore all ads
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jobs.slice(0, 8).map((job) => (
            <GeneralAdCard
              key={job.id}
              job={job}
              hasApplied={appliedIds.has(job.id)}
              onApplied={() => markApplied(job.id)}
            />
          ))}
        </div>

        {jobs.length > 8 && (
          <div className="mt-12 text-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-white text-brand-blue border border-brand-blue/20 hover:bg-brand-blue-muted px-8 py-3.5 rounded-2xl transition-all font-bold shadow-sm"
            >
              View All Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
