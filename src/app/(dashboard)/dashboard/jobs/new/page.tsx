"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Briefcase, 
  MapPin, 
  Building, 
  Save, 
  FileText, 
  Globe, 
  Phone, 
  MessageSquare, 
  Mail, 
  Upload,
  Info,
  BadgeCheck,
  Zap,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { industries } from "@/data/industries";

export default function PostJobPage() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"General" | "Premium">("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const newJob = {
      id: `job-${Date.now()}`,
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      type: formData.get("jobType") as string,
      postedAt: new Date().toISOString(),
      status: "Active",
      count: 0,
      listingType,
      entityType: formData.get("entityType") as string,
    };

    // Save to localStorage
    const savedJobs = JSON.parse(localStorage.getItem("recruiter-jobs") || "[]");
    localStorage.setItem("recruiter-jobs", JSON.stringify([newJob, ...savedJobs]));

    // Mock redirect
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard/jobs");
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Back */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-blue transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Post a New Job</h1>
            <p className="text-muted-foreground mt-1 text-base font-medium">Create a high-impact job listing to attract top global talent.</p>
          </div>
        </div>

        {/* General / Premium Toggle Tabs */}
        <div className="bg-muted/30 p-1 rounded-2xl flex items-center border border-border/40 shadow-inner min-w-[280px]">
          <button
            type="button"
            onClick={() => setListingType("General")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              listingType === "General" ? "bg-white text-brand-blue shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BadgeCheck className={`w-4 h-4 ${listingType === "General" ? "text-brand-blue" : "text-muted-foreground"}`} />
            General
          </button>
          <button
            type="button"
            onClick={() => setListingType("Premium")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              listingType === "Premium" ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className={`w-4 h-4 ${listingType === "Premium" ? "text-white" : "text-muted-foreground"}`} />
            Premium
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 space-y-8">
          {/* Card 1: Basic Details */}
          <div className="bg-white rounded-3xl border border-border/60 shadow-sm overflow-hidden p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-border/40 pb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Job Basic Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Company / Agency *</label>
                <div className="relative group">
                  <select 
                    name="entityType"
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled selected>Select Region / Category</option>
                    <option>East India</option>
                    <option>West India</option>
                    <option>North India</option>
                    <option>South India</option>
                    <option>Gulf / GCC</option>
                    <option>Europe Countries</option>
                    <option>Asia Countries</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-brand-blue transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Title *</label>
                <input name="title" required type="text" placeholder="e.g. Senior Site Engineer" className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Location *</label>
                <input name="location" required type="text" placeholder="e.g. Dubai, UAE" className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Industry *</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer">
                  {industries.map(ind => (
                    <option key={ind.id} value={ind.id}>{ind.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Type *</label>
                <select name="jobType" className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer">
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Temporary</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mt-auto shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div className="flex-1">
                  <label className="text-sm font-bold text-emerald-800 cursor-pointer flex items-center justify-between">
                    Free Recruitment
                    <input type="checkbox" className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 ml-4 cursor-pointer" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Job Content */}
          <div className="bg-white rounded-3xl border border-border/60 shadow-sm overflow-hidden p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-border/40 pb-5">
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.47_0.20_250)]/10 text-[oklch(0.47_0.20_250)] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Job Content</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Description *</label>
                <textarea 
                  rows={6} 
                  required
                  placeholder="Tell us more about the role..." 
                  className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Requirements *</label>
                <textarea 
                  rows={6} 
                  required
                  placeholder="Skills, qualifications, and experience needed..." 
                  className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none" 
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Upload Images (Optional)</label>
                <div className="relative group">
                  <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full py-12 rounded-2xl bg-muted/10 border-2 border-dashed border-border/60 group-hover:border-brand-blue group-hover:bg-brand-blue/5 transition-all text-center">
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3 group-hover:text-brand-blue transition-colors" />
                    <p className="text-base font-bold text-foreground/70">Drag and drop images here or browse</p>
                    <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG (Max 2MB per image)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Recruiter Details & Save */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
          
          {/* Card 3: Recruiter Details */}
          <div className="bg-white rounded-3xl border border-border/60 shadow-md overflow-hidden p-6 space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase tracking-widest border-b border-border/40 pb-4">Recruiter Details</h3>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Calling Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" placeholder="+1 234 567 890" className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">WhatsApp Number</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input type="tel" placeholder="+1 234 567 890" className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" placeholder="recruiter@company.com" className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="url" placeholder="https://www.company.com" className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 rounded-2xl bg-brand-blue text-white font-black text-xl shadow-xl shadow-brand-blue/25 hover:bg-brand-blue-medium hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>Saving Listing...</>
              ) : (
                <>
                  <Save className="w-6 h-6" /> Save & Publish
                </>
              )}
            </button>
            <Link 
              href="/dashboard/jobs"
              className="w-full flex items-center justify-center py-4 rounded-2xl bg-white text-muted-foreground font-black uppercase tracking-widest text-xs border border-border/60 hover:bg-secondary transition-all"
            >
              Discard Draft
            </Link>
          </div>

          {/* Info Banner */}
          <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-5 flex gap-4">
            <Info className="w-6 h-6 text-brand-blue shrink-0 mt-1" />
            <p className="text-sm text-brand-blue font-medium leading-relaxed">
              Premium listings stay at the top for 30 days and get verified badges to increase candidate trust.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
