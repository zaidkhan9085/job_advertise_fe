"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { slugify, buildMergedJobsUrl } from "@/lib/utils";
import { useJobsOpeningCounts } from "@/hooks/useJobsOpeningCounts";

// Replaces the old "Jobs Opening" nav dropdown -- a hand-maintained,
// alphabetically-grouped tree of countries with no real job counts.
// Highest-demand locations now surface first ("Saudi Arabia has 200 jobs,
// it should be on top"), which a static list could never reflect.
// Data logic lives in useJobsOpeningCounts -- shared with MobileNav's
// inline "Jobs Opening" section, which needs the same counts without this
// panel's absolute positioning.
export default function JobsOpeningNavPanel() {
  const rows = useJobsOpeningCounts();
  const searchParams = useSearchParams();

  return (
    <div className="absolute top-full left-0 pt-3 z-50">
      <div className="w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(16,152,240,0.15)] border border-border/40 p-2 animate-in fade-in-0 slide-in-from-top-2 duration-200 max-h-[min(70vh,480px)] overflow-y-auto custom-scrollbar">
        {rows === null ? (
          <div className="flex flex-col gap-1 p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">No open positions yet.</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {rows.map((row) => (
              <Link
                key={row.id}
                href={buildMergedJobsUrl(searchParams, "location", slugify(row.name))}
                className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm text-foreground/80 hover:text-brand-blue hover:bg-brand-blue-muted transition-all"
              >
                <span className="truncate">{row.name}</span>
                <span className="shrink-0 text-xs font-black text-brand-blue tabular-nums">{row.count}</span>
              </Link>
            ))}
          </div>
        )}
        <Link
          href="/jobs"
          className="block mt-1 px-4 py-2.5 rounded-xl text-sm font-bold text-brand-blue hover:bg-brand-blue-muted transition-all text-center border-t border-border/40 pt-3"
        >
          View all jobs
        </Link>
      </div>
    </div>
  );
}
