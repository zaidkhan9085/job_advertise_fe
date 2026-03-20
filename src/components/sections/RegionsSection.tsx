"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Globe2, Map } from "lucide-react";
import { nearbyRegions, vacancyCountries } from "@/data/regions";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

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
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Helper to chunk array for mobile 4-card slides (2x2 grid)
  const chunkedItems = [];
  for (let i = 0; i < items.length; i += 4) {
    chunkedItems.push(items.slice(i, i + 4));
  }

  if (!isMounted) return null;

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

      {/* Conditional Rendering based on viewport to avoid navigation conflicts */}
      {isMobile ? (
        /* Mobile View: 4 cards per slide (2 cols x 2 rows) */
        <div className="md:hidden">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{
              prevEl: `.${paginationId}-prev`,
              nextEl: `.${paginationId}-next`,
            }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={true}
            spaceBetween={16}
            slidesPerView={1}
            observer={true}
            observeParents={true}
            watchOverflow={false}
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
      ) : (
        /* Desktop Slider View (md+) */
        <div className="hidden md:block">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{
              prevEl: `.${paginationId}-prev`,
              nextEl: `.${paginationId}-next`,
            }}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={true}
            spaceBetween={24}
            observer={true}
            observeParents={true}
            watchOverflow={false}
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
                    className="group block bg-white rounded-[2rem] border border-brand-blue/10 p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden h-[240px] flex flex-col items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand-blue-muted/50 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 transform group-hover:rotate-6 shadow-sm relative z-10">
                      {type === "nearby" && Icon ? (
                        <Icon className="w-8 h-8" />
                      ) : (
                        <span className="text-4xl">{item.flag}</span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-black text-brand-blue mb-2 group-hover:text-brand-blue-medium transition-colors relative z-10 line-clamp-1">
                      {item.label}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground relative z-10">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {item.jobCount.toLocaleString()} Positions
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}
    </div>
  );
}

export default function RegionsSection() {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      <div className="container-site relative">
        <SliderSection 
          title="Jobs Near You"
          subtitle="Discover immediate openings in major employment hubs across India."
          badge="Local Opportunities"
          icon={Map}
          items={nearbyRegions}
          type="nearby"
          paginationId="nearby"
        />

        <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-blue/10 to-transparent my-24" />

        <SliderSection 
          title="Browse by Country"
          subtitle="Explore trending international careers in top global destinations."
          badge="Global Reach"
          icon={Globe2}
          items={vacancyCountries}
          type="country"
          paginationId="country"
        />

        <div className="mt-12 text-center">
          <Link
            href="/jobs"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-brand-blue text-white rounded-2xl font-black hover:bg-brand-blue-medium transition-all shadow-lg hover:shadow-brand-blue/25 hover:-translate-y-1"
          >
            Explore All 15,000+ Active Jobs
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
