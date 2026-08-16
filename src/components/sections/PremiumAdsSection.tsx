"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MessageCircle, Star, Crown, ArrowRight } from "lucide-react";
import { getFeaturedJobs, type JobPost, ApiError } from "@/lib/api";
import JobPosterImage from "@/components/common/JobPosterImage";

export default function PremiumAdsSection() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [premiumJobs, setPremiumJobs] = useState<JobPost[]>([]);

  const loadJobs = useCallback(async () => {
    try {
      setPremiumJobs(await getFeaturedJobs());
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching from the backend API on mount, not duplicated React state
    loadJobs();
  }, [loadJobs]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (premiumJobs.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [premiumJobs.length]);

  if (premiumJobs.length === 0) return null;

  return (
    <section className="pt-6 pb-10 md:pb-14 bg-gradient-to-b from-[#f0f4ff] via-white to-[#f0f4ff] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="container-site relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#DAA520] font-black uppercase tracking-[0.3em] text-[11px]">
              <div className="p-1.5 rounded-lg bg-[#DAA520]/10 border border-[#DAA520]/20">
                <Crown className="w-4 h-4" />
              </div>
              Verified Opportunities
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-brand-blue tracking-tight">Premium Job Ads</h2>
            <p className="text-muted-foreground font-medium max-w-xl text-lg">
              Priority placement for top-tier verified positions from global industry leaders.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => scroll("left")}
              className="w-14 h-14 rounded-2xl border border-border/60 bg-white text-brand-blue hover:bg-white hover:border-brand-blue/30 shadow-sm transition-all flex items-center justify-center active:scale-90"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-14 h-14 rounded-2xl border border-border/60 bg-white text-brand-blue hover:bg-white hover:border-brand-blue/30 shadow-sm transition-all flex items-center justify-center active:scale-90"
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
            {premiumJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                style={{ width: "min(calc(100vw - 4rem), 300px)" }}
                className="flex-shrink-0 @container group bg-white rounded-[32px] border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_40px_80px_-16px_rgba(30,58,138,0.2)] hover:border-brand-blue/30 transition-all duration-500 overflow-hidden sm:w-[calc(45%)] md:w-[calc(33.333%-1.25rem)] [@media(min-width:1366px)]:w-[calc(25%-1.25rem)] cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary/20">
                  <JobPosterImage image={job.image} title={job.title} company={job.company} className="w-full h-full" />

                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#DAA520] to-[#FFD700] py-2.5 px-6 flex justify-between items-center shadow-lg">
                    <span className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 fill-white" /> Premium Ad
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-start items-end">
                    <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-2 shadow-xl border border-white/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#DAA520] animate-pulse" />
                      <span className="text-[10px] font-black text-brand-blue uppercase">{job.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">{job.company}</span>
                  </div>

                  <Link href={`/jobs/${job.id}`} className="block mb-3">
                    <h3 className="text-base font-black text-brand-blue leading-tight line-clamp-2 transition-colors group-hover:text-brand-blue-medium">
                      {job.title}
                    </h3>
                  </Link>

                  <div className="pt-2 border-t border-brand-blue/10 flex items-center justify-end gap-1.5">
                    {job.contactWhatsapp && (
                      <a
                        href={`https://wa.me/${job.contactWhatsapp.replace(/[^\d+]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <Link
                      href={`/jobs/${job.id}`}
                      title="Apply"
                      className="p-1.5 rounded-md bg-brand-blue/5 text-brand-blue hover:bg-brand-blue hover:text-white transition-all"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
