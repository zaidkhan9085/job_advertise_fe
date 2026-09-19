"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2 } from "lucide-react";
import { getFeaturedCompanies, resolveImageUrl, type FeaturedCompany, ApiError } from "@/lib/api";

// Purely admin-curated (see dashboard/admin/employers -- the "Top Hiring"
// star toggle): shows every company an admin has featured regardless of its
// current job count -- featuring a company is a deliberate, standing
// choice, so it never silently disappears just because it has no active
// jobs right now. An empty list just means no one is currently featured,
// and the section renders nothing rather than an empty block.
// Cards aren't links yet -- what a click should filter to (exact company vs
// a name-text search) is still an open decision, deferred on purpose.
export default function TopCompaniesSection() {
  const [companies, setCompanies] = useState<FeaturedCompany[] | null>(null);

  const load = useCallback(async () => {
    try {
      setCompanies(await getFeaturedCompanies());
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
      setCompanies([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (companies !== null && companies.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-white relative overflow-hidden">
      <div className="container-site relative">
        <div className="mb-8 space-y-2">
          <div className="text-xs font-black text-brand-blue/40 uppercase tracking-[0.3em]">Trusted Recruiters</div>
          <h2 className="text-2xl md:text-3xl font-black text-brand-blue tracking-tight">Top Companies Hiring</h2>
          <p className="text-muted-foreground font-medium max-w-xl">
            Actively hiring recruiters and employers on thejobs4u right now.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {companies === null
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-secondary/40 animate-pulse" />
              ))
            : companies.map((company) => (
                <div
                  key={company.id}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-5 rounded-2xl border border-brand-blue/10 bg-white hover:border-brand-blue/40 hover:shadow-[0_8px_24px_rgba(200,66,44,0.08)] transition-all text-center"
                >
                  {company.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImageUrl(company.logo)}
                      alt={company.name}
                      className="w-12 h-12 rounded-xl object-cover border border-border/60"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-brand-blue-muted/40 flex items-center justify-center text-brand-blue">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                  <span className="text-[13px] font-bold text-foreground leading-tight line-clamp-2" title={company.name}>
                    {company.name}
                  </span>
                  <span className="text-xs font-black text-brand-blue">
                    {company.jobCount} open position{company.jobCount === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
