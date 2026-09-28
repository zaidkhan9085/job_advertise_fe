"use client";

import Link from "next/link";
import { Search, Clock } from "lucide-react";
import { SHORT_TERM_JOBS_HREF } from "@/data/navigation";
import { buttonClass } from "@/lib/ui";

// "Free Recruitment" removed from the UI site-wide per Zaid's request
// (the isFreeRecruitment field stays in the database, just no longer
// exposed anywhere); "Shutdown" renamed to "Short Term" everywhere,
// including the underlying JobType row itself (see job_poster's
// jobController.js/seed.js).
export default function HomeCTASection() {
  const ctas = [
    { label: "Browse Jobs", href: "/jobs", icon: Search },
    { label: "Short Term Jobs", href: SHORT_TERM_JOBS_HREF, icon: Clock },
  ];

  return (
    <section className="py-6 bg-brand-blue-muted/30">
      <div className="container-site">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto">
          {ctas.map((cta) => {
            const Icon = cta.icon;

            return (
              <Link
                key={cta.label}
                href={cta.href}
                className={buttonClass({ variant: "primary" }, "hover:-translate-y-1")}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {cta.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
