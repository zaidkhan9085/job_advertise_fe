"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Quote } from "lucide-react";
import { getFeaturedTestimonials, getPlatformStats, type Testimonial, type PlatformStats, ApiError } from "@/lib/api";

// Cards are real candidate-submitted testimonials (dashboard "Share Your
// Experience" card), gated behind an admin's Featured toggle -- see
// dashboard/admin/testimonials. An empty/sparse result is fine and
// expected (nothing hidden) -- what shows here is entirely an admin's
// curated choice, same as TopCompaniesSection's "Top Companies Hiring".
//
// The stat grid used to be hardcoded marketing copy ("50,000+ Active Job
// Listings" etc, unrelated to any real number) -- now it's the real,
// live count from getPlatformStats(), no "+" padding implying more than
// what's actually shown.
export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await getFeaturedTestimonials();
      setTestimonials(res.testimonials);
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
      setTestimonials([]);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getPlatformStats());
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
    }
  }, []);

  useEffect(() => {
    load();
    loadStats();
  }, [load, loadStats]);

  const metrics = stats
    ? [
        { value: stats.activeJobs.toLocaleString(), label: "Active Job Listings" },
        { value: stats.candidates.toLocaleString(), label: "Registered Candidates" },
        { value: stats.hiringCompanies.toLocaleString(), label: "Hiring Companies" },
        // Not a count on purpose -- reach spans countries the platform
        // doesn't have a clean "active postings" number for yet, so this
        // stays a plain claim instead of a number that would understate it.
        { value: "Worldwide", label: "Countries Covered" },
      ]
    : [];

  return (
    <section className="section-padding bg-background overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-blue/5 -skew-x-12 origin-top-right transform-gpu pointer-events-none" />

      <div className="container-site relative z-10">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 items-center">

          {/* Left info & metrics */}
          <div className="lg:pr-8">
            <div className="text-xs font-semibold text-brand-blue uppercase tracking-widest mb-2">Success Stories</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 leading-tight">Trusted by Thousands Worldwide</h2>
            <p className="text-muted-foreground mb-10 max-w-md">
              Hear from professionals who found their dream roles, and companies that hired their best talent through thejobs4u.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="text-2xl font-extrabold text-brand-blue">{m.value}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 relative">
            {(testimonials || []).map((t, idx) => (
              <div
                key={t.id}
                className={`bg-white rounded-2xl p-7 border border-border/60 shadow-[var(--shadow-card)] relative z-10 ${idx === 1 ? 'sm:translate-y-8' : ''}`}
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-secondary" />

                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-4 h-4 ${n <= t.rating ? "fill-[oklch(0.70_0.25_80)] text-[oklch(0.70_0.25_80)]" : "text-border"}`}
                    />
                  ))}
                </div>

                <p className="text-sm font-medium leading-relaxed text-foreground/80 mb-6 italic">
                  &quot;{t.quote}&quot;
                </p>

                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
                    {(t.user?.full_name || "?").split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{t.user?.full_name || "thejobs4u User"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
