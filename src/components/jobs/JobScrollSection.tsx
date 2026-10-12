"use client";

import { useRef, useCallback, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { JobPost } from "@/lib/api";
import JobCard from "@/components/jobs/JobCard";

// Shared by the job detail page's "Related Jobs" and "Premium Jobs"
// sections -- a single horizontally-scrollable row with left/right arrow
// buttons, same interaction pattern as the homepage's own carousels
// (PremiumAdsSection/StoriesSection/TopCompaniesSection), instead of a
// multi-row grid. Each card gets a fixed width wrapper since JobCard's own
// "grid" mode otherwise expects to fill a grid cell, not a flex row.
export default function JobScrollSection({
  title,
  titleIcon,
  jobs,
  appliedIds,
  onApplied,
  accentBorderClass = "border-border/60",
}: {
  title: string;
  titleIcon?: ReactNode;
  jobs: JobPost[];
  appliedIds: Set<string>;
  onApplied: (id: string) => void;
  accentBorderClass?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    scrollRef.current.scrollBy({ left: direction === "left" ? -clientWidth : clientWidth, behavior: "smooth" });
  }, []);

  if (jobs.length === 0) return null;

  return (
    <div className={`mt-8 bg-white p-6 sm:p-8 rounded-2xl shadow-[var(--shadow-card)] border ${accentBorderClass}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          {titleIcon}
          {title}
        </h3>
        {jobs.length > 1 && (
          <div className="hidden sm:flex gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full border border-border/60 bg-white text-brand-blue hover:bg-secondary/60 transition-all flex items-center justify-center active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full border border-border/60 bg-white text-brand-blue hover:bg-secondary/60 transition-all flex items-center justify-center active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div ref={scrollRef} className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2">
        {jobs.map((job) => (
          <div key={job.id} className="shrink-0 w-[250px] sm:w-[270px]">
            <JobCard job={job} mode="grid" hasApplied={appliedIds.has(job.id)} onApplied={() => onApplied(job.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
