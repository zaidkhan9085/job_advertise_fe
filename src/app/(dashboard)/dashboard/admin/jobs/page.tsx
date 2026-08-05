"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Building2, Check, X, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getPendingJobs, updateJobStatus, ApiError } from "@/lib/api";
import type { JobPost } from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";

type PendingJob = JobPost & { employer: { id: number; full_name: string | null; email: string } };

export default function AdminPendingJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PendingJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setJobs(await getPendingJobs());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load pending jobs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "sub_admin") {
      loadJobs();
    }
  }, [user, loadJobs]);

  if (user && user.role !== "admin" && user.role !== "sub_admin") {
    return <ComingSoon title="Pending Jobs" />;
  }

  const handleDecision = async (id: string, status: "APPROVED" | "REJECTED", trustEmployer = false) => {
    setActioningId(id);
    try {
      const result = await updateJobStatus(id, status, trustEmployer);
      toast.success(trustEmployer ? "Approved — this employer's future posts will skip review." : result.message);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update job status.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">Pending Jobs</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Review and approve job postings before they go live.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
          Loading pending jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
          All caught up — no jobs waiting for approval.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-foreground flex items-center gap-2">
                  {job.title}
                  {job.type === "FEATURED" && (
                    <span className="text-[9px] font-black bg-brand-blue text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Featured</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Posted by {job.employer.full_name || job.employer.email} &middot; {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={actioningId === job.id}
                  onClick={() => handleDecision(job.id, "REJECTED")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  disabled={actioningId === job.id}
                  onClick={() => handleDecision(job.id, "APPROVED")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  disabled={actioningId === job.id}
                  onClick={() => handleDecision(job.id, "APPROVED", true)}
                  title="Approve this job and skip the review queue for all of this employer's future posts"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" /> Approve & Trust
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
