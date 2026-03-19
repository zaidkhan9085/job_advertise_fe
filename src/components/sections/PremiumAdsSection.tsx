"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, Phone, Eye, Heart, Star, Crown } from "lucide-react";
import { featuredJobs } from "@/data/jobs";

export default function PremiumAdsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [curIndex, setCurIndex] = useState(0);
  const premiumJobs = featuredJobs.filter(job => job.badges.includes("Premium"));

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      // Breakpoint at 1366px (custom)
      const isLarge = window.innerWidth >= 1366;
      const cardWidth = isLarge ? clientWidth / 4 : clientWidth / 3;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, []);

  // Normal Autoplay (Jump-by-set behavior)
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Auto-scroll by one screen width
          scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 5000); // Slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-8 pb-24 bg-gradient-to-b from-[#f0f4ff] via-white to-[#f0f4ff] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container-site relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
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
            {premiumJobs.map((job, idx) => (
              <div
                key={`${job.id}-${idx}`}
                style={{ 
                  width: 'min(calc(100vw - 4rem), 300px)', // Mobile default
                }}
                className="flex-shrink-0 @container group bg-white rounded-[32px] border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_40px_80px_-16px_rgba(30,58,138,0.2)] hover:border-brand-blue/30 transition-all duration-500 overflow-hidden sm:w-[calc(45%)] md:w-[calc(33.333%-1.25rem)] [@media(min-width:1366px)]:w-[calc(25%-1.25rem)]"
              >
                {/* Image Area */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={job.image || "https://placehold.co/800x500/1e3a8a/ffffff?text=Premium+Ad"}
                    alt={job.title}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#DAA520] to-[#FFD700] py-2.5 px-6 flex justify-between items-center shadow-lg">
                    <span className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 fill-white" /> Premium Ad
                    </span>
                    <Heart className="w-4 h-4 text-white/90 hover:text-white transition-colors cursor-pointer" />
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-2 shadow-xl border border-white/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#DAA520] animate-pulse" />
                      <span className="text-[10px] font-black text-brand-blue uppercase">{job.location}</span>
                    </div>
                    <div className="bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-white/90 border border-white/10">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black">{job.count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{job.type}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-[10px] font-black text-[#DAA520] uppercase tracking-widest">Featured Opportunity</span>
                  </div>
                  
                  <Link href={`/jobs/${job.id}`} className="block mb-8 min-h-[56px]">
                    <h3 className="text-xl font-black text-brand-blue leading-tight line-clamp-2 transition-colors group-hover:text-brand-blue-medium">
                      {job.title}
                    </h3>
                  </Link>

                  <div className="grid grid-cols-2 gap-4">
                    <a
                      href={job.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#25D366] text-white hover:bg-[#128C7E] transition-all text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      <MessageCircle className="w-5 h-5 flex-shrink-0" /> WhatsApp
                    </a>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-blue text-white hover:bg-brand-blue-medium transition-all text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      <Phone className="w-4 h-4 flex-shrink-0" /> Call Now
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
