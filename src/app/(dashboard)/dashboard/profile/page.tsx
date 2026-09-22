"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Building, ImagePlus, Globe, KeyRound, Users, Star, Sparkles, Info, Link2, ArrowUpRight, ImageIcon } from "lucide-react";
import {
  getMyCompany,
  updateMyCompany,
  getMe,
  getIndustries,
  ApiError,
  resolveImageUrl,
  COMPANY_SIZE_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  type MyCompany,
  type Industry,
  type CompanySize,
  type CompanyType,
} from "@/lib/api";
import CityAutocomplete, { toLocationValue, type LocationValue } from "@/components/common/CityAutocomplete";
import SearchableSelect from "@/components/common/SearchableSelect";
import TagListInput from "@/components/dashboard/TagListInput";
import ChangePasswordDialog from "@/components/common/ChangePasswordDialog";
import { validateFileSize } from "@/lib/fileValidation";

const TAGLINE_MAX = 140;
const DESCRIPTION_MAX = 2000;

// Shared card chrome for each section of the form -- gives the page the
// same "one focused card per topic" structure as the Post Job form instead
// of one long undifferentiated block.
function FormSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Building;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-border/60 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-border/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-black text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6 sm:p-8 space-y-6">{children}</div>
    </div>
  );
}

// No `truncate` here (unlike the old single-field version) -- this class
// is now shared with the description <textarea>, where truncating to one
// line would hide everything typed past it.
const inputClass =
  "w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium";
const labelClass = "text-sm font-bold text-foreground/80 flex items-center gap-2";

export default function CompanyProfilePage() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [jobLocation, setJobLocation] = useState<LocationValue | null>(null);

  const [tagline, setTagline] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [companyType, setCompanyType] = useState<CompanyType | "">("");
  const [foundedYear, setFoundedYear] = useState("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [stats, setStats] = useState<Pick<MyCompany, "followerCount" | "averageRating" | "ratingCount"> | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [company, industryList] = await Promise.all([getMyCompany(), getIndustries()]);
      setIndustries(industryList);
      if (company) {
        setCompanyId(company.id);
        setName(company.name);
        setDescription(company.description ?? "");
        setWebsite(company.website ?? "");
        setJobLocation(toLocationValue(company.jobLocation));
        setTagline(company.tagline ?? "");
        setIndustryId(company.industryId ?? "");
        setCompanySize(company.companySize ?? "");
        setCompanyType(company.companyType ?? "");
        setFoundedYear(company.foundedYear ? String(company.foundedYear) : "");
        setBenefits(company.benefits);
        setLinkedinUrl(company.linkedinUrl ?? "");
        setFacebookUrl(company.facebookUrl ?? "");
        setInstagramUrl(company.instagramUrl ?? "");
        if (company.logo) setLogoPreview(resolveImageUrl(company.logo));
        if (company.coverImage) setCoverPreview(resolveImageUrl(company.coverImage));
        setStats({ followerCount: company.followerCount, averageRating: company.averageRating, ratingCount: company.ratingCount });
      } else {
        // No Company row yet (fresh employer) -- prefill the name they
        // already gave at registration instead of asking again.
        const me = await getMe();
        setName(me.full_name ?? "");
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

  const handleImageChange = (file: File | null, setFile: (f: File | null) => void, setPreview: (p: string | null) => void, previous: string | null) => {
    if (file) {
      const error = validateFileSize(file);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setFile(file);
    setPreview(file ? URL.createObjectURL(file) : previous);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a company name.");
      return;
    }
    if (!jobLocation) {
      toast.error("Please select your location.");
      return;
    }
    if (foundedYear && (Number(foundedYear) < 1800 || Number(foundedYear) > new Date().getFullYear())) {
      toast.error("Enter a valid founded year.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateMyCompany({
        name: name.trim(),
        description: description.trim() || undefined,
        website: website.trim() || undefined,
        jobLocationId: jobLocation.id,
        tagline: tagline.trim() || undefined,
        industryId: industryId || undefined,
        companySize: companySize || undefined,
        companyType: companyType || undefined,
        foundedYear: foundedYear ? Number(foundedYear) : undefined,
        benefits,
        linkedinUrl: linkedinUrl.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        logo: logo ?? undefined,
        coverImage: coverImage ?? undefined,
      });
      setCompanyId(result.company.id);
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
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Shown to candidates on your job posts and public company page. Only Company Name and Location are required
            — everything else is optional but helps candidates trust and choose you.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsChangePasswordOpen(true)}
          className="self-start shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border/60 bg-white text-sm font-bold text-foreground hover:bg-secondary/60 transition-colors"
        >
          <KeyRound className="w-4 h-4" /> Change Password
        </button>
      </div>

      {isChangePasswordOpen && <ChangePasswordDialog onClose={() => setIsChangePasswordOpen(false)} />}

      {stats && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 bg-white rounded-2xl border border-border/60 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-foreground">{stats.followerCount}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Followers</div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:border-l sm:border-border/60 sm:pl-6">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-foreground">
                {stats.averageRating.toFixed(1)} <span className="text-xs font-bold text-muted-foreground">({stats.ratingCount})</span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rating</div>
            </div>
          </div>
          {companyId && (
            <Link
              href={`/companies/${companyId}`}
              target="_blank"
              className="sm:ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:underline"
            >
              View public page <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection icon={ImageIcon} title="Branding" subtitle="Your logo, cover photo and one-line pitch.">
          {/* Cover image behind the overlapping logo, mirroring how they'll
              actually appear together on the public company page. */}
          <div className="space-y-2">
            <label className={labelClass}>Cover Image</label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null, setCoverImage, setCoverPreview, coverPreview)}
            />
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative h-32 rounded-2xl bg-secondary/30 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/60 transition-all cursor-pointer overflow-hidden bg-cover bg-center group"
              style={coverPreview ? { backgroundImage: `url(${coverPreview})` } : undefined}
            >
              {!coverPreview && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground group-hover:text-brand-blue transition-colors">
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs font-bold">Upload a cover photo</span>
                </div>
              )}
              {coverPreview && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold transition-opacity">Change</span>
                </div>
              )}

              <div className="absolute -bottom-6 left-6 w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center shrink-0">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Company logo preview" className="w-full h-full object-contain p-1.5" />
                ) : (
                  <Building className="w-7 h-7 text-brand-blue/40" />
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            <label className={labelClass}>Company Logo</label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null, setLogo, setLogoPreview, logoPreview)}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              {logoPreview ? "Change logo" : "Upload logo"}
            </button>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Tagline</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value.slice(0, TAGLINE_MAX))}
              type="text"
              placeholder="e.g. Trusted Gulf recruitment partner since 1998"
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground text-right">{tagline.length}/{TAGLINE_MAX}</p>
          </div>
        </FormSection>

        <FormSection icon={Info} title="Basic Info">
          <div className="space-y-2">
            <label className={labelClass}>
              <Building className="w-4 h-4" /> Company Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              type="text"
              placeholder="e.g. Acme Facilities Management"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Location *</label>
            <CityAutocomplete value={jobLocation} onChange={setJobLocation} required />
            <p className="text-xs text-muted-foreground">Candidates near this location will be prioritized for your job posts.</p>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>About / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
              rows={5}
              placeholder="What your company does, what candidates should know..."
              className={`${inputClass} resize-none`}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/{DESCRIPTION_MAX}</p>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              <Globe className="w-4 h-4" /> Website
            </label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              type="url"
              placeholder="https://www.example.com"
              className={inputClass}
            />
          </div>
        </FormSection>

        <FormSection icon={Sparkles} title="Company Details" subtitle="Helps candidates understand who they'd be working with.">
          <div className="space-y-2">
            <SearchableSelect
              label="Industry"
              placeholder="Search and select an industry..."
              value={industryId}
              onChange={setIndustryId}
              options={industries.map((i) => ({ value: i.id, label: i.name }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Company Type</label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value as CompanyType | "")}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Not specified</option>
                {COMPANY_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value as CompanySize | "")}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Not specified</option>
                {COMPANY_SIZE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 max-w-50">
            <label className={labelClass}>Founded Year</label>
            <input
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1998"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Benefits &amp; Perks</label>
            <TagListInput values={benefits} onChange={setBenefits} placeholder="e.g. Free Visa, Medical Insurance..." />
          </div>
        </FormSection>

        <FormSection icon={Link2} title="Social Links">
          <div className="space-y-2">
            <label className={labelClass}>LinkedIn</label>
            <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} type="url" placeholder="https://linkedin.com/company/..." className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Facebook</label>
            <input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} type="url" placeholder="https://facebook.com/..." className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Instagram</label>
            <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} type="url" placeholder="https://instagram.com/..." className={inputClass} />
          </div>
        </FormSection>

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
