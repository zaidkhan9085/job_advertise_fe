"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight, Plus, Search, X,
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

// Cycled by position (after sorting by job count) to give each tile its own
// icon-badge color instead of one uniform tint -- purely decorative, same
// "no error on an unmatched name" spirit as INDUSTRY_ICONS above.
const TILE_TINTS = [
  { bg: "#FDECE4", fg: "#D97706" },
  { bg: "#EAF2FF", fg: "#2563EB" },
  { bg: "#EAF7EF", fg: "#16A34A" },
  { bg: "#F3EEFF", fg: "#7C3AED" },
  { bg: "#FFF1F5", fg: "#DB2777" },
  { bg: "#EAF6F6", fg: "#0D9488" },
  { bg: "#FEF3E2", fg: "#B45309" },
  { bg: "#EFF6FF", fg: "#0284C7" },
];

interface IndustryCard extends Industry {
  jobCount: number;
}

// The colorful "Concept A" tile, shared between the always-visible top row
// and the "show all" modal -- identical markup either way.
function IndustryTile({ industry, tintIndex }: { industry: IndustryCard; tintIndex: number }) {
  const Icon = INDUSTRY_ICONS[industry.name] || MoreHorizontal;
  const tint = TILE_TINTS[tintIndex % TILE_TINTS.length];
  return (
    <Link
      href={`/jobs?industry=${industry.id}`}
      className="group flex flex-col items-start gap-3.5 p-5 rounded-2xl border border-border/60 bg-white hover:border-brand-blue/40 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(43,27,24,0.08)] transition-all"
    >
      <span
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: tint.bg, color: tint.fg }}
      >
        <Icon className="w-6 h-6" />
      </span>
      <span className="flex flex-col gap-1 w-full min-w-0">
        <span className="text-[13.5px] font-bold text-foreground leading-tight line-clamp-2" title={industry.name}>
          {industry.name}
        </span>
        <span className="text-xs font-black text-brand-blue">
          {industry.jobCount} open role{industry.jobCount === 1 ? "" : "s"}
        </span>
      </span>
    </Link>
  );
}

// Opens from the "+N more industries" tile. Takes every sector (not just
// the ones hidden behind the tile) so the search box genuinely searches
// "All Industries" as titled -- a search for something that happens to
// already be visible in the top row (e.g. "Banking") must still find it
// here, not report no match just because it isn't one of the *hidden* ones.
function AllIndustriesModal({
  industries,
  onClose,
}: {
  industries: IndustryCard[];
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = industries.filter((ind) =>
    ind.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl my-8 sm:my-0 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-border/60 shrink-0">
          <div>
            <h3 className="font-black text-lg text-foreground">All Industries</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{industries.length} sectors to explore</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 pb-0 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search industries..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No industries match &quot;{search}&quot;.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((industry, i) => (
                <IndustryTile key={industry.id} industry={industry} tintIndex={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// With 28 real sectors seeded, showing every one of them stacked in the grid
// reads as an overwhelming wall to a first-time visitor (client feedback
// after seeing it live). TOP_COUNT (by job count, so the highest-demand
// sectors lead) render directly; a "+N more" tile opens the rest in a
// searchable modal instead of competing for space on the first screen.
const TOP_COUNT = 8;

export default function IndustrySection() {
  const [cards, setCards] = useState<IndustryCard[]>([]);
  const [showAllModal, setShowAllModal] = useState(false);

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

  const topCards = useMemo(() => cards.slice(0, TOP_COUNT), [cards]);
  const restCards = useMemo(() => cards.slice(TOP_COUNT), [cards]);

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {topCards.map((industry, i) => (
            <IndustryTile key={industry.id} industry={industry} tintIndex={i} />
          ))}

          {restCards.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAllModal(true)}
              className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-brand-blue/25 bg-brand-blue-muted/10 hover:bg-brand-blue-muted/25 hover:border-brand-blue/40 transition-all text-center"
            >
              <span className="w-12 h-12 rounded-2xl bg-white border border-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-all">
                <Plus className="w-5 h-5" />
              </span>
              <span className="text-[13.5px] font-black text-foreground leading-tight">
                +{restCards.length} more industries
              </span>
            </button>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-brand-blue font-black hover:gap-4 transition-all group">
            Browse all jobs
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {showAllModal && (
        <AllIndustriesModal industries={cards} onClose={() => setShowAllModal(false)} />
      )}
    </section>
  );
}
