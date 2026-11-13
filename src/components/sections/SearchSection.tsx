"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Briefcase, Users, Globe2 } from "lucide-react";
import { buttonClass } from "@/lib/ui";
import DecorativeBlur from "@/components/common/DecorativeBlur";
import { getPlatformStats, type PlatformStats, ApiError } from "@/lib/api";

// Quick, non-interactive trust signals under the search bar -- just enough
// to back up "Find Verified Jobs Faster" with a number, not a link anywhere
// (the real stats block further down the page, Trusted by Thousands, is
// still the one place these get a live count).
const TRUST_POINTS = [
  { icon: Briefcase, label: "Verified employers only" },
  { icon: Users, label: "1,900+ candidates placed" },
  { icon: Globe2, label: "India, Gulf & worldwide" },
];

export default function SearchSection() {
  const router = useRouter();
  const [term, setTerm] = useState("");
  // Real, live count -- not marketing copy -- same getPlatformStats() the
  // "Trusted by Thousands" stats block further down the page already uses.
  // null while loading (and if the request fails) so the badge simply
  // doesn't render rather than flashing a wrong/zero count first.
  const [stats, setStats] = useState<PlatformStats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getPlatformStats());
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching from the backend API on mount, not duplicated React state
    loadStats();
  }, [loadStats]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    // Same bg-hero-gradient + floating white card treatment already proven
    // on /jobs and /pricing -- the homepage's own hero was the one place on
    // the site still a flat white strip, inconsistent with everywhere else
    // and a weak first impression for a brand-new coat of paint.
    <section className="relative">
      <div className="bg-hero-gradient text-white pt-16 pb-24 md:pt-20 md:pb-28 relative overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 right-0 bg-brand-blue-light/20 -translate-y-1/3 translate-x-1/4" />
        <DecorativeBlur size="xl" blur="strong" className="bottom-0 left-0 bg-white/10 translate-y-1/3 -translate-x-1/4" />
        <div className="container-site relative text-center">
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-3 max-w-3xl mx-auto">
            Find Verified India, Gulf &amp; Overseas Jobs Faster
          </h1>
          <p className="text-white/70 font-medium text-lg max-w-xl mx-auto">
            Search live openings from real employers.
          </p>

          {/* Real, live job count -- a standout pill, not just another
              trust-point bullet, since this is the number the homepage is
              meant to lead with. Guarded on activeJobs > 0 so a stats-load
              failure or a genuinely zero count (shouldn't happen in
              practice) never renders a hollow "0 Live Jobs". */}
          {stats !== null && stats.activeJobs > 0 && (
            <div className="flex justify-center mt-5">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-sm">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                {stats.activeJobs.toLocaleString()} Live Job{stats.activeJobs === 1 ? "" : "s"} Right Now
              </div>
            </div>
          )}

          {/* Moved here from under the search bar -- it used to land in the
              white area below the gradient instead of actually sitting in
              the blue section, and pulling it up here (plus trimming the
              gradient's own padding above) is what brings Live Highlights
              up too, with no changes needed there. */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-3">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
                <Icon className="w-4 h-4 text-white/60 shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-site relative -mt-8 md:-mt-10 z-10">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl border border-border/60 p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-3">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                type="text"
                placeholder="Job title, e.g. Electrician, Safety Officer"
                className="w-full h-10 sm:h-11 border-none outline-none bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button type="submit" className={buttonClass({ variant: "primary", size: "hero" }, "h-10 sm:h-11 shrink-0")}>
              Search Jobs
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
