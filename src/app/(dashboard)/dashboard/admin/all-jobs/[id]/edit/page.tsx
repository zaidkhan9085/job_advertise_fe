"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save, Phone, MessageSquare, Mail } from "lucide-react";
import { getJobByIdAdmin, updateJob, ApiError, type JobPostType } from "@/lib/api";

export default function AdminEditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<JobPostType>("NORMAL");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadJob = useCallback(async () => {
    setIsLoading(true);
    try {
      const job = await getJobByIdAdmin(params.id);
      setTitle(job.title);
      setCompany(job.company);
      setLocation(job.location);
      setDescription(job.description);
      setType(job.type);
      setContactPhone(job.contactPhone ?? "");
      setContactWhatsapp(job.contactWhatsapp ?? "");
      setContactEmail(job.contactEmail ?? "");
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
        company,
        location,
        description,
        type,
        contactPhone: contactPhone || undefined,
        contactWhatsapp: contactWhatsapp || undefined,
        contactEmail: contactEmail || undefined,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80">Company / Agency *</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
            />
          </div>
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
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-foreground/80">Location *</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Job Type</label>
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
          <label className="text-sm font-bold text-foreground/80">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            required
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                type="tel"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">WhatsApp</label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <input
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                type="tel"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
              />
            </div>
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
