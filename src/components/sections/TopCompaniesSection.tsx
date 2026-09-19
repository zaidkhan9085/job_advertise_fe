"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { getFeaturedCompanies, resolveImageUrl, type FeaturedCompany, ApiError } from "@/lib/api";

// Purely admin-curated (see dashboard/admin/employers -- the "Top Hiring"
// star toggle): shows every company an admin has featured regardless of its
// current job count -- featuring a company is a deliberate, standing
// choice, so it never silently disappears just because it has no active
// jobs right now. An empty list just means no one is currently featured,
// and the section renders nothing rather than an empty block.
// Cards aren't links yet -- what a click should filter to (exact company vs
// a name-text search) is still an open decision, deferred on purpose.
//
// A single scrollable row with arrow buttons, not a wrapping grid -- same
// pattern as StoriesSection's "Live Highlights" row -- so a growing
// featured list never pushes the homepage taller, it just scrolls.
export default function TopCompaniesSection() {
  const [companies, setCompanies] = useState<FeaturedCompany[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const load = useCallback(async () => {
    try {
      setCompanies(await getFeaturedCompanies());
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
      setCompanies([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, companies]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
      setTimeout(checkScroll, 400);
    }
  };

  if (companies !== null && companies.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-white relative overflow-hidden">
      <div className="container-site relative">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-black text-brand-blue/40 uppercase tracking-[0.3em]">Trusted Recruiters</div>
            <h2 className="text-2xl md:text-3xl font-black text-brand-blue tracking-tight">Top Companies Hiring</h2>
            <p className="text-muted-foreground font-medium max-w-xl">
              Actively hiring recruiters and employers on thejobs4u right now.
            </p>
          </div>

          {companies && companies.length > 0 && (
            <div className="flex gap-2.5 shrink-0">
              <button
                onClick={() => scroll("left")}
                disabled={!showLeft}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  showLeft
                    ? "bg-white text-brand-blue border-border hover:bg-brand-blue-muted shadow-sm"
                    : "bg-transparent text-muted-foreground border-border/40 cursor-not-allowed opacity-50"
                }`}
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!showRight}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  showRight
                    ? "bg-white text-brand-blue border-border hover:bg-brand-blue-muted shadow-sm"
                    : "bg-transparent text-muted-foreground border-border/40 cursor-not-allowed opacity-50"
                }`}
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2"
        >
          {companies === null
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[150px] h-28 rounded-2xl bg-secondary/40 animate-pulse" />
              ))
            : companies.map((company) => (
                <div
                  key={company.id}
                  className="flex-shrink-0 w-[150px] flex flex-col items-center justify-center gap-2 px-3 py-5 rounded-2xl border border-brand-blue/10 bg-white hover:border-brand-blue/40 hover:shadow-[0_8px_24px_rgba(200,66,44,0.08)] transition-all text-center"
                >
                  {company.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImageUrl(company.logo)}
                      alt={company.name}
                      className="w-12 h-12 rounded-xl object-cover border border-border/60"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-brand-blue-muted/40 flex items-center justify-center text-brand-blue">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                  <span className="text-[13px] font-bold text-foreground leading-tight line-clamp-2" title={company.name}>
                    {company.name}
                  </span>
                  <span className="text-xs font-black text-brand-blue">
                    {company.jobCount} open position{company.jobCount === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
