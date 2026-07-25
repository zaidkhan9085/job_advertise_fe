"use client";

import Link from "next/link";
import { Plus, Search, Trash2, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import { getMyJobs, deleteJob, type JobPost, ApiError } from "@/lib/api";

const STATUS_STYLES: Record<JobPost["status"], string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function ManageJobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setJobs(await getMyJobs());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your jobs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete job.");
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Manage Jobs</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">View and manage your job postings.</p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-blue-medium px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-blue/20 whitespace-nowrap active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </Link>
      </div>

      <div className="relative flex-1 max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-blue transition-colors" />
        <input
          type="text"
          placeholder="Search jobs by title or location..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Job Title & Location</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Type</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Posted</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Views</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    Loading your jobs...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No jobs found. Post your first job to get started.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        {job.title}
                        {job.type === "FEATURED" && (
                          <span className="text-[9px] font-black bg-brand-blue text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Featured</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-semibold text-muted-foreground">
                      <span className="bg-secondary/50 px-2 py-1 rounded-md text-[10px] uppercase">{job.type}</span>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-5 font-bold text-foreground">{job.views}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${STATUS_STYLES[job.status]}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Delete Job"
                          onClick={() => handleDelete(job.id)}
                          className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
