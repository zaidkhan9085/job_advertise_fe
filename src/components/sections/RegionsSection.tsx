"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Globe2 } from "lucide-react";
import { getJobs, getJobLocations, type JobLocation, ApiError } from "@/lib/api";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface RegionRow {
  id: string;
  label: string;
  flag: string;
  jobCount: number;
  href: string;
}

const FLAGS: Record<string, string> = {
  Bahrain: "🇧🇭", Iran: "🇮🇷", Iraq: "🇮🇶", Kuwait: "🇰🇼", Oman: "🇴🇲",
  Qatar: "🇶🇦", "Saudi Arabia": "🇸🇦", Turkey: "🇹🇷", UAE: "🇦🇪",
  Indonesia: "🇮🇩", Japan: "🇯🇵", Malaysia: "🇲🇾", Maldives: "🇲🇻", Mauritius: "🇲🇺",
  Philippines: "🇵🇭", Singapore: "🇸🇬", "South Korea": "🇰🇷", Thailand: "🇹🇭",
  Africa: "🌍", Azerbaijan: "🇦🇿", Georgia: "🇬🇪", Israel: "🇮🇱", Jordan: "🇯🇴",
  Kazakhstan: "🇰🇿", Russia: "🇷🇺", Uzbekistan: "🇺🇿",
  Australia: "🇦🇺", Canada: "🇨🇦", Europe: "🇪🇺", "New Zealand": "🇳🇿",
};

interface Tab {
  key: string;
  label: string;
  items: RegionRow[];
}

function RegionRowView({ region }: { region: RegionRow }) {
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
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState("gulf");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [jobs, tree] = await Promise.all([getJobs(), getJobLocations()]);

        // Counts by the denormalized country/state ancestor ids, not the raw
        // jobLocationId — jobs increasingly point at city-level locations
        // (job posting's picker now supports full worldwide city detail),
        // and this tab grouping is intentionally coarse (country/state
        // level only). A job contributes to both its country's count and
        // its state's count (when it has one) — these are always different
        // ids, so one shared map is fine, nothing double-counts within a
        // single tab.
        const countByAncestorId = new Map<string, number>();
        const bump = (id: string | null) => {
          if (!id) return;
          countByAncestorId.set(id, (countByAncestorId.get(id) ?? 0) + 1);
        };
        for (const job of jobs) {
          bump(job.jobLocationCountryId);
          bump(job.jobLocationStateId);
        }

        const findNode = (name: string) => tree.find((n) => n.name === name);
        const toRow = (node: JobLocation, defaultFlag: string): RegionRow => ({
          id: node.id,
          label: node.name,
          flag: FLAGS[node.name] ?? defaultFlag,
          jobCount: countByAncestorId.get(node.id) ?? 0,
          href: `/jobs?location=${slugify(node.name)}`,
        });
        const byCountDesc = (a: RegionRow, b: RegionRow) => b.jobCount - a.jobCount;

        const gulf = (findNode("Gulf")?.children ?? []).map((n) => toRow(n, "🌍")).sort(byCountDesc);
        const india = (findNode("India (All States)")?.children ?? []).map((n) => toRow(n, "🇮🇳")).sort(byCountDesc);
        const asia = (findNode("Asia")?.children ?? []).map((n) => toRow(n, "🌏")).sort(byCountDesc);
        const intlLeaves = ["Australia", "Canada", "Europe", "New Zealand"]
          .map(findNode)
          .filter((n): n is JobLocation => !!n)
          .map((n) => toRow(n, "🌍"));
        const russiaChildren = (findNode("Russia & Other Countries")?.children ?? []).map((n) => toRow(n, "🌍"));
        const international = [...intlLeaves, ...russiaChildren].sort(byCountDesc);

        setTabs([
          { key: "gulf", label: "Gulf", items: gulf },
          { key: "india", label: "India", items: india },
          { key: "asia", label: "Asia", items: asia },
          { key: "intl", label: "International", items: international },
        ]);
      } catch (err) {
        if (!(err instanceof ApiError)) console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const current = tabs.find((t) => t.key === activeTab) ?? tabs[0];

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
          {(tabs.length ? tabs : [{ key: "gulf", label: "Gulf", items: [] }, { key: "india", label: "India", items: [] }, { key: "asia", label: "Asia", items: [] }, { key: "intl", label: "International", items: [] }]).map((tab) => (
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

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-13 rounded-xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(current?.items ?? []).map((region) => (
              <RegionRowView key={region.id} region={region} />
            ))}
          </div>
        )}

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
