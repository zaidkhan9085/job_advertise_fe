"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Check, ArrowRight, Zap, Crown, Coins } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getPlanTemplates, getCreditPackages, ApiError, type PlanTemplate, type CreditPackage } from "@/lib/api";
import DecorativeBlur from "@/components/common/DecorativeBlur";

// Real Free/Pro numbers and credit packs, not marketing copy -- this used
// to show three fabricated tiers ("Golden/Silver Package") that had nothing
// to do with the actual Free/Pro system, which would directly contradict
// what a recruiter sees once they're actually on the platform.
function planFeatures(t: PlanTemplate): string[] {
  return [
    `${t.featuredLimit} Featured job posts / month`,
    `${t.generalLimit} General job posts / month`,
    t.storiesAllowed ? "Post Stories" : "Stories not included",
    t.includedCredits > 0 ? `${t.includedCredits} bonus credits every month` : "No credits included",
  ];
}

export default function PricingPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PlanTemplate[] | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);

  const load = useCallback(async () => {
    try {
      const [t, p] = await Promise.all([getPlanTemplates(), getCreditPackages()]);
      setTemplates(t);
      setPackages(p);
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
      setTemplates([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isEmployer = user?.displayRole === "Recruiter";
  // A logged-out visitor likely already has an account -- sending them to
  // Register instead of Login forced a needless signup attempt. Only a
  // signed-in non-employer (e.g. a candidate) actually needs to register a
  // new recruiter account. redirect=/dashboard/billing lands them straight
  // back on this purchase flow after signing in (login's own redirect
  // handling only honors /dashboard/* targets).
  const ctaHref = isEmployer ? "/dashboard/billing" : user ? "/register?role=recruiter" : "/login?redirect=/dashboard/billing";

  const free = templates?.find((t) => t.planType === "FREE");
  const pro = templates?.find((t) => t.planType === "PRO");

  return (
    <div className="bg-muted/10 min-h-screen pb-24">
      <div className="bg-hero-gradient text-white pt-20 pb-32 md:pt-24 md:pb-48 border-b border-white/10 relative overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 left-0 bg-brand-blue-light/10 -translate-x-1/2 -translate-y-1/2" />
        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-6 border border-white/10">
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Simple Pricing</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Hire the Best <span className="text-brand-blue-light italic">Faster</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Choose the recruitment plan that scales with your growth. No hidden fees, cancel anytime.
          </p>
        </div>
      </div>

      <div className="container-site -mt-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {free && (
            <div className="relative flex flex-col bg-white rounded-[2rem] border border-brand-blue/15 shadow-xl hover:shadow-2xl hover:border-brand-blue/40 transition-all duration-300">
              <div className="p-8 sm:p-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-500" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">Free</span>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-brand-blue">₹0</span>
                    <span className="text-muted-foreground font-bold">/ month</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3 font-medium leading-relaxed">
                    Get started posting jobs at no cost.
                  </p>
                </div>
                <div className="h-px bg-border/40 w-full mb-8" />
                <ul className="space-y-4 mb-10 flex-1">
                  {planFeatures(free).map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-1 shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-brand-blue/5 text-brand-blue">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-sm font-semibold text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={ctaHref}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm transition-all shadow-md active:scale-[0.98] bg-brand-blue/5 text-brand-blue hover:bg-brand-blue hover:text-white"
                >
                  {isEmployer ? "View My Plan" : "Get Started"} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          )}

          {pro && (
            <div className="relative flex flex-col bg-white rounded-[2rem] border border-brand-blue shadow-2xl shadow-brand-blue/10 z-20 md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg border border-white/20">
                Most Popular
              </div>
              <div className="p-8 sm:p-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-amber-500" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">Pro</span>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-brand-blue">₹{pro.price}</span>
                    <span className="text-muted-foreground font-bold">/ month</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3 font-medium leading-relaxed">
                    More postings, Stories, and bonus credits every month.
                  </p>
                </div>
                <div className="h-px bg-border/40 w-full mb-8" />
                <ul className="space-y-4 mb-10 flex-1">
                  {planFeatures(pro).map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-1 shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-brand-blue/10 text-brand-blue">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-sm font-semibold text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={ctaHref}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm transition-all shadow-md active:scale-[0.98] bg-brand-blue text-white hover:bg-brand-blue-medium shadow-brand-blue/20"
                >
                  {isEmployer ? "Upgrade to Pro" : "Get Started"} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Credit packs */}
        {packages.length > 0 && (
          <div className="max-w-4xl mx-auto mt-16">
            <div className="text-center mb-8">
              <div className="text-xs font-black text-brand-blue/40 uppercase tracking-[0.3em] mb-2">Search Candidates</div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground">Need more credits?</h2>
              <p className="text-muted-foreground mt-2">
                Credits unlock candidate resumes and full profiles — buy a pack any time, on any plan. They never expire.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
              {packages.map((pack) => (
                <div key={pack.id} className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-black text-foreground">{pack.credits} credits</div>
                  <div className="text-lg font-bold text-brand-blue">₹{pack.price}</div>
                  <Link
                    href={ctaHref}
                    className="block w-full py-2.5 rounded-xl bg-brand-blue/5 text-brand-blue font-bold text-sm hover:bg-brand-blue hover:text-white transition-all"
                  >
                    {isEmployer ? "Buy Now" : "Sign Up to Buy"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-20 text-center">
          <p className="text-muted-foreground font-medium mb-4">Need a custom plan for enterprise hiring?</p>
          <Link
            href="/contact"
            className="text-brand-blue font-black hover:underline flex items-center justify-center gap-2"
          >
            Contact Sales Team <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
