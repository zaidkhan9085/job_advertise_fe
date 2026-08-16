"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ImagePlus,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Building2,
  Globe2,
  Plane,
  Calendar,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getRegions,
  getMyCandidateProfile,
  createCandidateProfile,
  updateCandidateProfile,
  resolveImageUrl,
  ApiError,
  type Region,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import PhoneInput from "@/components/common/PhoneInput";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function MyProfilePage() {
  const { user } = useAuth();

  const [regions, setRegions] = useState<Region[]>([]);
  const [isExisting, setIsExisting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [qualification, setQualification] = useState("");
  const [industry, setIndustry] = useState("");
  const [indianExp, setIndianExp] = useState("");
  const [gulfExp, setGulfExp] = useState("");
  const [nationality, setNationality] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [regionId, setRegionId] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [regionList, profile] = await Promise.all([getRegions(), getMyCandidateProfile()]);
      setRegions(regionList);
      if (profile) {
        setIsExisting(true);
        setName(profile.name ?? "");
        setPosition(profile.position ?? "");
        setWhatsapp(profile.whatsapp ?? "");
        setEmail(profile.email ?? "");
        setCurrentLocation(profile.currentLocation ?? "");
        setQualification(profile.qualification ?? "");
        setIndustry(profile.industry ?? "");
        setIndianExp(profile.indianExp ?? "");
        setGulfExp(profile.gulfExp ?? "");
        setNationality(profile.nationality ?? "");
        setPassportNo(profile.passportNo ?? "");
        setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "");
        setGender(profile.gender ?? "");
        setPreferredLocation(profile.preferredLocation ?? "");
        setRegionId(profile.regionId ?? "");
        if (profile.profileImage) setPhotoPreview(resolveImageUrl(profile.profileImage));
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completeness = useMemo(() => {
    const fields = [
      name,
      position,
      whatsapp,
      email,
      currentLocation,
      qualification,
      industry,
      indianExp,
      gulfExp,
      nationality,
      passportNo,
      dateOfBirth,
      gender,
      preferredLocation,
      regionId,
    ];
    const filled = fields.filter((f) => f.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [
    name,
    position,
    whatsapp,
    email,
    currentLocation,
    qualification,
    industry,
    indianExp,
    gulfExp,
    nationality,
    passportNo,
    dateOfBirth,
    gender,
    preferredLocation,
    regionId,
  ]);

  if (user && user.role !== "candidate") {
    return <ComingSoon title="My Profile" />;
  }

  const handlePhotoChange = (file: File | null) => {
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : photoPreview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regionId) {
      toast.error("Please select a region.");
      return;
    }

    const payload = {
      name,
      position,
      whatsapp,
      email,
      regionId,
      currentLocation: currentLocation || undefined,
      qualification: qualification || undefined,
      industry: industry || undefined,
      indianExp: indianExp || undefined,
      gulfExp: gulfExp || undefined,
      nationality: nationality || undefined,
      passportNo: passportNo || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      preferredLocation: preferredLocation || undefined,
      profileImage: photo ?? undefined,
    };

    setIsSubmitting(true);
    try {
      if (isExisting) {
        const result = await updateCandidateProfile(payload);
        toast.success(result.message);
      } else {
        const result = await createCandidateProfile(payload);
        toast.success(result.message);
        setIsExisting(true);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
        Loading your profile...
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm";
  const labelClass = "text-sm font-bold text-foreground/80 flex items-center gap-2";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Employers screen candidates by this information before opening a resume.
        </p>
      </div>

      {/* Completeness */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-foreground">Profile completeness</span>
          <span className="font-black text-brand-blue">{completeness}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-brand-blue rounded-full transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 flex items-center gap-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
          />
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Profile photo" className="w-20 h-20 rounded-full object-cover border border-border/60" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-2xl font-black">
              {name ? initials(name) : <User className="w-8 h-8" />}
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:underline"
            >
              <ImagePlus className="w-4 h-4" /> {photoPreview ? "Change photo" : "Upload photo"}
            </button>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WEBP.</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Basic Info</h2>
          <div className="space-y-2">
            <label className={labelClass}><User className="w-4 h-4" /> Full Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}><Phone className="w-4 h-4" /> WhatsApp *</label>
              <PhoneInput value={whatsapp} onChange={setWhatsapp} required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}><Mail className="w-4 h-4" /> Email *</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelClass}><MapPin className="w-4 h-4" /> Current Location</label>
            <input value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Professional Details</h2>
          <div className="space-y-2">
            <label className={labelClass}><Briefcase className="w-4 h-4" /> Position / Job Title *</label>
            <input value={position} onChange={(e) => setPosition(e.target.value)} required className={inputClass} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}><GraduationCap className="w-4 h-4" /> Qualification</label>
              <input value={qualification} onChange={(e) => setQualification(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}><Building2 className="w-4 h-4" /> Industry</label>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>India Experience</label>
              <input value={indianExp} onChange={(e) => setIndianExp(e.target.value)} placeholder="e.g. 3 years" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Gulf Experience</label>
              <input value={gulfExp} onChange={(e) => setGulfExp(e.target.value)} placeholder="e.g. 2 years" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Identity & Travel */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Identity & Travel</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}><Globe2 className="w-4 h-4" /> Nationality</label>
              <input value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}><Plane className="w-4 h-4" /> Passport No.</label>
              <input value={passportNo} onChange={(e) => setPassportNo(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}><Calendar className="w-4 h-4" /> Date of Birth</label>
              <input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Preferences</h2>
          <div className="space-y-2">
            <label className={labelClass}><MapPin className="w-4 h-4" /> Preferred Location</label>
            <input value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}><Globe2 className="w-4 h-4" /> Region *</label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              required
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="" disabled>Select your region</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-brand-blue text-white font-black shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-medium transition-all disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {/* Resume */}
      <Link
        href="/resume-builder"
        className="flex items-center justify-between bg-white rounded-2xl border border-border/60 shadow-sm p-6 hover:border-brand-blue/40 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-foreground">Resume</div>
            <div className="text-xs text-muted-foreground">Build or edit your resume separately</div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-blue transition-colors" />
      </Link>
    </div>
  );
}
