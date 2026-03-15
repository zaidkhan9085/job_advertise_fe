"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Globe2, Map } from "lucide-react";
import { nearbyRegions, vacancyCountries } from "@/data/regions";

function SliderSection({ 
  title, 
  subtitle, 
  badge, 
  icon: TitleIcon,
  items, 
  type 
}: { 
  title: string; 
  subtitle: string; 
  badge: string;
  icon: any;
  items: any[];
  type: "nearby" | "country";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="mb-24 last:mb-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-brand-blue/40 uppercase tracking-[0.3em]">
            <TitleIcon className="w-4 h-4" />
            {badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-brand-blue tracking-tight">
            {title}
          </h2>
          <p className="text-muted-foreground font-medium max-w-xl text-lg">
            {subtitle}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => scroll("left")}
            className="w-14 h-14 rounded-2xl border border-border/60 bg-white text-brand-blue hover:bg-brand-blue-muted hover:border-brand-blue/30 shadow-sm transition-all flex items-center justify-center active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-14 h-14 rounded-2xl border border-border/60 bg-white text-brand-blue hover:bg-brand-blue-muted hover:border-brand-blue/30 shadow-sm transition-all flex items-center justify-center active:scale-90"
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
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex-shrink-0 w-[240px] group bg-white rounded-[32px] border border-brand-blue/15 p-8 text-center shadow-[0_4px_20px_rgb(30,58,138,0.04)] hover:shadow-[0_20px_40px_rgba(30,58,138,0.08)] hover:border-brand-blue/40 hover:bg-brand-blue-muted/5 transition-all duration-300"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-[24px] bg-brand-blue-muted/30 flex items-center justify-center relative overflow-hidden group-hover:bg-brand-blue transition-all duration-300 shadow-inner">
                  {type === "nearby" && Icon ? (
                    <Icon className="w-10 h-10 text-brand-blue group-hover:text-white transition-colors duration-300" />
                  ) : (
                    <span className="text-4xl filter group-hover:brightness-110 transition-all duration-300 drop-shadow-md">
                      {item.flag}
                    </span>
                  )}
                </div>
                
                <h3 className="text-base font-black text-brand-blue mb-2 leading-tight group-hover:text-brand-blue-medium transition-colors line-clamp-1">
                  {item.label}
                </h3>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 group-hover:bg-brand-blue/10 transition-colors">
                  <span className="w-1 h-1 rounded-full bg-brand-blue/30" />
                  <span className="text-[10px] font-black text-muted-foreground group-hover:text-brand-blue transition-colors uppercase tracking-widest">
                    {item.jobCount.toLocaleString()} Jobs
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function RegionsSection() {
  return (
    <>
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container-site relative">
          <SliderSection 
            title="Jobs Near You" 
            subtitle="Discover specialized opportunities across key Indian regions and global hubs."
            badge="Localized Search"
            icon={Map}
            items={nearbyRegions}
            type="nearby"
          />
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-white via-[#f4f8ff] to-[#eef2ff] relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
        
        <div className="container-site relative">
          <SliderSection 
            title="Browse by Country" 
            subtitle="Explore prominent career destinations across the Gulf, Asia, and Europe."
            badge="Global Reach"
            icon={Globe2}
            items={vacancyCountries}
            type="country"
          />
        </div>
      </section>
    </>
  );
}
