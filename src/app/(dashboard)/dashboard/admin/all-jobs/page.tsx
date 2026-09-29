"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { MapPin, Trash2, Pencil, Star, Loader2, Users, Plus, PlayCircle, Undo2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getAllJobsAdmin,
  updateJob,
  deleteJob,
  bulkDeleteJobs,
  promoteJobToStory,
  revertPromotedStory,
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
import { buttonClass } from "@/lib/ui";

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
  const [revertStoryTarget, setRevertStoryTarget] = useState<AdminJob | null>(null);
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

  // Same fetch as loadJobs, but never flips isLoading -- CommonTable renders
  // data={[]} while loading (see CommonTable.tsx), which empties the table
  // for an instant and is exactly what was resetting scroll position before.
  // Skipping that flash keeps the table's real DOM node in place the whole
  // time, so both the page scroll and the table's own horizontal scroll
  // survive a background refresh like this one.
  const refreshJobsQuietly = useCallback(async () => {
    try {
      const result = await getAllJobsAdmin({ ...filters, page, limit: PAGE_LIMIT });
      setJobs(result.data);
      setMeta(result.meta);
    } catch {
      // Silent -- this is a background refresh after an action that already
      // showed its own success/error toast; the initial loadJobs() above is
      // what surfaces a real load failure.
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

  // Promoting clones the job into a brand new, separate Story row -- the
  // backend leaves the original completely untouched, and now hides the
  // clone from this list entirely (it's a duplicate of a row already
  // visible here; see buildJobAdminWhere's promotedFromId filter). So
  // there's no new row to show at all -- just flip the clicked row's own
  // promotedStoryId locally, same in-place pattern handleToggleFeatured
  // already uses, which is what drives its Actions icon switching to
  // Revert immediately.
  const handlePromoteToStory = async (job: AdminJob) => {
    setActioningId(job.id);
    try {
      const result = await promoteJobToStory(job.id);
      toast.success(result.message);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, promotedStoryId: result.story.id } : j)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to post as a Story.");
    } finally {
      setActioningId(null);
    }
  };

  // Two different rows can show a Revert icon, and they mean different
  // things: a row that's itself type STORY (posted directly, or an older
  // promoted clone from before clones were hidden from this list) reverts
  // by converting its own type back to NORMAL. A General/Featured row with
  // a live promotedStoryId reverts by deleting that clone outright --
  // converting it would leave an orphaned duplicate NORMAL row behind,
  // exactly what hiding clones from this list is trying to avoid. Both
  // branches update local state optimistically instead of refetching, same
  // reasoning as handleToggleFeatured: no scroll reset, no reordering.
  const handleRevertStory = async () => {
    if (!revertStoryTarget) return;
    const target = revertStoryTarget;
    setActioningId(target.id);
    try {
      if (target.type === "STORY") {
        // jobTypeId/industryId sent as explicit nulls so the backend's own
        // "never leave a regular job untyped/uncategorized" fallback runs
        // and backfills them server-side -- just not reflected here since
        // this table doesn't display either column.
        const result = await updateJob(target.id, { type: "NORMAL", jobTypeId: null, industryId: null });
        toast.success(result.message);
        setJobs((prev) => prev.map((j) => (j.id === target.id ? { ...j, type: "NORMAL" } : j)));
      } else {
        const result = await revertPromotedStory(target.id);
        toast.success(result.message);
        setJobs((prev) => prev.map((j) => (j.id === target.id ? { ...j, promotedStoryId: null } : j)));
      }
      setRevertStoryTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to revert this Story.");
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
      refreshJobsQuietly();
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
      refreshJobsQuietly();
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
      // CommonTable renders with tableLayout="auto" (a real <table>'s
      // native CSS auto layout, shared by every admin table this component
      // serves) -- under that mode, a column's declared `width`/`minWidth`
      // is only a floor, never a cap; the browser hands any *extra*
      // container width to whichever column's content most wants to grow.
      // With no other column capped, this one (long single-line job
      // titles, forced onto one line by the table's own whitespace-nowrap)
      // was swallowing 500px+ on large screens, which is exactly what
      // pushed Actions off-screen and forced the scroll the client
      // flagged. Scoped to this column's own content instead of changing
      // CommonTable's shared layout mode for every other table it serves:
      // capping the wrapper's max-width and re-enabling wrapping/truncation
      // gives the title text a real ceiling, so the column stops being the
      // one column with unbounded growth potential.
      key: "title",
      title: "Job Title & Location",
      minWidth: 180,
      render: (_, job) => (
        <div className="max-w-52">
          <div className="font-bold text-foreground whitespace-normal wrap-break-word">{job.title}</div>
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{job.location || "Not specified"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "employer",
      title: "Employer",
      minWidth: 160,
      render: (_, job) => (
        <span className="text-muted-foreground font-medium">{job.employer.full_name || job.employer.email}</span>
      ),
    },
    {
      key: "type",
      title: "Type",
      minWidth: 100,
      render: (_, job) => (
        <span className="bg-secondary/50 px-2 py-1 rounded-md text-[10px] uppercase font-semibold text-muted-foreground">
          {job.type}
        </span>
      ),
    },
    {
      key: "posted",
      title: "Posted",
      minWidth: 140,
      render: (_, job) => (
        <span className="text-muted-foreground font-medium">
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      minWidth: 95,
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
      minWidth: 160,
      render: (_, job) => (
        <div className="flex items-center justify-end gap-0.5">
          <button
            title={job.type === "FEATURED" ? "Move to General" : "Make Featured"}
            disabled={actioningId === job.id || job.type === "STORY"}
            onClick={() => handleToggleFeatured(job)}
            className={`p-1.5 rounded-full transition-colors disabled:opacity-30 ${
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
          {job.status !== "EXPIRED" && (() => {
            // A row shows Revert either because it IS a Story (posted
            // directly, or type flipped some other way) or because it's a
            // General/Featured row with a live promoted clone hiding
            // elsewhere -- both cases hand off to the same confirm dialog
            // and handleRevertStory, which branches on target.type to run
            // the right undo.
            const isPromoted = job.type === "STORY" || !!job.promotedStoryId;
            return (
              <button
                title={isPromoted ? "Revert this Story back to General" : "Post as a Story (the original post stays untouched)"}
                disabled={actioningId === job.id}
                onClick={() => (isPromoted ? setRevertStoryTarget(job) : handlePromoteToStory(job))}
                className={`p-1.5 rounded-full transition-colors disabled:opacity-30 ${
                  isPromoted
                    ? "text-brand-blue hover:bg-brand-blue/10"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {actioningId === job.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPromoted ? (
                  <Undo2 className="w-4 h-4" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
              </button>
            );
          })()}
          <Link
            href={`/dashboard/admin/all-jobs/${job.id}/applicants`}
            title={job.applicationsCount ? `Applicants (${job.applicationsCount})` : "No applicants yet"}
            className={`p-1.5 rounded-full transition-colors ${
              job.applicationsCount
                ? "text-brand-blue hover:bg-brand-blue/10"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" fill={job.applicationsCount ? "currentColor" : "none"} />
          </Link>
          <Link
            href={`/dashboard/admin/all-jobs/${job.id}/edit`}
            title="Edit Job"
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            title="Delete Job"
            disabled={actioningId === job.id}
            onClick={() => setDeleteTarget(job)}
            className="p-1.5 rounded-full hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">All Jobs</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Every job post site-wide, any status. Full edit access.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/stories/new"
            className={buttonClass({ variant: "outline" }, "shadow-sm whitespace-nowrap")}
          >
            <PlayCircle className="w-4 h-4" />
            Post Story
          </Link>
          <Link
            href="/dashboard/jobs/new"
            className={buttonClass({ variant: "primary" }, "shadow-lg shadow-brand-blue/20 whitespace-nowrap")}
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </Link>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <CommonTable<AdminJob, string>
        columns={columns}
        data={jobs}
        rowKey={(j) => j.id}
        loading={isLoading}
        dense
        emptyMessage="No jobs found."
        search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by title, company, or location..." }}
        filters={<StatusFilterPills options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />}
        resetFilters={{
          onReset: () => {
            setSearchInput("");
            setStatusFilter("ALL");
          },
          hasActiveFilters: !!searchInput || statusFilter !== "ALL",
        }}
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

      <ConfirmDialog
        isOpen={!!revertStoryTarget}
        title="Revert this Story?"
        message={
          revertStoryTarget?.type === "STORY"
            ? `"${revertStoryTarget?.title}" will leave Stories and go back to a regular General post. It stays live and approved.`
            : `The Story created from "${revertStoryTarget?.title}" will be removed. The General post itself is unaffected.`
        }
        confirmLabel="Revert"
        isConfirming={actioningId === revertStoryTarget?.id}
        onConfirm={handleRevertStory}
        onCancel={() => setRevertStoryTarget(null)}
      />
    </div>
  );
}
