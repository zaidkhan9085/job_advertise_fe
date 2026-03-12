import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { nearbyRegions, vacancyCountries } from "@/data/regions";

export default function RegionsSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        {/* Nearby Jobs */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-semibold text-[oklch(0.68_0.21_45)] uppercase tracking-widest mb-2">Nearby</div>
              <h2 className="text-3xl font-extrabold text-foreground">Jobs Near You</h2>
              <p className="text-muted-foreground mt-1.5">Opportunities in your region and nearby GCC.</p>
            </div>
            <Link href="/jobs" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.47_0.20_250)] hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {nearbyRegions.map((region) => {
              const isExternal = region.href.startsWith("http");
              const LinkComponent = isExternal ? "a" : Link;
              const props = isExternal ? { href: region.href, target: "_blank", rel: "noopener noreferrer" } : { href: region.href };
              
              return (
                <LinkComponent
                  key={region.id}
                  {...props}
                  className="group bg-white rounded-2xl border border-border/60 p-4 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 hover:border-[oklch(0.47_0.20_250)]/30"
                >
                  <div className="text-3xl mb-2">{region.flag}</div>
                  <h3 className="text-xs font-semibold text-foreground group-hover:text-[oklch(0.47_0.20_250)] transition-colors">{region.label}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{region.jobCount.toLocaleString()} jobs</p>
                </LinkComponent>
              );
            })}
          </div>
        </div>

        {/* Countries / Vacancy */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-semibold text-[oklch(0.68_0.21_45)] uppercase tracking-widest mb-2">Global Vacancies</div>
              <h2 className="text-3xl font-extrabold text-foreground">Browse by Country</h2>
              <p className="text-muted-foreground mt-1.5">Gulf, Asia-Pacific, and beyond.</p>
            </div>
            <Link href="/jobs" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.47_0.20_250)] hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {vacancyCountries.map((c) => {
              const isExternal = c.href.startsWith("http");
              const LinkComponent = isExternal ? "a" : Link;
              const props = isExternal ? { href: c.href, target: "_blank", rel: "noopener noreferrer" } : { href: c.href };
              
              return (
                <LinkComponent
                  key={c.id}
                  {...props}
                  className="group bg-white rounded-2xl border border-border/60 p-4 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 hover:border-[oklch(0.47_0.20_250)]/30"
                >
                  <div className="text-2xl mb-1.5">{c.flag}</div>
                  <h3 className="text-[11px] font-semibold text-foreground group-hover:text-[oklch(0.47_0.20_250)] transition-colors leading-tight">{c.label}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.jobCount.toLocaleString()} jobs</p>
                </LinkComponent>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
