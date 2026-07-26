"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Save,
  Info,
  BadgeCheck,
  Zap,
  ImagePlus,
  Phone,
  MessageSquare,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createJob, ApiError } from "@/lib/api";

export default function PostJobPage() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"General" | "Premium">("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePosterChange = (file: File | null) => {
    setPoster(file);
    setPosterPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullDescription = requirements
        ? `${description}\n\nRequirements:\n${requirements}`
        : description;

      const result = await createJob({
        title,
        company,
        location,
        description: fullDescription,
        type: listingType === "Premium" ? "FEATURED" : "NORMAL",
        contactPhone: contactPhone || undefined,
        contactWhatsapp: contactWhatsapp || undefined,
        contactEmail: contactEmail || undefined,
        poster: poster || undefined,
      });

      toast.success(result.message);
      router.push("/dashboard/jobs");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-blue transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Post a New Job</h1>
            <p className="text-muted-foreground mt-1 text-base font-medium">
              Submitted jobs go to an admin for approval before they appear on the site.
            </p>
          </div>
        </div>

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
            Featured
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl border border-border/60 shadow-sm overflow-hidden p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-border/40 pb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Job Basic Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Company / Agency *</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                type="text"
                placeholder="e.g. Acme Facilities Management"
                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                type="text"
                placeholder="e.g. Senior Site Engineer"
                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Location *</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                type="text"
                placeholder="e.g. Dubai, UAE"
                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Poster Image (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handlePosterChange(e.target.files?.[0] ?? null)}
              />
              {posterPreview ? (
                <div className="relative w-full max-w-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={posterPreview} alt="Poster preview" className="w-full rounded-2xl border border-border/60 object-cover" />
                  <button
                    type="button"
                    onClick={() => { handlePosterChange(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute top-2 right-2 bg-white/90 text-foreground text-xs font-bold px-3 py-1.5 rounded-full border border-border/60 hover:bg-white"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-xs flex flex-col items-center justify-center gap-2 py-8 rounded-2xl bg-secondary/30 border-2 border-dashed border-border/60 hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-muted-foreground hover:text-brand-blue"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-sm font-semibold">Upload a poster image</span>
                  <span className="text-xs">JPG, PNG, WebP</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-border/60 shadow-sm overflow-hidden p-8 space-y-6">
          <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Contact Details (optional)</h2>
          <p className="text-sm text-muted-foreground -mt-4">Shown as Call/WhatsApp/Email buttons on the job listing.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  type="tel"
                  placeholder="+1 234 567 890"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">WhatsApp</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  type="tel"
                  placeholder="+1 234 567 890"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  type="email"
                  placeholder="recruiter@company.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
                />
              </div>
            </div>
          </div>
        </div>

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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
                placeholder="Tell us more about the role..."
                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Requirements (optional)</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
                placeholder="Skills, qualifications, and experience needed..."
                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex-1 py-5 px-8 rounded-2xl bg-brand-blue text-white font-black text-xl shadow-xl shadow-brand-blue/25 hover:bg-brand-blue-medium hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Save className="w-6 h-6" /> Submit for Approval
              </>
            )}
          </button>
          <Link
            href="/dashboard/jobs"
            className="w-full sm:w-auto flex items-center justify-center py-4 px-8 rounded-2xl bg-white text-muted-foreground font-black uppercase tracking-widest text-xs border border-border/60 hover:bg-secondary transition-all"
          >
            Cancel
          </Link>
        </div>

        <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-5 flex gap-4">
          <Info className="w-6 h-6 text-brand-blue shrink-0 mt-1" />
          <p className="text-sm text-brand-blue font-medium leading-relaxed">
            Your job will appear as &ldquo;Pending&rdquo; on your Manage Jobs page until an admin approves it.
          </p>
        </div>
      </form>
    </div>
  );
}
