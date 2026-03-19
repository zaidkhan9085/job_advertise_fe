"use client";

import React from "react";
import { X, PackageSearch, ArrowRight, Zap, Layout } from "lucide-react";
import Link from "next/link";

interface GatedFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GatedFeatureModal({ isOpen, onClose }: GatedFeatureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 ml-0 md:ml-0 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 border border-white/20 shadow-[0_32px_80px_-15px_rgba(0,0,0,0.3)] text-center space-y-8 animate-in zoom-in-95 fade-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-24 h-24 rounded-[2rem] bg-brand-blue/10 flex items-center justify-center text-brand-blue mx-auto shadow-inner relative z-10">
          <PackageSearch className="w-12 h-12" />
        </div>

        <div className="space-y-4 relative z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">No Active Package</h1>
          <p className="text-slate-500 font-medium leading-relaxed px-4">
            You need an active package to post jobs.
          </p>
        </div>

        <div className="pt-2 relative z-10">
          <Link 
            href="/pricing"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-brand-blue text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-blue/25 hover:bg-brand-blue-medium hover:scale-[1.02] active:scale-95 transition-all group"
          >
            View Packages
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-6 opacity-40 group-hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              <Zap className="w-3.5 h-3.5" /> Priority
           </div>
           <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              <Layout className="w-3.5 h-3.5" /> Analytics
           </div>
        </div>
      </div>
    </div>
  );
}
