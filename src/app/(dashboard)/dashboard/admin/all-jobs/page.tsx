"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { MapPin, Search, Trash2, Pencil, Star, Download, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getAllJobsAdmin, updateJob, deleteJob, type JobPost, type JobPostStatus, ApiError } from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { StatusFilterPills } from "@/components/dashboard/StatusFilterPills";

type AdminJob = JobPost & { employer: { id: number; full_name: string | null; email: string } };

const STATUS_FILTER_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "EXPIRED"] as const;
type StatusFilterOption = (typeof STATUS_FILTER_OPTIONS)[number];

const STATUS_STYLES: Record<JobPost["status"], string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  EXPIRED: "bg-secondary text-muted-foreground border-border/60",
};

function toCsv(jobs: AdminJob[]): string {
  const header = ["Title", "Company", "Location", "Type", "Status", "Views", "Clicks", "Employer", "Posted"];
  const rows = jobs.map((j) => [
    j.title,
    j.company,
    j.location ?? "",
    j.type,
    j.status,
    String(j.views),
    String(j.clicks),
    j.employer.full_name || j.employer.email,
    j.createdAt,
  ]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export default function AdminAllJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("ALL");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setJobs(await getAllJobsAdmin(statusFilter === "ALL" ? undefined : { status: statusFilter as JobPostStatus }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load jobs.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "sub_admin") {
      loadJobs();
    }
  }, [user, loadJobs]);

  if (user && user.role !== "admin" && user.role !== "sub_admin") {
    return <ComingSoon title="All Jobs" />;
  }

  const handleToggleFeatured = async (job: AdminJob) => {
    setActioningId(job.id);
    try {
      const nextType = job.type === "FEATURED" ? "NORMAL" : "FEATURED";
      const result = await updateJob(job.id, { type: nextType });
      toast.success(result.message);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, type: nextType } : j)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update job type.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    setActioningId(id);
    try {
      const result = await deleteJob(id);
      toast.success(result.message);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete job.");
    } finally {
      setActioningId(null);
    }
  };

  const handleExport = () => {
    const csv = toCsv(filteredJobs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-jobs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">All Jobs</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Every job post site-wide, any status. Full edit access.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredJobs.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-white border border-border/60 hover:bg-secondary px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-blue transition-colors" />
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <StatusFilterPills options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
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
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Employer</th>
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
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    Loading jobs...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No jobs found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-foreground">{job.title}</div>
                      <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location || "Not specified"}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      {job.employer.full_name || job.employer.email}
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
                      <div className={`flex items-center justify-end gap-1 transition-opacity ${actioningId === job.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        <button
                          title={job.type === "FEATURED" ? "Move to General" : "Make Featured"}
                          disabled={actioningId === job.id || job.type === "STORY"}
                          onClick={() => handleToggleFeatured(job)}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
                            job.type === "FEATURED"
                              ? "text-brand-blue hover:bg-brand-blue/10"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          {actioningId === job.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Star className="w-4 h-4" fill={job.type === "FEATURED" ? "currentColor" : "none"} />
                          )}
                        </button>
                        <Link
                          href={`/dashboard/admin/all-jobs/${job.id}/edit`}
                          title="Edit Job"
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          title="Delete Job"
                          disabled={actioningId === job.id}
                          onClick={() => handleDelete(job.id)}
                          className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors disabled:opacity-30"
                        >
                          {actioningId === job.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
