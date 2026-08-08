"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { MapPin, Trash2, Pencil, Star, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getAllJobsAdmin,
  updateJob,
  deleteJob,
  bulkDeleteJobs,
  type AdminJob,
  type JobPostStatus,
  type PaginatedMeta,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { StatusFilterPills } from "@/components/dashboard/StatusFilterPills";
import { useTableSelection } from "@/hooks/useTableSelection";

const PAGE_LIMIT = 20;

const STATUS_STYLES: Record<JobPostStatus, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  EXPIRED: "bg-secondary text-muted-foreground border-border/60",
};

const STATUS_FILTER_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "EXPIRED"] as const;
type StatusFilterOption = (typeof STATUS_FILTER_OPTIONS)[number];

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

function downloadCsv(csv: string, filenamePrefix: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminAllJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("ALL");
  const [page, setPage] = useState(1);

  const [actioningId, setActioningId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminJob | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const selection = useTableSelection<string>();

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filters = useMemo(
    () => ({ search: search || undefined, status: statusFilter === "ALL" ? undefined : (statusFilter as JobPostStatus) }),
    [search, statusFilter]
  );

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllJobsAdmin({ ...filters, page, limit: PAGE_LIMIT });
      setJobs(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load jobs.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActioningId(deleteTarget.id);
    try {
      const result = await deleteJob(deleteTarget.id);
      toast.success(result.message);
      setDeleteTarget(null);
      loadJobs();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete job.");
    } finally {
      setActioningId(null);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const result = await bulkDeleteJobs(selection.toBulkDeletePayload(filters));
      toast.success(`Deleted ${result.count} job(s).`);
      selection.clear();
      setIsBulkDeleteOpen(false);
      loadJobs();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete jobs.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getAllJobsAdmin({ ...filters, all: true });
      downloadCsv(toCsv(result.data), "all-jobs");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to export jobs.");
    } finally {
      setIsExporting(false);
    }
  };

  const columns: CommonTableColumn<AdminJob>[] = [
    {
      key: "title",
      title: "Job Title & Location",
      render: (_, job) => (
        <>
          <div className="font-bold text-foreground">{job.title}</div>
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {job.location || "Not specified"}
          </div>
        </>
      ),
    },
    {
      key: "employer",
      title: "Employer",
      render: (_, job) => (
        <span className="text-muted-foreground font-medium">{job.employer.full_name || job.employer.email}</span>
      ),
    },
    {
      key: "type",
      title: "Type",
      render: (_, job) => (
        <span className="bg-secondary/50 px-2 py-1 rounded-md text-[10px] uppercase font-semibold text-muted-foreground">
          {job.type}
        </span>
      ),
    },
    {
      key: "posted",
      title: "Posted",
      render: (_, job) => (
        <span className="text-muted-foreground font-medium">
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "views",
      title: "Views",
      render: (_, job) => <span className="font-bold text-foreground">{job.views}</span>,
    },
    {
      key: "status",
      title: "Status",
      render: (_, job) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${STATUS_STYLES[job.status]}`}
        >
          {job.status}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      render: (_, job) => (
        <div
          className={`flex items-center justify-end gap-1 transition-opacity ${
            actioningId === job.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
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
            onClick={() => setDeleteTarget(job)}
            className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">All Jobs</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Every job post site-wide, any status. Full edit access.
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <CommonTable<AdminJob, string>
        columns={columns}
        data={jobs}
        rowKey={(j) => j.id}
        loading={isLoading}
        emptyMessage="No jobs found."
        search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by title, company, or location..." }}
        filters={<StatusFilterPills options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />}
        exportButton={{ onClick: handleExport, disabled: isExporting || jobs.length === 0 }}
        pagination={
          meta
            ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
            : undefined
        }
        selection={{
          pageIds: jobs.map((j) => j.id),
          totalMatching: meta?.total ?? 0,
          isSelected: selection.isSelected,
          isPageFullySelected: selection.isPageFullySelected,
          onToggleRow: selection.toggleRow,
          onTogglePage: selection.togglePage,
          onSelectAllMatching: selection.selectAll,
          onClearSelection: selection.clear,
          selectedCount: selection.count(meta?.total ?? 0),
          selectAllMatching: selection.selectAllMatching,
          onBulkDelete: () => setIsBulkDeleteOpen(true),
          isBulkDeleting,
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Job"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isConfirming={actioningId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        title="Delete Selected Jobs"
        message={`Delete ${selection.count(meta?.total ?? 0)} job posting(s)? This cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        isConfirming={isBulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setIsBulkDeleteOpen(false)}
      />
    </div>
  );
}
