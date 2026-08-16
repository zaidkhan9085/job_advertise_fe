"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save, Mail } from "lucide-react";
import PhoneInput from "@/components/common/PhoneInput";
import {
  getJobByIdAdmin,
  updateJob,
  getJobLocations,
  getJobTypes,
  getIndustries,
  ApiError,
  type JobPostType,
  type JobLocation,
  type JobType,
  type Industry,
} from "@/lib/api";
import LocationPicker from "@/components/dashboard/LocationPicker";

export default function AdminEditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<JobPostType>("NORMAL");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isFreeRecruitment, setIsFreeRecruitment] = useState(false);

  const [locations, setLocations] = useState<JobLocation[]>([]);
  const [jobLocationId, setJobLocationId] = useState<string | null>(null);
  const [jobLocationLabel, setJobLocationLabel] = useState<string | null>(null);

  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobTypeId, setJobTypeId] = useState("");

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryId, setIndustryId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadJob = useCallback(async () => {
    setIsLoading(true);
    try {
      const [job, locationData, jobTypeData, industryData] = await Promise.all([
        getJobByIdAdmin(params.id),
        getJobLocations(),
        getJobTypes(),
        getIndustries(),
      ]);
      setCompanyName(job.company);
      setTitle(job.title);
      setDescription(job.description);
      setType(job.type);
      setContactPhone(job.contactPhone ?? "");
      setContactWhatsapp(job.contactWhatsapp ?? "");
      setContactEmail(job.contactEmail ?? "");
      setIsFreeRecruitment(job.isFreeRecruitment);
      setJobLocationId(job.jobLocationId);
      setJobLocationLabel(job.location);
      setJobTypeId(job.jobTypeId ?? "");
      setIndustryId(job.industryId ?? "");
      setLocations(locationData);
      setJobTypes(jobTypeData);
      setIndustries(industryData);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load job.");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateJob(params.id, {
        title,
        description,
        type,
        contactPhone: contactPhone || undefined,
        contactWhatsapp: contactWhatsapp || undefined,
        contactEmail: contactEmail || undefined,
        isFreeRecruitment,
        jobLocationId: jobLocationId || undefined,
        jobTypeId: jobTypeId || undefined,
        industryId: industryId || undefined,
      });
      toast.success(result.message);
      router.push("/dashboard/admin/all-jobs");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save job.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
        Loading job...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-2">
        <Link href="/dashboard/admin/all-jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-blue transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to All Jobs
        </Link>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Edit Job</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Admin-only — full edit access to any posted job.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-border/60 shadow-sm p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Company</label>
          <input
            value={companyName}
            disabled
            type="text"
            title="Company is set from the employer's own Company Profile and can't be reassigned here"
            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border-2 border-transparent font-medium text-muted-foreground cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80">Job Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80">Location</label>
            <LocationPicker
              locations={locations}
              selectedLabel={jobLocationLabel}
              onSelect={(id, label) => {
                setJobLocationId(id);
                setJobLocationLabel(label);
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80">Industry</label>
            <select
              value={industryId}
              onChange={(e) => setIndustryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
            >
              <option value="">Other Industries</option>
              {industries.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80">Job Type</label>
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
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Ad Format</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as JobPostType)}
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
          >
            <option value="NORMAL">General</option>
            <option value="FEATURED">Featured</option>
            <option value="STORY">Story</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Free Recruitment</label>
          <select
            value={isFreeRecruitment ? "yes" : "no"}
            onChange={(e) => setIsFreeRecruitment(e.target.value === "yes")}
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Phone</label>
            <PhoneInput value={contactPhone} onChange={setContactPhone} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">WhatsApp</label>
            <PhoneInput value={contactWhatsapp} onChange={setContactWhatsapp} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                type="email"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-brand-blue text-white font-black shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-medium transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" /> {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
