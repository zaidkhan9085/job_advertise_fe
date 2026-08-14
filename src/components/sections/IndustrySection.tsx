"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Fuel, Zap, Droplets, Building2, Factory, Wrench, Stethoscope, Monitor,
  Ship, Banknote, Users2, Truck, ShoppingBag, Compass, HardHat, GraduationCap,
  MoreHorizontal, type LucideIcon,
} from "lucide-react";
import { getIndustries, getJobs, type Industry, ApiError } from "@/lib/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

// Same 17 sectors seeded into the real Industry table (backend/prisma/seed.js)
// — matched by name, not id, since the icon is purely decorative and this
// list only exists to avoid a generic icon for every card.
const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  "Oil & Gas, Petrochemical & Refinery": Fuel,
  "Power Plant, Substation, Energy & Gas Turbine": Zap,
  "Water Treatment Plant (WTP), RO & STP": Droplets,
  "Building Construction, Infrastructure & EPC Projects": Building2,
  "Manufacturing & Production": Factory,
  "Facility Management & MEP": Wrench,
  "Healthcare & Hospitality": Stethoscope,
  "IT, Hardware, Software & Telecom": Monitor,
  "Marine, Maritime, Aviation & Offshore": Ship,
  "Banking, Finance & Non-IT Services": Banknote,
  "HR, Admin, Back Office & BPO / Telecaller": Users2,
  "Logistics, Transportation, Shipping & Supply Chain": Truck,
  "FMCG (Fast-Moving Consumer Goods)": ShoppingBag,
  "Design, Drafting, Engineering & Consultancy": Compass,
  "Heavy Industries, Steel, Cement & Mining": HardHat,
  "Education, Training & Skill Development": GraduationCap,
  "Other Industries": MoreHorizontal,
};

interface IndustryCard extends Industry {
  jobCount: number;
}

export default function IndustrySection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [cards, setCards] = useState<IndustryCard[]>([]);

  const load = useCallback(async () => {
    try {
      const [industries, jobs] = await Promise.all([getIndustries(), getJobs()]);
      const counts = new Map<string, number>();
      jobs.forEach((job) => {
        if (job.industryId) counts.set(job.industryId, (counts.get(job.industryId) || 0) + 1);
      });
      setCards(
        industries
          .map((ind) => ({ ...ind, jobCount: counts.get(ind.id) || 0 }))
          .sort((a, b) => b.jobCount - a.jobCount)
      );
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    load();
    const checkViewport = () => setIsMobile(window.innerWidth < 768);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, [load]);

  const chunkedCards: IndustryCard[][] = [];
  for (let i = 0; i < cards.length; i += 4) chunkedCards.push(cards.slice(i, i + 4));

  if (!isMounted || cards.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-gradient-to-r from-white via-[#f0f7ff] to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="container-site relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-black text-brand-blue/40 uppercase tracking-[0.3em]">Browse by Sector</div>
            <h2 className="text-2xl md:text-3xl font-black text-brand-blue tracking-tight">Explore by Industry</h2>
            <p className="text-muted-foreground font-medium max-w-xl">
              Find your next career move in specialized sectors with verified global opportunities.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="industry-prev-btn w-11 h-11 lg:w-12 lg:h-12 rounded-xl border border-border/60 bg-white text-brand-blue hover:bg-brand-blue-muted hover:border-brand-blue/30 shadow-sm transition-all flex items-center justify-center active:scale-90 z-10 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="industry-next-btn w-11 h-11 lg:w-12 lg:h-12 rounded-xl border border-border/60 bg-white text-brand-blue hover:bg-brand-blue-muted hover:border-brand-blue/30 shadow-sm transition-all flex items-center justify-center active:scale-90 z-10 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isMobile ? (
          <div className="md:hidden">
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation={{ prevEl: ".industry-prev-btn", nextEl: ".industry-next-btn" }}
              autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
              loop={true}
              spaceBetween={16}
              slidesPerView={1}
              observer={true}
              observeParents={true}
              watchOverflow={false}
              className="pb-4"
            >
              {chunkedCards.map((chunk, slideIdx) => (
                <SwiperSlide key={slideIdx}>
                  <div className="grid grid-cols-2 gap-4 px-1">
                    {chunk.map((industry) => {
                      const Icon = INDUSTRY_ICONS[industry.name] || MoreHorizontal;
                      return (
                        <Link
                          key={industry.id}
                          href={`/jobs?industry=${industry.id}`}
                          className="group bg-white rounded-2xl border border-brand-blue/10 p-4 text-center shadow-sm hover:shadow-md transition-all h-[150px] flex flex-col items-center justify-center"
                        >
                          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-brand-blue-muted/30 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                            <Icon className="w-6 h-6" />
                          </div>
                          <h3 className="text-[12px] font-bold text-brand-blue mb-1 leading-tight line-clamp-2 h-[32px]">
                            {industry.name}
                          </h3>
                          <div className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                            {industry.jobCount.toLocaleString()} Jobs
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
          <div className="hidden md:block">
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation={{ prevEl: ".industry-prev-btn", nextEl: ".industry-next-btn" }}
              autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              loop={true}
              spaceBetween={24}
              observer={true}
              observeParents={true}
              watchOverflow={false}
              breakpoints={{ 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 }, 1280: { slidesPerView: 5 } }}
              className="pb-10"
            >
              {cards.map((industry) => {
                const Icon = INDUSTRY_ICONS[industry.name] || MoreHorizontal;
                return (
                  <SwiperSlide key={industry.id}>
                    <Link
                      href={`/jobs?industry=${industry.id}`}
                      className="group block bg-white rounded-[2rem] border border-brand-blue/10 p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden h-[210px] flex flex-col items-center justify-center"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-brand-blue-muted/50 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 transform group-hover:rotate-6 shadow-sm relative z-10">
                        <Icon className="w-7 h-7" />
                      </div>

                      <h3 className="text-lg font-black text-brand-blue mb-2 group-hover:text-brand-blue-medium transition-colors relative z-10 line-clamp-2">
                        {industry.name}
                      </h3>

                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground relative z-10">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {industry.jobCount.toLocaleString()} {industry.jobCount === 1 ? "Position" : "Positions"}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-brand-blue font-black hover:gap-4 transition-all group">
            View all {cards.length} industries
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
