"use client";

import Link from "next/link";
import { Phone, ArrowRight, MessageCircle, Heart } from "lucide-react";
import { featuredJobs } from "@/data/jobs";
import { useState } from "react";

function JobCard({ job }: { job: typeof featuredJobs[0] }) {
  const [isFav, setIsFav] = useState(job.isFavorite || false);
  const [imgError, setImgError] = useState(false);

  const fallbackImg = "https://placehold.co/600x450/f8fafc/94a3b8?text=Image+Not+Available";
  const posterImg = imgError ? fallbackImg : (job.image || fallbackImg);

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-border/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      
      {/* 1. Top Image Poster Area */}
      <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden border-b border-border/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterImg}
          alt={job.imageAlt || job.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        
        {/* 2. Overlay Badges (Top-Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {job.badges.map(badge => (
            <span 
              key={badge} 
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md ${
                badge === 'Premium' ? 'bg-brand-blue/90 text-white' :
                badge === 'Pro' ? 'bg-black/80 text-brand-blue-light' :
                badge === 'Popular' ? 'bg-[oklch(0.47_0.20_250)]/90 text-white' :
                'bg-emerald-500/90 text-white'
              }`}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* 3. Favorite Icon (Top-Right) */}
        <button 
          onClick={(e) => { e.preventDefault(); setIsFav(!isFav); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors border border-white/20 shadow-sm"
          aria-label="Save job"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-700'}`} />
        </button>
      </div>
      
      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* 4. Bold job title */}
        <Link href={`/jobs/${job.id}`} className="block flex-1 min-w-0 mb-4">
          <h3 className="font-bold text-foreground text-[16px] leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
            {job.title}
          </h3>
        </Link>
        
        <div className="mt-auto space-y-3">
          
          <div className="flex flex-col gap-2">
            {/* 5. WhatsApp contact link row */}
            {job.whatsapp && (
              <a 
                href={job.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full gap-2 py-2.5 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors text-[13px] font-bold"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            {/* 6. Phone contact link row */}
            {job.call && (
              <Link 
                href={`/jobs/${job.id}`}
                className="flex items-center justify-center w-full gap-2 py-2.5 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors text-[13px] font-bold"
              >
                <Phone className="w-4 h-4" /> Call Now
              </Link>
            )}
          </div>

          {/* 7. Footer meta row */}
          <div className="pt-4 mt-2 border-t border-border/60 flex items-center justify-between gap-2">
            <Link 
              href={`/jobs?category=${encodeURIComponent(job.category)}`}
              className="inline-flex items-center text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-md hover:text-brand-blue hover:bg-brand-blue/10 transition-colors line-clamp-1"
            >
              {job.category}
            </Link>
            
            {job.count !== undefined && (
              <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
                {job.count} Views
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function FeaturedJobsSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-semibold text-brand-blue uppercase tracking-widest mb-2">
              Premium Overseas Opportunities
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground text-balance">
              Latest Featured Jobs
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-balance">
              Verified job vacancies in UAE, Saudi Arabia, Qatar, Oman, Bahrain, Kuwait, and Europe. Contact employers directly via WhatsApp or Call.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline whitespace-nowrap"
          >
            View all vacancies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-brand-blue text-white hover:bg-brand-blue-dark border-none px-6 py-3 rounded-xl transition-colors font-semibold mx-auto shadow-md"
          >
            Load More Jobs <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
