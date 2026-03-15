"use client";

import Link from "next/link";
import { Phone, ArrowRight, MessageCircle, Heart, MapPin, Eye } from "lucide-react";
import { featuredJobs } from "@/data/jobs";
import { useState } from "react";

function GeneralAdCard({ job }: { job: typeof featuredJobs[0] }) {
  const [isFav, setIsFav] = useState(job.isFavorite || false);
  const [imgError, setImgError] = useState(false);

  const fallbackImg = "https://placehold.co/600x450/f8fafc/94a3b8?text=Image+Not+Available";
  const posterImg = imgError ? fallbackImg : (job.image || fallbackImg);

  const isPopular = job.badges.includes("Popular");
  const isNew = job.badges.includes("New");

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
      
      {/* Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/30">
        <img
          src={posterImg}
          alt={job.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImgError(true)}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isNew && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500 text-white shadow-sm">
              New
            </span>
          )}
          {isPopular && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-brand-blue text-white shadow-sm">
              Popular
            </span>
          )}
        </div>

        {/* Favorite */}
        <button 
          onClick={(e) => { e.preventDefault(); setIsFav(!isFav); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center hover:bg-white text-foreground transition-all shadow-sm"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-foreground/40'}`} />
        </button>
      </div>
      
      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/jobs/${job.id}`} className="block mb-4">
          <h3 className="font-bold text-foreground text-[15px] leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
            {job.title}
          </h3>
        </Link>
        
        <div className="mt-auto">
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <a 
              href={job.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold">WhatsApp</span>
            </a>
            <Link 
              href={`/jobs/${job.id}`}
              className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-blue-50 text-brand-blue hover:bg-blue-100 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-[10px] font-bold">Call</span>
            </Link>
            <Link 
              href={`/jobs/${job.id}`}
              className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-foreground/5 text-foreground hover:bg-foreground/10 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="text-[10px] font-bold">Apply</span>
            </Link>
          </div>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-[11px] font-medium">{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span className="text-[11px] font-bold">{job.count} Views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneralAdsSection() {
  return (
    <section className="py-16 bg-brand-blue-muted/10">
      <div className="container-site">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              General Ads & Opportunities
            </h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              Quickly browse and connect with employers for the latest job openings across various industries.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:underline whitespace-nowrap"
          >
            Explore all ads
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredJobs.map((job) => (
            <GeneralAdCard key={job.id} job={job} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-white text-brand-blue border border-brand-blue/20 hover:bg-brand-blue-muted px-8 py-3.5 rounded-2xl transition-all font-bold shadow-sm"
          >
            Load More <Plus className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}
