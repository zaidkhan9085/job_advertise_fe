"use client";

import { useState } from "react";
import { Check, ArrowRight, Zap, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { pricingPlans } from "@/data/pricing";

export default function PricingPage() {
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

  const getIcon = (name: string) => {
    if (name.includes("Golden")) return <Star className="w-6 h-6 text-yellow-500" />;
    if (name.includes("Silver")) return <ShieldCheck className="w-6 h-6 text-[oklch(0.47_0.20_250)]" />;
    return <Zap className="w-6 h-6 text-emerald-500" />;
  };

  return (
    <div className="bg-muted/10 min-h-screen pb-24">
      
      {/* Header Section */}
      <div className="bg-hero-gradient text-white pt-20 pb-32 md:pt-24 md:pb-48 border-b border-white/10 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-blue-light/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="container-site px-4 relative z-10 text-center">
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

      <div className="container-site px-4 -mt-24 relative z-10">
        
        {/* Dynamic Toggles Container - PLACED ABOVE CARDS */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
          
          {/* Billing Cycle Toggle */}
          <div className="bg-white p-1.5 rounded-2xl border border-border/60 shadow-xl flex items-center relative min-w-[280px]">
            <button 
              onClick={() => setBilling("monthly")}
              className={`relative z-10 flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${billing === "monthly" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBilling("yearly")}
              className={`relative z-10 flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${billing === "yearly" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              Yearly
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black transition-colors ${billing === "yearly" ? "bg-white/20 text-white" : "bg-brand-blue/10 text-brand-blue"}`}>
                -20%
              </span>
            </button>
            {/* Sliding Pill */}
            <div 
              className={`absolute top-1.5 bottom-1.5 bg-brand-blue rounded-xl transition-all duration-500 ease-out shadow-lg shadow-brand-blue/20 ${billing === "monthly" ? "left-1.5 w-[calc(50%-6px)]" : "left-[calc(50%+3px)] w-[calc(50%-6px)]"}`} 
            />
          </div>

          {/* Currency Toggle */}
          <div className="bg-white p-1.5 rounded-2xl border border-border/60 shadow-xl flex items-center relative min-w-[220px]">
            <button 
              onClick={() => setCurrency("INR")}
              className={`relative z-10 flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${currency === "INR" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              ₹ INR
            </button>
            <button 
              onClick={() => setCurrency("USD")}
              className={`relative z-10 flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${currency === "USD" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              $ USD
            </button>
            {/* Sliding Pill */}
            <div 
              className={`absolute top-1.5 bottom-1.5 bg-brand-blue rounded-xl transition-all duration-500 ease-out shadow-lg shadow-brand-blue/20 ${currency === "INR" ? "left-1.5 w-[calc(50%-6px)]" : "left-[calc(50%+3px)] w-[calc(50%-6px)]"}`} 
            />
          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col bg-white rounded-[2rem] border transition-all duration-300 ${
                plan.popular 
                  ? "border-brand-blue shadow-2xl shadow-brand-blue/10 z-20 md:-translate-y-4" 
                  : "border-brand-blue/15 shadow-xl hover:shadow-2xl hover:border-brand-blue/40"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg border border-white/20">
                  {plan.highlight || "Most Popular"}
                </div>
              )}

              <div className="p-8 sm:p-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center">
                    {getIcon(plan.name)}
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">{plan.name}</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-brand-blue">{formatPrice(plan.monthlyPriceINR)}</span>
                    <span className="text-muted-foreground font-bold">/ {billing === "monthly" ? "30 Days" : "Year"}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-3 font-black uppercase tracking-widest">
                    {billing === "monthly" ? "Monthly Plan" : "Yearly Plan | Best Value"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-3 font-medium leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="h-px bg-border/40 w-full mb-8" />

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`mt-1 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-blue/5 text-brand-blue"}`}>
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-sm font-semibold text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/register?role=recruiter"
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm transition-all shadow-md active:scale-[0.98] ${
                    plan.popular 
                      ? "bg-brand-blue text-white hover:bg-brand-blue-medium shadow-brand-blue/20" 
                      : "bg-brand-blue/5 text-brand-blue hover:bg-brand-blue hover:text-white"
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
            className="text-brand-blue font-black hover:underline flex items-center justify-center gap-2"
          >
            Contact Sales Team <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
