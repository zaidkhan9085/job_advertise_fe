"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getIndustries, type Industry } from "@/lib/api";

// Fetches the real Industry list once per mount (not on every open — the
// nav is remounted rarely, and this avoids a network round-trip flashing
// an empty panel each time a recruiter re-hovers "Industry"). Previously
// this dropdown used a hand-maintained list of 17 industries with made-up
// slugs ("?industry=oil-gas") that never matched a real Industry id, so
// every link here silently filtered to zero jobs -- same live source as
// the homepage's "Browse by Industry" section now, so the two can never
// drift apart again, and links actually work.
export default function IndustryNavPanel() {
  const [industries, setIndustries] = useState<Industry[] | null>(null);

  useEffect(() => {
    getIndustries()
      .then(setIndustries)
      .catch(() => setIndustries([]));
  }, []);

  return (
    <div className="absolute top-full left-0 pt-3 z-50">
      <div className="w-[860px] max-w-[92vw] bg-white rounded-2xl shadow-[0_20px_50px_rgba(200,66,44,0.15)] border border-border/40 p-3 animate-in fade-in-0 slide-in-from-top-2 duration-200 max-h-[min(70vh,520px)] overflow-y-auto custom-scrollbar">
        {industries === null ? (
          <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 p-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-1">
            {industries.map((industry) => (
              <Link
                key={industry.id}
                href={`/jobs?industry=${industry.id}`}
                title={industry.name}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] leading-tight text-foreground/80 hover:text-brand-blue hover:bg-brand-blue-muted transition-all"
              >
                <span className="w-1 h-1 rounded-full bg-brand-blue/30 shrink-0" />
                <span className="truncate">{industry.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
