"use client";

import { CheckCircle2, ArrowRight, Zap, Target, Users, Globe } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    title: "Global Reach",
    desc: "Your vacancies reach 2.4M+ active job seekers across Gulf, Europe, and Asia.",
    icon: <Globe className="w-6 h-6 text-brand-orange" />
  },
  {
    title: "Verified Talent",
    desc: "Access a database of pre-screened professionals with relevant overseas experience.",
    icon: <Users className="w-6 h-6 text-brand-orange" />
  },
  {
    title: "Rapid Hiring",
    desc: "Post a job in minutes and get applications delivered directly to your dashboard.",
    icon: <Zap className="w-6 h-6 text-brand-orange" />
  },
  {
    title: "Precision Targeting",
    desc: "Target candidates by industry, location, and specific skill sets.",
    icon: <Target className="w-6 h-6 text-brand-orange" />
  }
];

export default function PostJobLandingPage() {
  return (
    <div className="bg-muted/10 min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[oklch(0.12_0.02_260)] text-white pt-24 pb-32 md:pt-32 md:pb-48">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-orange blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-brand-blue blur-3xl" />
        </div>

        <div className="container-site px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8">
             <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Recruiter Solutions</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-8 leading-tight max-w-5xl mx-auto">
            Find the Best <span className="text-brand-orange text-gradient-orange">Overseas Talent</span> for Your Team
          </h1>
          <p className="text-white/70 max-w-3xl mx-auto text-lg md:text-2xl font-medium leading-relaxed mb-12">
            The #1 job platform for hiring professionals in Gulf, Europe, and Asia. Start posting today and build your global workforce.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register?role=recruiter"
              className="w-full sm:w-auto px-10 py-5 bg-brand-orange text-white font-black text-lg rounded-2xl hover:bg-brand-orange-dark transition-all shadow-xl shadow-brand-orange/20 active:scale-[0.98]"
            >
              Start Free Posting
            </Link>
            <Link 
              href="/pricing"
              className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 font-black text-lg rounded-2xl hover:bg-white/20 transition-all active:scale-[0.98]"
            >
              View Hiring Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Content */}
      <section className="container-site px-4 -mt-16 relative z-20 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="bg-white p-8 rounded-3xl border border-border/60 shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-foreground">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight">
              A Complete Hiring <br className="hidden md:block" />
              <span className="text-brand-blue">Ecosystem</span>
            </h2>
            <div className="space-y-6">
              {[
                { title: "Smart Applicant Tracking", desc: "Manage thousands of applications with ease using our built-in recruiter dashboard." },
                { title: "AI-Powered Matching", desc: "Our system automatically suggests the best candidates based on your job requirements." },
                { title: "Direct Contact", desc: "Connect with candidates directly via WhatsApp, Phone, or Email for faster hiring." }
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Link 
                href="/register?role=recruiter"
                className="inline-flex items-center gap-2 group text-brand-blue font-black text-lg hover:underline"
              >
                Learn more about our platform <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-brand-blue/10 rounded-[3rem] blur-3xl" />
            <div className="relative bg-white border border-border/60 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl">
              <h3 className="text-2xl font-black text-center mb-8">Trusted by Global Giants</h3>
              <div className="grid grid-cols-2 gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="h-12 flex items-center justify-center"><img src="https://placehold.co/200x60/f8fafc/94a3b8?text=Aramco" alt="Logo" className="max-h-full" /></div>
                <div className="h-12 flex items-center justify-center"><img src="https://placehold.co/200x60/f8fafc/94a3b8?text=Shell" alt="Logo" className="max-h-full" /></div>
                <div className="h-12 flex items-center justify-center"><img src="https://placehold.co/200x60/f8fafc/94a3b8?text=Samsung" alt="Logo" className="max-h-full" /></div>
                <div className="h-12 flex items-center justify-center"><img src="https://placehold.co/200x60/f8fafc/94a3b8?text=Bechtel" alt="Logo" className="max-h-full" /></div>
                <div className="h-12 flex items-center justify-center"><img src="https://placehold.co/200x60/f8fafc/94a3b8?text=L&T" alt="Logo" className="max-h-full" /></div>
                <div className="h-12 flex items-center justify-center"><img src="https://placehold.co/200x60/f8fafc/94a3b8?text=Petrofac" alt="Logo" className="max-h-full" /></div>
              </div>
              <div className="mt-12 p-6 bg-secondary/50 rounded-2xl border border-border/40 text-center">
                <p className="text-sm font-bold text-muted-foreground italic leading-relaxed">
                  "The Jobs Advertise has increased our candidate quality by 40% and reduced our hiring time significantly."
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="text-left">
                     <p className="text-xs font-black">Hr. Manager</p>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Global Construction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
