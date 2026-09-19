"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getJobs, getJobLocations, type JobLocation } from "@/lib/api";
import { slugify } from "@/lib/utils";

interface LocationCount {
  id: string;
  name: string;
  count: number;
}

// Every COUNTRY-level node (Saudi Arabia, UAE, ...) and every STATE-level
// node under India (the tree's one country whose direct children are
// states rather than the tree splitting country/state across another
// level) -- the same two granularities the homepage's "Browse by Country"
// tabs use, just flattened into one list instead of grouped, per Zaid's
// choice over keeping the region-tab structure.
function collectCountableNodes(nodes: JobLocation[]): JobLocation[] {
  const out: JobLocation[] = [];
  for (const node of nodes) {
    if (node.locationType === "COUNTRY" || node.locationType === "STATE") out.push(node);
    // getJobLocations() only returns two levels (top-level + their direct
    // children) -- a grandchild's own `.children` was never fetched, so
    // this guards against recursing into `undefined` there rather than
    // assuming every node in the tree carries the same shape.
    if (node.children?.length > 0) out.push(...collectCountableNodes(node.children));
  }
  return out;
}

const MAX_SHOWN = 25;

// Replaces the old "Jobs Opening" nav dropdown -- a hand-maintained,
// alphabetically-grouped tree of countries with no real job counts.
// Highest-demand locations now surface first ("Saudi Arabia has 200 jobs,
// it should be on top"), which a static list could never reflect.
export default function JobsOpeningNavPanel() {
  const [rows, setRows] = useState<LocationCount[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [jobs, tree] = await Promise.all([getJobs(), getJobLocations()]);
        const countByAncestorId = new Map<string, number>();
        const bump = (id: string | null) => {
          if (!id) return;
          countByAncestorId.set(id, (countByAncestorId.get(id) ?? 0) + 1);
        };
        for (const job of jobs) {
          bump(job.jobLocationCountryId);
          bump(job.jobLocationStateId);
        }

        const nodes = collectCountableNodes(tree);
        const withCounts = nodes
          .map((n) => ({ id: n.id, name: n.name, count: countByAncestorId.get(n.id) ?? 0 }))
          .filter((n) => n.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, MAX_SHOWN);
        setRows(withCounts);
      } catch {
        setRows([]);
      }
    })();
  }, []);

  return (
    <div className="absolute top-full left-0 pt-3 z-50">
      <div className="w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(200,66,44,0.15)] border border-border/40 p-2 animate-in fade-in-0 slide-in-from-top-2 duration-200 max-h-[min(70vh,480px)] overflow-y-auto custom-scrollbar">
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
                href={`/jobs?location=${slugify(row.name)}`}
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
