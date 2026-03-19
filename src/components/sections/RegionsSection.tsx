"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Globe2, Map } from "lucide-react";
import { nearbyRegions, vacancyCountries } from "@/data/regions";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

function SliderSection({ 
  title, 
  subtitle, 
  badge, 
  icon: TitleIcon,
  items, 
  type,
  paginationId
}: { 
  title: string; 
  subtitle: string; 
  badge: string;
  icon: any;
  items: any[];
  type: "nearby" | "country";
  paginationId: string;
}) {
  // Helper to chunk array for mobile 4-card slides (2x2 grid)
  const chunkedItems = [];
  for (let i = 0; i < items.length; i += 4) {
    chunkedItems.push(items.slice(i, i + 4));
  }

  return (
    <div className="mb-24 last:mb-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-16 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-brand-blue/40 uppercase tracking-[0.3em]">
            <TitleIcon className="w-4 h-4" />
            {badge}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-brand-blue tracking-tight">
            {title}
          </h2>
          <p className="text-muted-foreground font-medium max-w-xl text-lg">
            {subtitle}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className={`${paginationId}-prev w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl border border-border/60 bg-white text-brand-blue hover:bg-brand-blue-muted hover:border-brand-blue/30 shadow-sm transition-all flex items-center justify-center active:scale-90 z-10 cursor-pointer`}
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <button
            className={`${paginationId}-next w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl border border-border/60 bg-white text-brand-blue hover:bg-brand-blue-muted hover:border-brand-blue/30 shadow-sm transition-all flex items-center justify-center active:scale-90 z-10 cursor-pointer`}
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>

      {/* Mobile View: 4 cards per slide (2 cols x 2 rows) */}
      <div className="md:hidden">
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: `.${paginationId}-prev`,
            nextEl: `.${paginationId}-next`,
          }}
          spaceBetween={16}
          slidesPerView={1}
          className="pb-4"
        >
          {chunkedItems.map((chunk, slideIdx) => (
            <SwiperSlide key={slideIdx}>
              <div className="grid grid-cols-2 gap-4 px-1">
                {chunk.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="group bg-white rounded-2xl border border-brand-blue/10 p-4 text-center shadow-sm hover:shadow-md transition-all h-[150px] flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-brand-blue-muted/30 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                        {type === "nearby" && Icon ? (
                          <Icon className="w-6 h-6" />
                        ) : (
                          <span className="text-2xl">{item.flag}</span>
                        )}
                      </div>
                      <h3 className="text-[12px] font-bold text-brand-blue mb-1 leading-tight line-clamp-2 h-[32px]">
                        {item.label}
                      </h3>
                      <div className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                        {item.jobCount.toLocaleString()} Jobs
                      </div>
                    </Link>
                  );
                })}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop Slider View (md+) */}
      <div className="hidden md:block">
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: `.${paginationId}-prev`,
            nextEl: `.${paginationId}-next`,
          }}
          spaceBetween={24}
          breakpoints={{
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="pb-12"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SwiperSlide key={item.id}>
                <Link
                  href={item.href}
                  className="flex flex-col h-full group bg-white rounded-[32px] border border-brand-blue/15 p-8 text-center shadow-[0_4px_20px_rgb(30,58,138,0.04)] hover:shadow-[0_20px_40px_rgba(30,58,138,0.08)] hover:border-brand-blue/40 hover:bg-brand-blue-muted/5 transition-all duration-300"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-[24px] bg-brand-blue-muted/30 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-300 shadow-inner shrink-0 relative overflow-hidden">
                    {type === "nearby" && Icon ? (
                      <Icon className="w-10 h-10" />
                    ) : (
                      <span className="text-4xl filter drop-shadow-md">{item.flag}</span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-brand-blue mb-2 leading-tight group-hover:text-brand-blue-medium transition-colors line-clamp-1">
                    {item.label}
                  </h3>
                  <div className="mt-auto pt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 group-hover:bg-brand-blue/10 transition-colors">
                      <span className="w-1 h-1 rounded-full bg-brand-blue/30" />
                      <span className="text-[11px] font-black text-muted-foreground group-hover:text-brand-blue transition-colors uppercase tracking-widest">
                        {item.jobCount.toLocaleString()} Jobs
                      </span>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}

export default function RegionsSection() {
  return (
    <>
      <section className="pt-24 pb-16 bg-brand-blue-muted/10 relative overflow-hidden border-b border-brand-blue/5">
        <div className="container-site relative">
          <SliderSection 
            title="Jobs Near You" 
            subtitle="Discover specialized opportunities across all India states and global hubs."
            badge="Localized Search"
            icon={Map}
            items={nearbyRegions}
            type="nearby"
            paginationId="nearby-slider"
          />
        </div>
      </section>

      <section className="pt-16 pb-24 bg-gradient-to-b from-white via-[#f4f8ff] to-[#eef2ff] relative overflow-hidden">
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
            paginationId="country-slider"
          />
        </div>
      </section>
    </>
  );
}
