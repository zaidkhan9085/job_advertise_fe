"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { industries } from "@/data/industries";

export default function IndustrySection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, []);

  return (
    <section className="py-24 bg-gradient-to-r from-white via-[#f0f7ff] to-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="container-site relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-3">
            <div className="text-xs font-black text-brand-blue/40 uppercase tracking-[0.3em]">
              Browse by Sector
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-blue tracking-tight">
              Explore by Industry
            </h2>
            <p className="text-muted-foreground font-medium max-w-xl text-lg">
              Find your next career move in specialized sectors with verified global opportunities.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => scroll("left")}
              className="w-14 h-14 rounded-2xl border border-border/60 bg-white text-brand-blue hover:bg-brand-blue-muted hover:border-brand-blue/30 shadow-sm transition-all flex items-center justify-center active:scale-90"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-14 h-14 rounded-2xl border border-border/60 bg-white text-brand-blue hover:bg-brand-blue-muted hover:border-brand-blue/30 shadow-sm transition-all flex items-center justify-center active:scale-90"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-12 px-1"
          >
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <Link
                  key={industry.id}
                  href={industry.href}
                  className="flex-shrink-0 w-[260px] group bg-white rounded-[32px] border border-brand-blue/15 p-8 text-center shadow-[0_4px_20px_rgb(30,58,138,0.04)] hover:shadow-[0_20px_40px_rgba(30,58,138,0.08)] hover:border-brand-blue/40 hover:bg-brand-blue-muted/5 transition-all duration-300"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-[24px] bg-brand-blue-muted/30 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-300 shadow-inner">
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-base font-black text-brand-blue mb-2 leading-tight group-hover:text-brand-blue-medium transition-colors line-clamp-2 min-h-[40px]">
                    {industry.label}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 group-hover:bg-brand-blue/10 transition-colors">
                    <span className="w-1 h-1 rounded-full bg-brand-blue/30" />
                    <span className="text-[11px] font-black text-muted-foreground group-hover:text-brand-blue transition-colors uppercase tracking-widest">
                      {industry.jobCount.toLocaleString()} Jobs
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-3 text-sm font-black text-brand-blue hover:text-brand-blue-medium px-8 py-4 rounded-2xl bg-brand-blue-muted/50 hover:bg-brand-blue-muted transition-all active:scale-95"
          >
            Browse All Industries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
