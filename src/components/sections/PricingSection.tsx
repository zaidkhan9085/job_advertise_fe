"use client";

import Link from "next/link";
import { Check, ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";
import { pricingPlans } from "@/data/pricing";

export default function PricingSection() {
  return (
    <section className="section-padding bg-[oklch(0.975_0.005_250)]">
      <div className="container-site">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-[oklch(0.68_0.21_45)] uppercase tracking-[0.2em] mb-3">Recruiters</div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Choose the right package to reach the best candidates across Gulf & Europe. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col p-8 sm:p-10 rounded-[2.5rem] bg-white border transition-all duration-500 ${
                plan.popular 
                  ? "border-[oklch(0.68_0.21_45)] shadow-[0_24px_50px_-12px_oklch(0.68_0.21_45/0.25)] md:-translate-y-4 ring-2 ring-[oklch(0.68_0.21_45)]/20" 
                  : "border-border/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[oklch(0.68_0.21_45)] text-white text-[10px] font-black uppercase tracking-[0.15em] py-2 px-6 rounded-full shadow-lg">
                  {plan.highlight || "Most Popular"}
                </div>
              )}
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    plan.name.includes("Golden") ? "bg-brand-orange/10" : 
                    plan.name.includes("Silver") ? "bg-brand-blue/10" : "bg-emerald-100"
                  }`}>
                    {plan.name.includes("Golden") ? <Star className="w-5 h-5 text-brand-orange" /> : 
                     plan.name.includes("Silver") ? <ShieldCheck className="w-5 h-5 text-brand-blue" /> : <Zap className="w-5 h-5 text-emerald-600" />}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground font-bold text-sm">{plan.period}</span>
                  </div>
                  {plan.subPeriod && (
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{plan.subPeriod}</span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{plan.description}</p>
              </div>

              <div className="h-px bg-border/40 w-full mb-8" />

              <div className="flex-1 mb-10">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-1 ${
                        plan.popular ? "bg-[oklch(0.68_0.21_45)]/10 text-[oklch(0.68_0.21_45)]" : "bg-emerald-100 text-emerald-600"
                      }`}>
                        <Check className="w-3 h-3 stroke-[4px]" />
                      </div>
                      <span className="text-sm font-bold text-foreground/80 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.href}
                className={`w-full py-4.5 rounded-2xl font-black text-sm text-center transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] ${
                  plan.popular 
                    ? "bg-[oklch(0.68_0.21_45)] hover:bg-[oklch(0.55_0.22_45)] text-white shadow-[oklch(0.68_0.21_45)]/20" 
                    : "bg-foreground text-white hover:bg-foreground/90"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground font-bold text-sm">Need a custom enterprise solution?</p>
          <Link 
            href="/contact" 
            className="text-[oklch(0.47_0.20_250)] font-black text-sm hover:underline mt-2 inline-flex items-center gap-1"
          >
            Contact our Sales Team <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
