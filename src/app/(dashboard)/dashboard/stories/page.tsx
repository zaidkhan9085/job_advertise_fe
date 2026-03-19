"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  PlayCircle, 
  ArrowRight, 
  AlertCircle,
  PackageSearch,
  Zap,
  Layout
} from "lucide-react";

export default function StoriesPage() {
  // Mock check for active package - defaulting to false as per user request flow
  const [hasActivePackage, setHasActivePackage] = useState(false);

  if (!hasActivePackage) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 border border-border/40 shadow-[0_20px_60px_-15px_rgba(30,58,138,0.1)] text-center space-y-8 relative overflow-hidden group">
          {/* Decorative Background Element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-colors duration-700" />
          
          <div className="w-24 h-24 rounded-3xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mx-auto relative z-10 shadow-inner">
            <PackageSearch className="w-12 h-12" />
          </div>

          <div className="space-y-4 relative z-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">No Active Package</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              You need an active package to post jobs.
            </p>
          </div>

          <div className="pt-4 relative z-10">
            <Link 
              href="/pricing"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-blue text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-blue/25 hover:bg-brand-blue-medium hover:scale-[1.02] active:scale-95 transition-all group"
            >
              View Packages
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-6 opacity-40 group-hover:opacity-100 transition-opacity relative z-10">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                <Zap className="w-3 h-3" /> Priority Listing
             </div>
             <div className="w-1 h-1 rounded-full bg-slate-300" />
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                <Layout className="w-3 h-3" /> Dashboard Analytics
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Future implementation for when they have a package
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Manage Stories</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Create engaging video or image stories for your job openings.</p>
        </div>
        <button className="px-6 py-3 bg-brand-blue text-white rounded-2xl font-black text-sm uppercase tracking-widest">
          + Create Story
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
         {/* Placeholder for stories list */}
         <div className="aspect-[9/16] rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-slate-300" />
         </div>
      </div>
    </div>
  );
}
