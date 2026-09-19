"use client";

import Link from "next/link";
import { Search, Clock } from "lucide-react";
import { SHORT_TERM_JOBS_HREF } from "@/data/navigation";

// "Free Recruitment" removed from the UI site-wide per Zaid's request
// (the isFreeRecruitment field stays in the database, just no longer
// exposed anywhere); "Shutdown" renamed to "Short Term" everywhere,
// including the underlying JobType row itself (see job_poster's
// jobController.js/seed.js).
export default function HomeCTASection() {
  const ctas = [
    {
      label: "Browse Jobs",
      href: "/jobs",
      icon: Search,
      className: "bg-brand-blue text-white hover:bg-brand-blue-medium",
    },
    {
      label: "Short Term Jobs",
      href: SHORT_TERM_JOBS_HREF,
      icon: Clock,
      className: "bg-brand-blue text-white hover:bg-brand-blue-medium",
    },
  ];

  return (
    <section className="py-6 bg-brand-blue-muted/30">
      <div className="container-site">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {ctas.map((cta) => {
            const Icon = cta.icon;

            return (
              <Link
                key={cta.label}
                href={cta.href}
                className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] ${cta.className} whitespace-nowrap`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-[15px]">{cta.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
