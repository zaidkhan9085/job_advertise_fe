"use client";

import { useEffect, useState } from "react";
import { getJobs, getJobLocations, type JobLocation } from "@/lib/api";

export interface LocationCount {
  id: string;
  name: string;
  count: number;
}

// Every COUNTRY-level node (Saudi Arabia, UAE, ...) and every STATE-level
// node under India (the tree's one country whose direct children are
// states rather than the tree splitting country/state across another
// level) -- the same two granularities the homepage's "Browse by Country"
// tabs use, just flattened into one list instead of grouped.
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

// Shared by JobsOpeningNavPanel (desktop dropdown) and MobileNav's inline
// "Jobs Opening" section -- same live job-count-by-location data, just
// rendered in different wrapper markup per surface.
export function useJobsOpeningCounts(): LocationCount[] | null {
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

  return rows;
}
