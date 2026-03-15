"use client";

import Link from "next/link";
import { FileText, UserPlus, ArrowRight } from "lucide-react";

export default function TrustCTASection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container-site relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Card 1: Candidates */}
          <div className="group relative overflow-hidden rounded-[40px] p-10 sm:p-14 bg-brand-blue text-white shadow-[0_20px_50px_rgba(30,58,138,0.3)] transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Upload Your Resume</h3>
              <p className="text-white/70 text-lg font-medium mb-12 leading-relaxed max-w-sm">
                Let top employers find you. Create a profile and upload your CV to be discovered by thousands of hiring managers.
              </p>
              <div className="mt-auto">
                <Link
                  href="/resume"
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-brand-blue font-black transition-all hover:shadow-2xl hover:translate-x-1 active:scale-95"
                >
                  Upload Resume <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Card 2: Employers */}
          <div className="group relative overflow-hidden rounded-[40px] p-10 sm:p-14 bg-white border border-brand-blue/10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue/5 flex items-center justify-center mb-8 border border-brand-blue/10 group-hover:scale-110 transition-transform duration-500">
                <UserPlus className="w-8 h-8 text-brand-blue" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight text-brand-blue">Post Your Jobs</h3>
              <p className="text-muted-foreground text-lg font-medium mb-12 leading-relaxed max-w-sm">
                Reach over 2.4 million qualified candidates locally and globally. Start hiring the best talent for your organization today.
              </p>
              <div className="mt-auto">
                <Link
                  href="/post-job"
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-brand-blue text-white font-black transition-all hover:shadow-2xl hover:shadow-brand-blue/30 hover:translate-x-1 active:scale-95 border border-white/10"
                >
                  Post a Job <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-blue/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>
      </div>
    </section>
  );
}
