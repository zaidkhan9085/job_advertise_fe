"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Clock, ImagePlus, Phone, MessageSquare, Zap, Crown, Loader2 } from "lucide-react";
import { createJob, getMyBilling, ApiError, type StoryTag } from "@/lib/api";
import PhoneInput from "@/components/common/PhoneInput";
import CityAutocomplete, { type LocationValue } from "@/components/common/CityAutocomplete";
import { validateFileSize } from "@/lib/fileValidation";

const STORY_TAGS: StoryTag[] = ["Long Term", "Short Term", "Urgent", "Contract"];

// Checked once on mount rather than only at submit -- letting a Free-plan
// employer fill in a title, upload an image, and pick contact numbers just
// to get blocked at the very end (the old behavior) wastes their time for
// no reason; the plan gate is knowable up front.
function useStoriesAllowed() {
  const [status, setStatus] = useState<"checking" | "blocked" | "allowed">("checking");

  useEffect(() => {
    getMyBilling()
      .then((billing) => setStatus(billing.plan.storiesAllowed ? "allowed" : "blocked"))
      .catch(() => setStatus("allowed")); // fail open -- a billing-check hiccup shouldn't block a Pro employer who's actually entitled; the real createJob call still enforces this server-side regardless.
  }, []);

  return status;
}

function StoriesBlockedNotice() {
  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-500">
      <Link href="/dashboard/stories" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-blue transition-colors w-fit mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="bg-white rounded-3xl border border-border/60 shadow-sm p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
          <Crown className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">Stories are a Pro feature</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your current plan doesn&apos;t include Stories. Upgrade to Pro to post one — it also raises your
            featured and general job posting limits.
          </p>
        </div>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white font-black hover:bg-brand-blue-medium transition-colors"
        >
          <Crown className="w-4 h-4" /> Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}

export default function PostStoryPage() {
  const router = useRouter();
  const storiesAllowed = useStoriesAllowed();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [tag, setTag] = useState<StoryTag>("Long Term");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");

  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePosterChange = (file: File | null) => {
    if (file) {
      const error = validateFileSize(file);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setPoster(file);
    setPosterPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!poster) {
      toast.error("A story image is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createJob({
        title,
        jobLocationId: location?.id,
        description,
        type: "STORY",
        tag,
        contactPhone: contactPhone || undefined,
        contactWhatsapp: contactWhatsapp || undefined,
        poster,
      });

      toast.success(result.message);
      router.push("/dashboard/stories");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      const code = err instanceof ApiError ? (err.body as { code?: string } | undefined)?.code : undefined;
      if (code === "PLAN_LIMIT_REACHED") {
        toast.error(message, { action: { label: "Upgrade to Pro", onClick: () => router.push("/dashboard/billing") } });
      } else {
        toast.error(message);
      }
      setIsSubmitting(false);
    }
  };

  if (storiesAllowed === "checking") {
    return (
      <div className="max-w-xl mx-auto py-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (storiesAllowed === "blocked") {
    return <StoriesBlockedNotice />;
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-2">
        <Link href="/dashboard/stories" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-blue transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Post a Story</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Stories disappear after 24 hours
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-border/60 shadow-sm p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
            Story Image <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground">Stories need an eye-catching image. This is what people see first.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handlePosterChange(e.target.files?.[0] ?? null)}
          />
          {posterPreview ? (
            <div className="relative w-full max-w-[200px] mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterPreview} alt="Story preview" className="w-full aspect-9/16 object-cover rounded-2xl border border-border/60" />
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
              className="w-full max-w-[200px] mx-auto aspect-9/16 flex flex-col items-center justify-center gap-2 rounded-2xl bg-secondary/30 border-2 border-dashed border-brand-blue/40 hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-muted-foreground hover:text-brand-blue"
            >
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm font-bold">Tap to upload image</span>
              <span className="text-xs">Max 5MB &bull; JPG, PNG, WebP</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            required
            type="text"
            placeholder="e.g. We're Hiring Sales Executives!"
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
          />
          <div className="text-xs text-muted-foreground text-right">{title.length}/100</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 300))}
            rows={3}
            placeholder="Brief info about the role..."
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">{description.length}/300</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Location (optional)</label>
          <CityAutocomplete value={location} onChange={setLocation} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Job Type *</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as StoryTag)}
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
          >
            {STORY_TAGS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Shown as a tag on the story card.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </label>
            <PhoneInput value={contactPhone} onChange={setContactPhone} placeholder="98765 43210" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Number
            </label>
            <PhoneInput value={contactWhatsapp} onChange={setContactWhatsapp} placeholder="98765 43210" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground -mt-4">These numbers will show as Call & WhatsApp buttons on your story.</p>

        <div className="bg-secondary/30 rounded-2xl p-5 space-y-2">
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-brand-blue" /> How Stories Work
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Stories appear on the homepage for <strong>24 hours</strong></li>
            <li>Only <strong>1 story at a time</strong> per employer</li>
            <li>Upload a poster image to grab attention</li>
            <li>Stories are separate from Standard & Highlighted job ads</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-brand-blue text-white font-black shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-medium transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" /> {isSubmitting ? "Posting..." : "Post Story"}
        </button>
      </form>
    </div>
  );
}
