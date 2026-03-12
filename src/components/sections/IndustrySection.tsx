import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { industries } from "@/data/industries";

export default function IndustrySection() {
  return (
    <section className="section-padding bg-[oklch(0.975_0.005_250)]">
      <div className="container-site">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold text-[oklch(0.68_0.21_45)] uppercase tracking-widest mb-2">
            Browse by Sector
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Explore by Industry
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Thousands of jobs across every major sector. Find the field where you belong.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {industries.map((industry) => {
            const isExternal = industry.href.startsWith("http");
            const LinkComponent = isExternal ? "a" : Link;
            const props = isExternal ? { href: industry.href, target: "_blank", rel: "noopener noreferrer" } : { href: industry.href };
            
            return (
              <LinkComponent
                key={industry.id}
                {...props}
                className="group bg-white rounded-2xl border border-border/60 p-5 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 hover:border-[oklch(0.68_0.21_45)]/30"
              >
                <div className="text-3xl mb-3">{industry.icon}</div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-[oklch(0.47_0.20_250)] transition-colors line-clamp-2 leading-tight">
                  {industry.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {industry.jobCount.toLocaleString()} jobs
                </p>
              </LinkComponent>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[oklch(0.47_0.20_250)] border border-[oklch(0.47_0.20_250)]/30 hover:bg-[oklch(0.47_0.20_250)]/5 px-5 py-2.5 rounded-xl transition-colors"
          >
            Browse all industries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
