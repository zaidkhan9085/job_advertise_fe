"use client";

import { Check, ArrowRight, Zap, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Golden Package",
    price: "₹4,999",
    period: "/ 60 Days",
    description: "Premium exposure for urgent hiring across Gulf & Europe.",
    features: [
      "10 Premium Job Posts",
      "Featured Badge on Job Card",
      "Top Priority in Search Results",
      "Access to 2.4M+ Candidate Database",
      "Dedicated Account Manager",
      "WhatsApp & Email Support",
      "Company Profile Verification"
    ],
    recommended: true,
    cta: "Choose Golden",
    icon: <Star className="w-6 h-6 text-yellow-500" />
  },
  {
    name: "Silver Package",
    price: "₹2,499",
    period: "/ 30 Days",
    description: "Ideal for small businesses looking for quality talent.",
    features: [
      "5 Standard Job Posts",
      "Standard Search Visibility",
      "Access to Local Candidates",
      "Basic Profile Dashboard",
      "Email Support Only",
      "Response Management",
      "Candidate Tracking System"
    ],
    recommended: false,
    cta: "Choose Silver",
    icon: <ShieldCheck className="w-6 h-6 text-[oklch(0.47_0.20_250)]" />
  },
  {
    name: "Free Plan",
    price: "₹0",
    period: "/ Lifetime",
    description: "Get started with your first job post for free.",
    features: [
      "1 Standard Job Post",
      "Limited Visibility",
      "Community Dashboard",
      "Basic Support",
      "Profile Setup",
      "Public Company Page",
      "Standard Analytics"
    ],
    recommended: false,
    cta: "Get Started",
    icon: <Zap className="w-6 h-6 text-emerald-500" />
  }
];

export default function PricingPage() {
  return (
    <div className="bg-muted/10 min-h-screen pb-24">
      
      {/* Header Section */}
      <div className="bg-[oklch(0.12_0.02_260)] text-white pt-20 pb-32 md:pt-24 md:pb-48 border-b border-border/20">
        <div className="container-site px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-6">
             <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Simple Pricing</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Hire the Best <span className="text-brand-orange">Faster</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Choose the recruitment plan that scales with your growth. No hidden fees, cancel anytime.
          </p>
        </div>
      </div>

      <div className="container-site px-4 -mt-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col bg-white rounded-[2rem] border transition-all duration-300 ${
                plan.recommended 
                  ? "border-brand-orange shadow-2xl shadow-brand-orange/10 scale-105 z-20 md:translate-y-[-10px]" 
                  : "border-border/60 shadow-xl hover:shadow-2xl hover:-translate-y-1"
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8 sm:p-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center">
                    {plan.icon}
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">{plan.name}</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground font-bold">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3 font-medium leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="h-px bg-border/40 w-full mb-8" />

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`mt-1 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.recommended ? "bg-brand-orange/10 text-brand-orange" : "bg-emerald-100 text-emerald-600"}`}>
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-sm font-semibold text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/register?role=recruiter"
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm transition-all shadow-md active:scale-[0.98] ${
                    plan.recommended 
                      ? "bg-brand-orange text-white hover:bg-brand-orange-dark shadow-brand-orange/20" 
                      : "bg-foreground text-white hover:bg-foreground/90"
                  }`}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison CTA */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground font-medium mb-4">Need a custom plan for enterprise hiring?</p>
          <Link 
            href="/contact"
            className="text-[oklch(0.47_0.20_250)] font-black hover:underline flex items-center justify-center gap-2"
          >
            Contact Sales Team <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
