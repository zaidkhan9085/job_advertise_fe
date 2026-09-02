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
  Building2,
  Globe2,
  Plane,
  Calendar,
  FileText,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Upload,
  FileCheck2,
  ExternalLink,
  Loader2,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getMyCandidateProfile,
  createCandidateProfile,
  updateCandidateProfile,
  uploadCandidateResume,
  parseCandidateResume,
  resolveImageUrl,
  ApiError,
  type ProfileEntry,
  type ParsedResumeData,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import PhoneInput from "@/components/common/PhoneInput";
import CityAutocomplete, { toLocationValue, type LocationValue } from "@/components/common/CityAutocomplete";
import TagListInput from "@/components/dashboard/TagListInput";
import ProfileEntryList from "@/components/dashboard/ProfileEntryList";
import EducationEntryList from "@/components/dashboard/EducationEntryList";
import SimpleSelect from "@/components/common/SimpleSelect";
import ChangePasswordDialog from "@/components/common/ChangePasswordDialog";

// 0-40 years covers the realistic working-life range for this platform's
// audience — a plain dropdown (not free text) so the ATS min-max experience
// filter has a clean number to query against.
const EXPERIENCE_YEAR_OPTIONS = Array.from({ length: 41 }, (_, i) => i);
const EXPERIENCE_YEAR_SELECT_OPTIONS = EXPERIENCE_YEAR_OPTIONS.map((y) => ({
  value: String(y),
  label: `${y} ${y === 1 ? "year" : "years"}`,
}));
const GENDER_SELECT_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

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

  const [isExisting, setIsExisting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [jobLocation, setJobLocation] = useState<LocationValue | null>(null);
  const [industry, setIndustry] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | "">("");
  const [isFresher, setIsFresher] = useState(false);
  const [nationality, setNationality] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [preferredLocation, setPreferredLocation] = useState<LocationValue | null>(null);

  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<ProfileEntry[]>([]);
  const [education, setEducation] = useState<ProfileEntry[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProfileEntry[]>([]);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await getMyCandidateProfile();
      if (profile) {
        setIsExisting(true);
        setName(profile.name ?? "");
        setPosition(profile.position ?? "");
        setWhatsapp(profile.whatsapp ?? "");
        setEmail(profile.email ?? "");
        setJobLocation(toLocationValue(profile.jobLocation));
        setIndustry(profile.industry ?? "");
        setExperienceYears(profile.experienceYears ?? "");
        setIsFresher(profile.isFresher ?? false);
        setNationality(profile.nationality ?? "");
        setPassportNo(profile.passportNo ?? "");
        setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "");
        setGender(profile.gender ?? "");
        setPreferredLocation(toLocationValue(profile.preferredLocation));
        setSummary(profile.summary ?? "");
        setSkills(profile.skills ?? []);
        setExperience(profile.experience ?? []);
        setEducation(profile.education ?? []);
        setCertifications(profile.certifications ?? []);
        setProjects(profile.projects ?? []);
        setResumeUrl(profile.resumeUrl ?? null);
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

  // Professional sections weigh into completeness alongside the original
  // fields — each is either present or not, same "count what's filled"
  // approach as before, just extended to cover the new sections.
  const { completeness, missingSections } = useMemo(() => {
    const fields = [
      name,
      position,
      whatsapp,
      email,
      industry,
      nationality,
      passportNo,
      dateOfBirth,
      gender,
    ];
    // isFresher is as much a real answer as a number -- "I have no
    // experience yet" isn't an unfilled field.
    const experienceAnswered = isFresher || experienceYears !== "";
    const sectionChecks = [
      { label: "Professional Summary", filled: summary.trim().length > 0 },
      { label: "Skills", filled: skills.length > 0 },
      { label: "Experience", filled: experience.length > 0 },
      { label: "Education", filled: education.length > 0 },
      { label: "Certifications", filled: certifications.length > 0 },
      { label: "Projects", filled: projects.length > 0 },
    ];
    const sectionsFilled = sectionChecks.filter((s) => s.filled).length;
    const filled =
      fields.filter((f) => f.trim().length > 0).length +
      (jobLocation ? 1 : 0) +
      (preferredLocation ? 1 : 0) +
      (experienceAnswered ? 1 : 0) +
      sectionsFilled;
    return {
      completeness: Math.round((filled / (fields.length + 3 + sectionChecks.length)) * 100),
      missingSections: sectionChecks.filter((s) => !s.filled).map((s) => s.label),
    };
  }, [
    name,
    position,
    whatsapp,
    email,
    industry,
    nationality,
    passportNo,
    dateOfBirth,
    gender,
    preferredLocation,
    jobLocation,
    experienceYears,
    isFresher,
    summary,
    skills,
    experience,
    education,
    certifications,
    projects,
  ]);

  if (user && user.role !== "candidate") {
    return <ComingSoon title="My Profile" />;
  }

  const handlePhotoChange = (file: File | null) => {
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : photoPreview);
  };

  // Pre-fills parsed resume data into the form — ONLY fields/sections that
  // are currently empty. A field the candidate has already typed something
  // into, or a section that already has entries, is left completely alone.
  // Each new resume upload is treated as the current source of truth: any
  // field/section the parse actually found data for replaces whatever was
  // there before (including a previous resume's parsed data or hand-typed
  // edits), so re-uploading an updated resume doesn't leave stale fields
  // mixed in with the new ones. A field the parse found nothing for is left
  // untouched rather than blanked out — Gemini not mentioning e.g. WhatsApp
  // isn't a signal to erase it.
  const applyParsedData = (parsed: ParsedResumeData) => {
    if (parsed.name) setName(parsed.name);
    if (parsed.position) setPosition(parsed.position);
    if (parsed.whatsapp) setWhatsapp(parsed.whatsapp);
    if (parsed.email) setEmail(parsed.email);
    if (parsed.industry) setIndustry(parsed.industry);
    if (parsed.isFresher) setIsFresher(true);
    if (parsed.totalExperienceYears != null) setExperienceYears(parsed.totalExperienceYears);
    if (parsed.summary) setSummary(parsed.summary);
    if (parsed.skills.length > 0) setSkills(parsed.skills);
    if (parsed.certifications.length > 0) setCertifications(parsed.certifications);
    // Gemini doesn't return an `id` (these are freshly extracted, not yet
    // real entries) — assign one here, same as ProfileEntryList's own "add
    // entry" already does.
    if (parsed.experience.length > 0) {
      setExperience(parsed.experience.map((e, i) => ({ ...e, id: `parsed-${Date.now()}-${i}` })));
    }
    if (parsed.education.length > 0) {
      setEducation(parsed.education.map((e, i) => ({ ...e, id: `parsed-${Date.now()}-${i}` })));
    }
    if (parsed.projects.length > 0) {
      setProjects(parsed.projects.map((e, i) => ({ ...e, id: `parsed-${Date.now()}-${i}` })));
    }
    // currentLocation is deliberately not applied — it's raw text as
    // written on the resume, not a validated match against the worldwide
    // location picker, so auto-selecting from it risks picking the wrong
    // place. The candidate picks their location themselves either way.
  };

  const handleResumeFileChange = async (file: File | null) => {
    if (!file) return;
    setIsUploadingResume(true);
    try {
      const result = await uploadCandidateResume(file);
      setResumeUrl(result.resumeUrl);
      // A profile row now exists either way (the backend auto-creates a
      // minimal one on first upload if the candidate hadn't saved the form
      // yet) — without this, a subsequent "Save Profile" would wrongly
      // call createCandidateProfile and hit "Profile already exists".
      setIsExisting(true);
      toast.success("Resume uploaded");

      setIsParsingResume(true);
      try {
        const parseResult = await parseCandidateResume();
        applyParsedData(parseResult.parsed);
        toast.success("We've pre-filled your profile from your resume — please review before saving.");
      } catch (parseErr) {
        // Parsing is a best-effort assist on top of a successful upload —
        // a failure here shouldn't read as "the upload failed" (it didn't,
        // the file is safely attached), just that auto-fill isn't
        // available this time.
        toast.error(
          parseErr instanceof ApiError
            ? parseErr.message
            : "Couldn't read this resume automatically — please fill in your profile manually."
        );
      } finally {
        setIsParsingResume(false);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload resume.");
    } finally {
      setIsUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobLocation) {
      toast.error("Please select your current location.");
      return;
    }

    const payload = {
      name,
      position,
      whatsapp,
      email,
      jobLocationId: jobLocation.id,
      industry: industry || undefined,
      isFresher,
      experienceYears: isFresher ? 0 : experienceYears === "" ? undefined : experienceYears,
      nationality: nationality || undefined,
      passportNo: passportNo || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      preferredLocationId: preferredLocation?.id || undefined,
      summary: summary || undefined,
      skills,
      experience,
      education,
      certifications,
      projects,
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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Employers screen candidates by this information before opening a resume.
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

      {/* Resume upload — first step: upload once and most of the form
          below can pre-fill itself. Distinct from the Resume Builder link
          further down, which generates a separate formatted PDF. */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-3">
        <h2 className="font-black text-foreground text-sm uppercase tracking-wide">
          {resumeUrl ? "Resume File" : "Start with your resume"}
        </h2>
        <p className="text-xs text-muted-foreground -mt-1">
          {resumeUrl
            ? "Employers can view or download this directly."
            : "Upload your resume and we'll pre-fill your profile automatically — you can review and edit everything before saving. Or skip this and fill it in yourself below."}
        </p>
        <input
          ref={resumeInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => handleResumeFileChange(e.target.files?.[0] ?? null)}
        />
        {resumeUrl ? (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/30">
            <a
              href={resolveImageUrl(resumeUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-brand-blue hover:underline min-w-0"
            >
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span className="truncate">View uploaded resume</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <button
              type="button"
              onClick={() => resumeInputRef.current?.click()}
              disabled={isUploadingResume || isParsingResume}
              className="shrink-0 text-xs font-bold text-muted-foreground hover:text-brand-blue transition-colors disabled:opacity-50"
            >
              {isUploadingResume ? "Uploading..." : isParsingResume ? "Reading..." : "Replace"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => resumeInputRef.current?.click()}
            disabled={isUploadingResume || isParsingResume}
            className="w-full py-5 rounded-xl border-2 border-dashed border-brand-blue/40 hover:border-brand-blue hover:bg-brand-blue/5 transition-all flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-brand-blue disabled:opacity-60"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm font-bold">
              {isUploadingResume ? "Uploading..." : isParsingResume ? "Reading your resume..." : "Upload your resume"}
            </span>
            <span className="text-xs">PDF, DOC, or DOCX &middot; Max 5MB</span>
          </button>
        )}
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
        {missingSections.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-semibold text-muted-foreground">Missing:</span>
            {missingSections.map((label) => (
              <span key={label} className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        {/* Blocks editing every field while a resume is being uploaded or
            parsed — without this, typing during parsing races with
            applyParsedData's pre-fill (which now overwrites on every parse,
            not just empty fields), so a candidate's own in-progress edit
            could get silently clobbered the moment parsing finishes. */}
        {(isUploadingResume || isParsingResume) && (
          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            <p className="text-sm font-bold text-foreground">
              {isUploadingResume ? "Uploading your resume..." : "Reading your resume and filling your profile..."}
            </p>
            <p className="text-xs text-muted-foreground">Fields are locked until this finishes.</p>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          aria-busy={isUploadingResume || isParsingResume}
          inert={isUploadingResume || isParsingResume}
        >
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

        {/* Basic Info -- every field the profile hard-requires lives here,
            so filling just this one card and saving always works. */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Basic Info</h2>
          <div className="space-y-2">
            <label className={labelClass}><User className="w-4 h-4" /> Full Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={`${inputClass} truncate`} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}><Briefcase className="w-4 h-4" /> Position / Job Title *</label>
            <input value={position} onChange={(e) => setPosition(e.target.value)} required className={`${inputClass} truncate`} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}><Phone className="w-4 h-4" /> WhatsApp *</label>
              <PhoneInput value={whatsapp} onChange={setWhatsapp} required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}><Mail className="w-4 h-4" /> Email *</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className={`${inputClass} truncate`} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Gender</label>
              <SimpleSelect
                value={gender}
                onChange={setGender}
                options={GENDER_SELECT_OPTIONS}
                placeholder="Select"
                className={`${inputClass} flex items-center justify-between cursor-pointer`}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}><MapPin className="w-4 h-4" /> Current Location *</label>
              <CityAutocomplete value={jobLocation} onChange={setJobLocation} required />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Professional Summary</h2>
          <div className="space-y-2">
            <label className={labelClass}><Sparkles className="w-4 h-4" /> Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A short overview of your experience and what you're looking for..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Skills</h2>
          <TagListInput values={skills} onChange={setSkills} placeholder="e.g. Welding, MS Excel, Customer Service..." />
        </div>

        {/* Employment Details -- total experience + industry summary up top
            (Naukri's own layout), individual jobs below. */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Employment Details</h2>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={isFresher}
              disabled={!isFresher && experience.length > 0}
              onChange={(e) => {
                setIsFresher(e.target.checked);
                if (e.target.checked) setExperienceYears(0);
              }}
              className="w-4 h-4 rounded accent-brand-blue"
            />
            I&apos;m a fresher — no work experience yet
          </label>
          {!isFresher && experience.length > 0 && (
            <p className="text-xs text-muted-foreground -mt-2">Remove your work experience entries below to mark yourself as a fresher.</p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Total Experience</label>
              <SimpleSelect
                value={isFresher ? "0" : experienceYears === "" ? "" : String(experienceYears)}
                disabled={isFresher}
                onChange={(v) => setExperienceYears(v === "" ? "" : Number(v))}
                options={EXPERIENCE_YEAR_SELECT_OPTIONS}
                placeholder="Years of experience (optional)"
                className={`${inputClass} flex items-center justify-between cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}><Building2 className="w-4 h-4" /> Industry</label>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={`${inputClass} truncate`} />
            </div>
          </div>
          <ProfileEntryList
            entries={experience}
            onChange={setExperience}
            titlePlaceholder="Job title, e.g. Site Supervisor"
            subtitlePlaceholder="Company / employer"
            addLabel="Add work experience"
          />
        </div>

        {/* Education */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Education</h2>
          <EducationEntryList entries={education} onChange={setEducation} />
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
            <Award className="w-4 h-4" /> Certifications
          </h2>
          <TagListInput values={certifications} onChange={setCertifications} placeholder="e.g. Forklift License, Safety Training..." />
        </div>

        {/* Projects */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4" /> Projects
          </h2>
          <ProfileEntryList
            entries={projects}
            onChange={setProjects}
            titlePlaceholder="Project name"
            subtitlePlaceholder="Your role / context"
            addLabel="Add project"
          />
        </div>

        {/* Identity & Travel */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Identity & Travel</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}><Globe2 className="w-4 h-4" /> Nationality</label>
              <input value={nationality} onChange={(e) => setNationality(e.target.value)} className={`${inputClass} truncate`} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}><Plane className="w-4 h-4" /> Passport No.</label>
              <input value={passportNo} onChange={(e) => setPassportNo(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="space-y-2 sm:w-1/2 sm:pr-2">
            <label className={labelClass}><Calendar className="w-4 h-4" /> Date of Birth</label>
            <input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" className={inputClass} />
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Preferences</h2>
          <div className="space-y-2">
            <label className={labelClass}><MapPin className="w-4 h-4" /> Preferred Location</label>
            <CityAutocomplete value={preferredLocation} onChange={setPreferredLocation} />
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
      </div>

      {/* Resume Builder */}
      <Link
        href="/resume-builder"
        className="flex items-center justify-between bg-white rounded-2xl border border-border/60 shadow-sm p-6 hover:border-brand-blue/40 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-foreground">Resume Builder</div>
            <div className="text-xs text-muted-foreground">Generate a polished resume PDF from scratch</div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-blue transition-colors" />
      </Link>
    </div>
  );
}
