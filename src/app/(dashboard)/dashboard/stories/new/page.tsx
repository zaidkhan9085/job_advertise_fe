"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Clock, ImagePlus, Phone, MessageSquare, Zap } from "lucide-react";
import { createJob, ApiError, type StoryTag } from "@/lib/api";

const STORY_TAGS: StoryTag[] = ["Long Term", "Short Term", "Urgent", "Contract"];

export default function PostStoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [tag, setTag] = useState<StoryTag>("Long Term");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");

  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePosterChange = (file: File | null) => {
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
        location: location || "Remote",
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
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

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
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            type="text"
            placeholder="e.g. Mumbai, Delhi..."
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
          />
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </label>
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              type="tel"
              placeholder="e.g. +919876543210"
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Number
            </label>
            <input
              value={contactWhatsapp}
              onChange={(e) => setContactWhatsapp(e.target.value)}
              type="tel"
              placeholder="e.g. +919876543210"
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
            />
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
