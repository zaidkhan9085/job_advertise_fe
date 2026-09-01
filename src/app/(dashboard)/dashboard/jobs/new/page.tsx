"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Mail,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createJob,
  getMyCompany,
  getJobTypes,
  getIndustries,
  ApiError,
  type JobType,
  type Industry,
} from "@/lib/api";
import CityAutocomplete, { type LocationValue } from "@/components/common/CityAutocomplete";
import PhoneInput from "@/components/common/PhoneInput";
import SearchableSelect from "@/components/common/SearchableSelect";

export default function PostJobPage() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"General" | "Premium">("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCompany, setIsCheckingCompany] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isFreeRecruitment, setIsFreeRecruitment] = useState(false);

  const [jobLocation, setJobLocation] = useState<LocationValue | null>(null);

  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobTypeId, setJobTypeId] = useState("");

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryId, setIndustryId] = useState("");

  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFormData = useCallback(async () => {
    setIsCheckingCompany(true);
    try {
      const company = await getMyCompany();
      if (!company) {
        toast.error("Complete your company profile before posting a job.");
        router.push("/dashboard/profile");
        return;
      }
      const [jobTypeData, industryData] = await Promise.all([
        getJobTypes(),
        getIndustries(),
      ]);
      setJobTypes(jobTypeData);
      setIndustries(industryData);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load the posting form.");
    } finally {
      setIsCheckingCompany(false);
    }
  }, [router]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

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
        description: fullDescription || undefined,
        type: listingType === "Premium" ? "FEATURED" : "NORMAL",
        contactPhone: contactPhone || undefined,
        contactWhatsapp,
        contactEmail,
        isFreeRecruitment,
        jobLocationId: jobLocation?.id || undefined,
        jobTypeId: jobTypeId || undefined,
        industryId: industryId || undefined,
        poster: poster || undefined,
      });

      toast.success(result.message);
      router.push("/dashboard/jobs");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isCheckingCompany) {
    return (
      <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-blue transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Post a Job</h1>
            <p className="text-muted-foreground mt-1 text-base font-medium">
              Submitted jobs go to an admin for approval before they appear on the site.
            </p>
          </div>
        </div>

        <div className="bg-muted/30 p-1 rounded-2xl flex items-center border border-border/40 shadow-inner w-full sm:w-auto sm:min-w-[280px]">
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
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                required
                type="text"
                placeholder="e.g. Senior Site Engineer"
                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
              />
              <div className="text-xs text-muted-foreground text-right">{title.length}/100</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">
                <MapPin className="w-4 h-4" /> Job Location (optional)
              </label>
              <CityAutocomplete value={jobLocation} onChange={setJobLocation} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Industry (optional)</label>
              <SearchableSelect
                value={industryId}
                onChange={setIndustryId}
                options={industries.map((i) => ({ value: i.id, label: i.name }))}
                placeholder="Search and select an industry..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Type (optional)</label>
              <select
                value={jobTypeId}
                onChange={(e) => setJobTypeId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
              >
                <option value="">Not specified</option>
                {jobTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Free Recruitment</label>
              <select
                value={isFreeRecruitment ? "yes" : "no"}
                onChange={(e) => setIsFreeRecruitment(e.target.value === "yes")}
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              <p className="text-xs text-muted-foreground">Shown as a badge to candidates if the candidate pays nothing.</p>
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
          <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Recruiter Details</h2>
          <p className="text-sm text-muted-foreground -mt-4">Shown as Call/WhatsApp/Email buttons on the job listing.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Calling Number</label>
              <PhoneInput value={contactPhone} onChange={setContactPhone} placeholder="234 567 890" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">WhatsApp Number *</label>
              <PhoneInput value={contactWhatsapp} onChange={setContactWhatsapp} placeholder="234 567 890" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="hr@company.com"
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
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Job Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                rows={6}
                placeholder="Include job responsibilities, requirements, salary benefits, duty hours, and contract details."
                className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">{description.length}/1000</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">Requirements (optional)</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
                placeholder="List requirements..."
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
