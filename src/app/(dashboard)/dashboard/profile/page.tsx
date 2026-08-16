"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Building, ImagePlus, Globe } from "lucide-react";
import { getMyCompany, updateMyCompany, ApiError, resolveImageUrl } from "@/lib/api";
import CityAutocomplete, { toLocationValue, type LocationValue } from "@/components/common/CityAutocomplete";

export default function CompanyProfilePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [jobLocation, setJobLocation] = useState<LocationValue | null>(null);

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const company = await getMyCompany();
      if (company) {
        setName(company.name);
        setDescription(company.description ?? "");
        setWebsite(company.website ?? "");
        setJobLocation(toLocationValue(company.jobLocation));
        if (company.logo) setLogoPreview(resolveImageUrl(company.logo));
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load company profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogoChange = (file: File | null) => {
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : logoPreview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobLocation) {
      toast.error("Please select your location.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateMyCompany({
        name,
        description: description || undefined,
        website: website || undefined,
        jobLocationId: jobLocation.id,
        logo: logo ?? undefined,
      });
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save company profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
        Loading company profile...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Shown to candidates on your job posts. Location is required — it controls which candidates can find you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-border/60 shadow-sm p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Company Logo</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
          />
          {logoPreview ? (
            <div className="relative w-24 h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoPreview} alt="Company logo preview" className="w-24 h-24 object-cover rounded-2xl border border-border/60" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-white text-foreground text-xs font-bold px-2 py-1 rounded-full border border-border/60 hover:bg-secondary"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 flex flex-col items-center justify-center gap-1 rounded-2xl bg-secondary/30 border-2 border-dashed border-brand-blue/40 hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-muted-foreground hover:text-brand-blue"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-[10px] font-bold">Upload</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
            <Building className="w-4 h-4" /> Company Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            type="text"
            placeholder="e.g. Acme Facilities Management"
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What your company does, what candidates should know..."
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Website (optional)
          </label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            type="url"
            placeholder="https://www.example.com"
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground/80">Location *</label>
          <CityAutocomplete value={jobLocation} onChange={setJobLocation} required />
          <p className="text-xs text-muted-foreground">Candidates near this location will be prioritized for your job posts.</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-brand-blue text-white font-black shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-medium transition-all disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : "Save Company Profile"}
        </button>
      </form>
    </div>
  );
}
