"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Building2, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getJobs, applyToJob, type JobPost, ApiError } from "@/lib/api";

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setJobs(await getJobs());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load jobs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    setError(null);
    try {
      await applyToJob(jobId);
      setAppliedIds((prev) => new Set(prev).add(jobId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to apply.");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">Browse Jobs</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Live approved job postings.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
          Loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
          No approved jobs yet — check back soon.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const hasApplied = appliedIds.has(job.id);
            return (
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
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">{job.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <button
                  disabled={applyingId === job.id || hasApplied}
                  onClick={() => handleApply(job.id)}
                  className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shrink-0 disabled:opacity-70 ${
                    hasApplied
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-brand-blue text-white hover:bg-brand-blue-medium"
                  }`}
                >
                  {hasApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Applied
                    </>
                  ) : applyingId === job.id ? (
                    "Applying..."
                  ) : (
                    "Apply Now"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
