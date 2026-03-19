"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";
import { pricingPlans } from "@/data/pricing";

export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const EXCHANGE_RATE = 83; // 1 USD = 83 INR
  const YEARLY_DISCOUNT = 0.2; // 20% Discount

  const formatPrice = (priceINR: number) => {
    if (priceINR === 0) return currency === "INR" ? "₹ 0.00" : "$ 0.00";

    let calculatedPrice = priceINR;
    
    // Apply yearly discount if needed
    if (billing === "yearly") {
      calculatedPrice = priceINR * 12 * (1 - YEARLY_DISCOUNT);
    }

    // Convert currency
    if (currency === "USD") {
      calculatedPrice = calculatedPrice / EXCHANGE_RATE;
      return `$ ${calculatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    return `₹ ${calculatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <section className="section-padding bg-[oklch(0.975_0.005_250)]">
      <div className="container-site">
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-brand-blue uppercase tracking-[0.2em] mb-3">Recruiters</div>
          <h2 className="text-2xl md:text-4xl font-black text-foreground mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium leading-relaxed mb-10">
            Choose the right package to reach the best candidates across Gulf & Europe. No hidden fees.
          </p>

          {/* Dynamic Toggles Container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            
            {/* Billing Cycle Toggle */}
            <div className="bg-white p-1.5 rounded-2xl border border-border/60 shadow-sm flex items-center relative group">
              <button 
                onClick={() => setBilling("monthly")}
                className={`relative z-10 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${billing === "monthly" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBilling("yearly")}
                className={`relative z-10 px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${billing === "yearly" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                Yearly
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black transition-colors ${billing === "yearly" ? "bg-white/20 text-white" : "bg-brand-blue/10 text-brand-blue"}`}>
                  -20%
                </span>
              </button>
              {/* Sliding Pill */}
              <div 
                className={`absolute top-1.5 bottom-1.5 bg-brand-blue rounded-xl transition-all duration-500 ease-out shadow-lg shadow-brand-blue/20 ${billing === "monthly" ? "left-1.5 w-[110px]" : "left-[118px] w-[130px]"}`} 
              />
            </div>

            {/* Currency Toggle */}
            <div className="bg-white p-1.5 rounded-2xl border border-border/60 shadow-sm flex items-center relative group">
              <button 
                onClick={() => setCurrency("INR")}
                className={`relative z-10 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${currency === "INR" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                ₹ INR
              </button>
              <button 
                onClick={() => setCurrency("USD")}
                className={`relative z-10 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${currency === "USD" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                $ USD
              </button>
              {/* Sliding Pill */}
              <div 
                className={`absolute top-1.5 bottom-1.5 bg-brand-blue rounded-xl transition-all duration-500 ease-out shadow-lg shadow-brand-blue/20 ${currency === "INR" ? "left-1.5 w-[90px]" : "left-[94px] w-[95px]"}`} 
              />
            </div>

          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col p-8 sm:p-10 rounded-[2.5rem] bg-white border transition-all duration-500 ${
                plan.popular 
                  ? "border-brand-blue shadow-[0_24px_50px_-12px_var(--brand-blue-medium)/0.25] md:-translate-y-4 ring-2 ring-brand-blue/20" 
                  : "border-border/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white text-[10px] font-black uppercase tracking-[0.15em] py-2 px-6 rounded-full shadow-lg">
                  {plan.highlight || "Most Popular"}
                </div>
              )}
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    plan.name.includes("Golden") ? "bg-brand-blue/10" : 
                    plan.name.includes("Silver") ? "bg-brand-blue-light/10" : "bg-emerald-100"
                  }`}>
                    {plan.name.includes("Golden") ? <Star className="w-5 h-5 text-brand-blue" /> : 
                     plan.name.includes("Silver") ? <ShieldCheck className="w-5 h-5 text-brand-blue-light" /> : <Zap className="w-5 h-5 text-emerald-600" />}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-foreground">{formatPrice(plan.monthlyPriceINR)}</span>
                    <span className="text-muted-foreground font-bold text-sm">/ {billing === "monthly" ? "30 days" : "Year"}</span>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Package | {billing === "monthly" ? "Monthly Plan" : "Yearly Plan"}</span>
                </div>
                
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{plan.description}</p>
              </div>

              <div className="h-px bg-border/40 w-full mb-8" />

              <div className="flex-1 mb-10">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-1 ${
                        plan.popular ? "bg-brand-blue/10 text-brand-blue" : "bg-emerald-100 text-emerald-600"
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
                    ? "bg-brand-blue hover:bg-brand-blue-medium text-white shadow-brand-blue/20" 
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
