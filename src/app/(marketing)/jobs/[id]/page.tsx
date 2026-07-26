"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building,
  Eye,
  Share2,
  Heart,
  Flag,
  Ban,
  MessageCircle,
  AlertCircle,
  Phone,
  Mail,
  ArrowUpRight,
  Star,
  Users,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { getJobById, getRelatedJobs, applyToJob, type JobPost, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import JobPosterImage from "@/components/common/JobPosterImage";

function DisabledAction({ icon: Icon, label }: { icon: typeof Heart; label: string }) {
  return (
    <button
      disabled
      title="Coming soon"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white/40 cursor-not-allowed text-sm font-semibold"
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();

  const [job, setJob] = useState<JobPost | null>(null);
  const [related, setRelated] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applyState, setApplyState] = useState<"idle" | "applying" | "applied" | "error">("idle");

  const load = useCallback(async () => {
    try {
      const jobData = await getJobById(params.id);
      setJob(jobData);
      getRelatedJobs(params.id).then(setRelated).catch(() => {});
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: job?.title, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard");
  };

  const handleApply = async () => {
    if (!job) return;
    setApplyState("applying");
    try {
      const result = await applyToJob(job.id);
      toast.success(result.message);
      setApplyState("applied");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to apply.");
      setApplyState("error");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-muted/10 animate-pulse" />;
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Job not found</h1>
          <p className="text-muted-foreground mb-6">This listing may have been removed or isn&apos;t approved yet.</p>
          <Link href="/jobs" className="text-brand-blue font-bold hover:underline">Back to Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      <div className="bg-[oklch(0.12_0.02_260)] text-white pt-8 pb-32">
        <div className="container-site">
          <div className="flex items-center justify-between mb-8">
            <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <DisabledAction icon={Heart} label="Save" />
              <DisabledAction icon={Flag} label="Report" />
              <DisabledAction icon={Ban} label="Block" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex gap-4 sm:gap-6 items-start">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shrink-0 overflow-hidden border border-white/20 shadow-xl">
                <JobPosterImage image={job.image} title={job.title} company={job.company} className="w-full h-full" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-sm sm:text-base font-medium text-white/80">
                  <span className="flex items-center gap-1.5"><Building className="w-5 h-5 opacity-70" /> {job.company}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-5 h-5 opacity-70" /> {job.location}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-5 h-5 opacity-70" /> Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-site relative -mt-20 z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full min-w-0 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Type", value: job.type, icon: Building },
                { label: "Location", value: job.location, icon: MapPin },
                { label: "Views", value: String(job.views), icon: Eye },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-5 rounded-2xl shadow-[var(--shadow-card)] border border-border/60">
                  <stat.icon className="w-6 h-6 text-[oklch(0.47_0.20_250)] mb-3" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="font-semibold text-sm text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[var(--shadow-card)] border border-border/60">
              <h3 className="text-lg font-bold text-foreground mb-4">Description</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line wrap-break-word">{job.description}</p>
            </div>

            {related.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[var(--shadow-card)] border border-border/60">
                <h3 className="text-lg font-bold text-foreground mb-4">Related Jobs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((r) => (
                    <Link key={r.id} href={`/jobs/${r.id}`} className="flex gap-3 p-3 rounded-xl border border-border/60 hover:border-brand-blue/40 hover:bg-brand-blue/5 transition-all">
                      <JobPosterImage image={r.image} title={r.title} company={r.company} className="w-16 h-16 rounded-lg shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground line-clamp-1">{r.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{r.company} &middot; {r.location}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[oklch(0.68_0.21_45)]/30 shadow-[var(--shadow-card)]">
              <h3 className="font-bold text-lg mb-2">Ready to Apply?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Ensure your resume is updated and targeted towards this role.
              </p>

<div className="space-y-3">
                {!user ? (
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 bg-[oklch(0.68_0.21_45)] text-white hover:bg-[oklch(0.55_0.22_45)] py-3 px-4 rounded-xl font-bold transition-colors shadow-sm"
                  >
                    <ArrowUpRight className="w-5 h-5" /> Sign In to Apply
                  </Link>
                ) : applyState === "applied" ? (
                  <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 px-4 rounded-xl font-bold">
                    <CheckCircle2 className="w-5 h-5" /> Applied
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applyState === "applying"}
                    className="w-full flex items-center justify-center gap-2 bg-[oklch(0.68_0.21_45)] text-white hover:bg-[oklch(0.55_0.22_45)] py-3 px-4 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-70"
                  >
                    <ArrowUpRight className="w-5 h-5" /> {applyState === "applying" ? "Applying..." : "Apply Now"}
                  </button>
                )}

                {job.contactWhatsapp && (
                  <a
                    href={`https://wa.me/${job.contactWhatsapp.replace(/[^\d+]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 py-3 px-4 rounded-xl font-bold transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                  </a>
                )}

                {job.contactPhone && (
                  <a
                    href={`tel:${job.contactPhone}`}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-foreground hover:bg-border/60 py-3 px-4 rounded-xl font-bold transition-colors"
                  >
                    <Phone className="w-5 h-5" /> Call
                  </a>
                )}

                {job.contactEmail && (
                  <a
                    href={`mailto:${job.contactEmail}`}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-foreground hover:bg-border/60 py-3 px-4 rounded-xl font-bold transition-colors"
                  >
                    <Mail className="w-5 h-5" /> Email
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/5 flex items-center justify-center text-brand-blue font-black">
                  {job.company.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{job.company}</p>
                  <p className="text-xs text-muted-foreground">Recruiter</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Followers coming soon</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Ratings coming soon</span>
              </div>
              <button disabled title="Coming soon" className="w-full py-2.5 rounded-xl bg-secondary text-muted-foreground font-bold text-sm cursor-not-allowed">
                Follow
              </button>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold block mb-1">Safety First</span>
                Never pay money to an employer for recruitment processing, visa fees, or interviews. Real agencies do not charge candidates.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
