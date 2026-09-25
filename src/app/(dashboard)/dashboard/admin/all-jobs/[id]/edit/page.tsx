"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Mail, Zap, Loader2 } from "lucide-react";
import PhoneInput from "@/components/common/PhoneInput";
import {
  getJobByIdAdmin,
  updateJob,
  promoteJobToStory,
  getJobLocations,
  getJobTypes,
  getIndustries,
  ApiError,
  type JobPostType,
  type JobLocation,
  type JobType,
  type Industry,
  type StoryTag,
} from "@/lib/api";
import LocationPicker from "@/components/dashboard/LocationPicker";
import SearchableSelect from "@/components/common/SearchableSelect";

const STORY_TAGS: StoryTag[] = ["Long Term", "Short Term", "Urgent", "Contract"];

export default function AdminEditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<JobPostType>("NORMAL");
  // What the job actually started as, for typeOptions below -- stays fixed
  // for the whole edit session even after the admin changes the dropdown.
  const [originalType, setOriginalType] = useState<JobPostType>("NORMAL");
  // Story's own free-text tag (Long Term/Short Term/Urgent/Contract) --
  // separate from the regular JobType lookup below, which Stories don't use.
  // Needed so converting General -> Story here actually gets a real tag
  // instead of carrying over whatever JobType the General post happened to
  // have.
  const [storyTag, setStoryTag] = useState<StoryTag>("Long Term");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [locations, setLocations] = useState<JobLocation[]>([]);
  const [jobLocationId, setJobLocationId] = useState<string | null>(null);
  const [jobLocationLabel, setJobLocationLabel] = useState<string | null>(null);

  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobTypeId, setJobTypeId] = useState("");

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryId, setIndustryId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

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
      setOriginalType(job.type);
      setContactPhone(job.contactPhone ?? "");
      setContactWhatsapp(job.contactWhatsapp ?? "");
      setContactEmail(job.contactEmail ?? "");
      setJobLocationId(job.jobLocationId);
      setJobLocationLabel(job.location);
      setJobTypeId(job.jobTypeId ?? "");
      setIndustryId(job.industryId ?? "");
      if (job.type === "STORY" && job.tag && (STORY_TAGS as string[]).includes(job.tag)) {
        setStoryTag(job.tag as StoryTag);
      }
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

  const handlePromoteToStory = async () => {
    setIsPromoting(true);
    try {
      const result = await promoteJobToStory(params.id);
      toast.success(result.message);
      router.push(`/dashboard/admin/all-jobs/${result.story.id}/edit`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to post as a Story.");
    } finally {
      setIsPromoting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateJob(params.id, {
        title,
        description,
        type,
        tag: type === "STORY" ? storyTag : undefined,
        contactPhone: contactPhone || undefined,
        contactWhatsapp: contactWhatsapp || undefined,
        contactEmail: contactEmail || undefined,
        jobLocationId: jobLocationId || undefined,
        jobTypeId: jobTypeId || undefined,
        industryId: industryId || undefined,
      });
      toast.success(result.message);
      // This page is reachable from All Jobs, an Employer's own detail
      // page, and the Reports queue -- go back to whichever one the admin
      // actually came from, not always the All Jobs list.
      router.back();
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
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-blue transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
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
            <SearchableSelect
              value={industryId}
              onChange={setIndustryId}
              options={industries.map((i) => ({ value: i.id, label: i.name }))}
              placeholder="Search and select an industry..."
            />
          </div>
          {type === "STORY" ? (
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80">Story Tag</label>
              <select
                value={storyTag}
                onChange={(e) => setStoryTag(e.target.value as StoryTag)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
              >
                {STORY_TAGS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Shown as a tag on the story card -- Stories don&apos;t use the regular Job Type lookup.</p>
            </div>
          ) : (
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
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Ad Format</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as JobPostType)}
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
          >
            {/* Featured <-> General convert freely either way. Story isn't
                offered here at all -- getting a General post onto Stories
                is a separate "Promote to Story" action below that clones
                it instead, so the original never leaves General (see its
                own comment). An existing Story can't be converted away
                either -- it should run its normal 24h course or be deleted. */}
            {originalType === "STORY" ? (
              <option value="STORY">Story</option>
            ) : (
              <>
                <option value="NORMAL">General</option>
                <option value="FEATURED">Featured</option>
              </>
            )}
          </select>
        </div>

        {originalType === "NORMAL" && (
          <div className="rounded-2xl border border-dashed border-brand-blue/40 bg-brand-blue/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Also post this as a Story</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Creates a separate Story from this post&apos;s details — this General post stays exactly as it is.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePromoteToStory}
              disabled={isPromoting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-medium transition-colors disabled:opacity-60 shrink-0"
            >
              {isPromoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Post as Story
            </button>
          </div>
        )}

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
