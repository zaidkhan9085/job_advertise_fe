"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Globe2 } from "lucide-react";
import { nearbyRegions, vacancyCountries, type Region } from "@/data/regions";

// Groups the existing flat vacancyCountries list into tabs — purely a
// presentation grouping, every item keeps its original id/href from
// data/regions.ts untouched, so existing redirects are unaffected.
const GULF_IDS = new Set(["uae", "saudi-arabia", "qatar", "oman", "kuwait", "bahrain", "iran", "iraq", "turkey"]);
const ASIA_IDS = new Set(["singapore", "malaysia", "thailand", "indonesia", "philippines", "japan", "south-korea"]);

const india = nearbyRegions.find((r) => r.id === "all-india");
const gulf = vacancyCountries.filter((r) => GULF_IDS.has(r.id));
const asia = vacancyCountries.filter((r) => ASIA_IDS.has(r.id));
const international = vacancyCountries.filter((r) => !GULF_IDS.has(r.id) && !ASIA_IDS.has(r.id));

const TABS: { key: string; label: string; items: Region[] }[] = [
  { key: "gulf", label: "Gulf", items: gulf },
  { key: "india", label: "India", items: india ? [india] : [] },
  { key: "asia", label: "Asia", items: asia },
  { key: "intl", label: "International", items: international },
];

function RegionRow({ region }: { region: Region }) {
  return (
    <Link
      href={region.href}
      className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border/60 bg-white hover:border-brand-blue/40 hover:bg-brand-blue-muted/10 transition-all"
    >
      <span className="flex items-center gap-2.5 font-bold text-sm text-foreground">
        <span className="text-lg leading-none">{region.flag}</span>
        {region.label}
      </span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-black text-brand-blue tabular-nums">{region.jobCount.toLocaleString()}</span>
        <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">jobs</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
      </span>
    </Link>
  );
}

export default function RegionsSection() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const current = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="container-site">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-brand-blue/40 uppercase tracking-[0.3em]">
              <Globe2 className="w-4 h-4" /> Global Reach
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-brand-blue tracking-tight">Browse by Country</h2>
            <p className="text-muted-foreground font-medium max-w-xl">
              Explore trending international careers in top global destinations.
            </p>
          </div>
        </div>

        <div className="inline-flex bg-secondary/50 rounded-full p-1 mb-6 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === tab.key ? "bg-white text-brand-blue shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {current.items.map((region) => (
            <RegionRow key={region.id} region={region} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/jobs"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl font-black hover:bg-brand-blue-medium transition-all shadow-md hover:shadow-brand-blue/25 hover:-translate-y-0.5"
          >
            Explore All Active Jobs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
