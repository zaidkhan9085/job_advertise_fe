"use client";

import { useEffect, useState } from "react";
import { X, Loader2, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  applyToJob,
  applyToJobProxy,
  getMyCandidateProfile,
  getIndustries,
  ApiError,
  type ApplyPayload,
  type Industry,
} from "@/lib/api";
import CityAutocomplete, { toLocationValue, type LocationValue } from "@/components/common/CityAutocomplete";
import SearchableSelect from "@/components/common/SearchableSelect";
import SimpleSelect from "@/components/common/SimpleSelect";
import { COURSE_OPTIONS, getSpecializationOptions } from "@/lib/courseSpecializations";

const COURSE_SELECT_OPTIONS = COURSE_OPTIONS.map((c) => ({ value: c, label: c }));
const EXPERIENCE_YEAR_SELECT_OPTIONS = Array.from({ length: 41 }, (_, i) => ({
  value: String(i),
  label: `${i} ${i === 1 ? "year" : "years"}`,
}));

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium";
const labelClass = "block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5";

function buildWhatsAppMessage(payload: { name?: string; phone?: string }, jobTitle: string, resumeLink?: string) {
  return [
    `Hi, I've applied for "${jobTitle}".`,
    `Name: ${payload.name}`,
    `Phone: ${payload.phone}`,
    resumeLink ? `Resume: ${resumeLink}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function ApplyDialog({
  jobId,
  jobTitle,
  mode = "self",
  onClose,
  onSuccess,
}: {
  jobId: string;
  jobTitle: string;
  // "self" = the logged-in candidate applying for themselves (offers to
  // notify the recruiter on WhatsApp after submitting). "proxy" = an
  // employer/admin logging someone else's application (no WhatsApp step --
  // they're the recruiter, not the applicant).
  mode?: "self" | "proxy";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isLoadingProfile, setIsLoadingProfile] = useState(mode === "self");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);

  // "form" -> the apply fields. "confirm" -> post-submit, self-apply only:
  // ask before opening WhatsApp rather than doing it unprompted, since a
  // candidate applying to several jobs in a row wouldn't want a new tab
  // popping open every single time whether they wanted to message the
  // recruiter or not.
  const [stage, setStage] = useState<"form" | "confirm">("form");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [industry, setIndustry] = useState("");
  const [course, setCourse] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | "">("");
  const [isFresher, setIsFresher] = useState(false);

  useEffect(() => {
    getIndustries().then(setIndustries).catch(() => {});
  }, []);

  // Same body-scroll-lock pattern as MobileNav.tsx -- without it the page
  // behind this fixed-position overlay keeps scrolling with it.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Pre-fill from the candidate's own profile (if any) so they don't retype
  // what they've already told the platform -- only for self-apply, a
  // recruiter logging someone else has nothing of theirs to pre-fill from.
  useEffect(() => {
    if (mode !== "self") return;
    getMyCandidateProfile()
      .then((profile) => {
        if (!profile) return;
        setName(profile.name || "");
        setPhone(profile.whatsapp || "");
        setPosition(profile.position || "");
        setLocation(toLocationValue(profile.jobLocation));
        setIndustry(profile.industry || "");
        setExperienceYears(profile.experienceYears ?? "");
        setIsFresher(profile.isFresher);
        const firstEdu = profile.education?.find((e) => e.course);
        if (firstEdu) {
          setCourse(firstEdu.course || "");
          setSpecialization(firstEdu.specialization || "");
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingProfile(false));
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required.");
      return;
    }

    const payload: ApplyPayload = {
      name: name.trim(),
      phone: phone.trim(),
      position: position.trim() || undefined,
      jobLocationId: location?.id,
      industry: industry || undefined,
      course: course || undefined,
      specialization: course && specialization ? specialization : undefined,
      isFresher,
      experienceYears: isFresher ? 0 : experienceYears === "" ? undefined : experienceYears,
    };

    setIsSubmitting(true);
    try {
      if (mode === "proxy") {
        const result = await applyToJobProxy(jobId, payload);
        toast.success(result.message);
        onSuccess();
        onClose();
        return;
      }

      const result = await applyToJob(jobId, payload);
      toast.success(result.message);

      if (result.contactWhatsapp) {
        const message = buildWhatsAppMessage(payload, jobTitle, result.resumeLink);
        const cleanedNumber = result.contactWhatsapp.replace(/[^\d+]/g, "");
        setWhatsappUrl(`https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`);
        setStage("confirm");
        onSuccess();
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to apply.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (whatsappUrl) window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border/60 shrink-0">
          <div>
            <h2 className="font-black text-lg text-foreground">
              {stage === "confirm" ? "Applied!" : mode === "proxy" ? "Add Applicant" : "Apply for this job"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 -m-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {stage === "confirm" ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-foreground">Your application was submitted.</p>
              <p className="text-sm text-muted-foreground mt-1">Want to also send your details to the recruiter on WhatsApp?</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-border/60 text-foreground font-bold hover:bg-secondary/60 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSendWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#1fb959] transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Send via WhatsApp
              </button>
            </div>
          </div>
        ) : isLoadingProfile ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Position Applied For</label>
                <input value={position} onChange={(e) => setPosition(e.target.value)} className={`${inputClass} truncate`} />
              </div>
              <div>
                <label className={labelClass}>Current Location</label>
                <CityAutocomplete value={location} onChange={setLocation} placeholder="Any location" />
              </div>
              <SearchableSelect
                label="Industry"
                placeholder="Search and select an industry..."
                value={industry}
                onChange={setIndustry}
                options={industries.map((i) => ({ value: i.name, label: i.name }))}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <SearchableSelect
                  label="Qualification"
                  placeholder="Search and select a course..."
                  value={course}
                  onChange={(next) => {
                    setCourse(next);
                    setSpecialization("");
                  }}
                  options={COURSE_SELECT_OPTIONS}
                />
                {course && course !== "Other" ? (
                  <SearchableSelect
                    label="Specialization"
                    placeholder="Search and select..."
                    value={specialization}
                    onChange={setSpecialization}
                    options={getSpecializationOptions(course).map((s) => ({ value: s, label: s }))}
                  />
                ) : (
                  <div>
                    <label className={labelClass}>Specialization</label>
                    {/* Matches SearchableSelect's own trigger classes exactly
                        (pl-4 pr-9 py-3 border-2) so this placeholder is the
                        same height as the real dropdown next to it -- a
                        shorter/differently-padded stand-in here is what
                        made the two columns misalign. */}
                    <div className="w-full pl-4 pr-9 py-3 rounded-xl bg-secondary/30 border-2 border-transparent text-sm font-medium text-muted-foreground">
                      {course === "Other" ? "Not applicable" : "Pick a qualification first"}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer w-fit mb-2">
                  <input
                    type="checkbox"
                    checked={isFresher}
                    onChange={(e) => {
                      setIsFresher(e.target.checked);
                      if (e.target.checked) setExperienceYears(0);
                    }}
                    className="w-4 h-4 rounded accent-brand-blue"
                  />
                  I&apos;m a fresher — no work experience yet
                </label>
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
            </div>

            <div className="p-5 sm:p-6 border-t border-border/60 shrink-0">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-blue/90 py-3 rounded-xl font-bold transition-colors disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSubmitting ? "Submitting..." : mode === "proxy" ? "Add Applicant" : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
