"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight, ChevronRight,
  Fuel, Zap, Droplets, Building2, Factory, Wrench, Stethoscope, Monitor,
  Ship, Banknote, Users2, Truck, ShoppingBag, Compass, HardHat, GraduationCap,
  Hotel, Plane, Headphones, TrendingUp, ShoppingCart, Home, Megaphone, Scale,
  Landmark, Shield, Car,
  MoreHorizontal, type LucideIcon,
} from "lucide-react";
import { getIndustries, getJobs, type Industry, ApiError } from "@/lib/api";
import DecorativeBlur from "@/components/common/DecorativeBlur";

// Same 28 sectors seeded into the real Industry table (backend/prisma/seed.js)
// — matched by name, not id, since the icon is purely decorative and this
// list only exists to avoid a generic icon for every card. A name that
// doesn't match (e.g. an admin-added category) just falls back to
// MoreHorizontal below, not an error.
const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  "Oil & Gas, Petrochemical & Refinery": Fuel,
  "Power, Energy & Utilities": Zap,
  "Water & Wastewater Treatment": Droplets,
  "Construction, Infrastructure & EPC Projects": Building2,
  "Manufacturing & Industrial Production": Factory,
  "Facility Management, MEP & Maintenance": Wrench,
  "Healthcare & Medical Services": Stethoscope,
  "Hospitality, Travel & Tourism": Hotel,
  "IT, Software, Hardware & Telecom": Monitor,
  "Marine & Shipping Services": Ship,
  "Aviation & Airport Services": Plane,
  "Banking, Financial Services & Insurance": Banknote,
  "HR & Administration": Users2,
  "Customer Support, BPO & Telecalling": Headphones,
  "Logistics, Transportation & Supply Chain": Truck,
  "Automotive & Transport Equipment": Car,
  "FMCG & Consumer Goods": ShoppingBag,
  "Retail & E-commerce": ShoppingCart,
  "Engineering, Design & Technical Consultancy": Compass,
  "Heavy Industries, Steel, Cement & Mining": HardHat,
  "Education, Training & Skill Development": GraduationCap,
  "Sales, Marketing & Business Development": TrendingUp,
  "Media, Advertising & Creative Services": Megaphone,
  "Legal & Compliance Services": Scale,
  "Real Estate & Property Services": Home,
  "Government & Public Sector": Landmark,
  "Security & Safety Services": Shield,
  "Other Industries": MoreHorizontal,
};

interface IndustryCard extends Industry {
  jobCount: number;
}

// Compact rows, not a carousel or square tiles -- with 28 real sectors, a
// slideshow (3-5 visible at a time) meant seeing the rest required
// repeatedly clicking the arrow button, and square cards left long sector
// names cramped and truncated. A row (name on the left, count on the
// right) fits far more per screen and gives long names room to breathe --
// same layout convention as the homepage's own "Browse by Country" rows
// just below this section, sorted by job count so the highest-demand
// sectors lead (same convention as the header's Location nav panel too).
export default function IndustrySection() {
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
    load();
  }, [load]);

  if (cards.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-gradient-to-r from-white via-[#fff2ef] to-white relative overflow-hidden">
      <DecorativeBlur size="3xl" blur="strong" className="top-0 left-0 bg-brand-blue/5 -translate-x-1/2 -translate-y-1/2" />

      <div className="container-site relative">
        <div className="mb-8 space-y-2">
          <div className="text-xs font-black text-brand-blue/40 uppercase tracking-[0.3em]">Browse by Sector</div>
          <h2 className="text-2xl md:text-3xl font-black text-brand-blue tracking-tight">Explore by Industry</h2>
          <p className="text-muted-foreground font-medium max-w-xl">
            Find your next career move in specialized sectors with verified global opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {cards.map((industry) => {
            const Icon = INDUSTRY_ICONS[industry.name] || MoreHorizontal;
            return (
              <Link
                key={industry.id}
                href={`/jobs?industry=${industry.id}`}
                className="group flex items-center justify-between gap-3 pl-3 pr-4 py-2.5 rounded-xl border border-brand-blue/10 bg-white hover:border-brand-blue/40 hover:bg-brand-blue-muted/10 transition-all"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-brand-blue-muted/40 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-300 shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-[13px] font-bold text-foreground leading-tight truncate" title={industry.name}>
                    {industry.name}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-sm font-black text-brand-blue tabular-nums">{industry.jobCount}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-brand-blue font-black hover:gap-4 transition-all group">
            Browse all jobs
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
