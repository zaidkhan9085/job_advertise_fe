"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Eye, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getReports,
  updateReportStatus,
  type AdminReport,
  type ReportStatus,
  type PaginatedMeta,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { StatusFilterPills } from "@/components/dashboard/StatusFilterPills";

const PAGE_LIMIT = 20;

const STATUS_STYLES: Record<ReportStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  VIEWED: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  DISMISSED: "bg-secondary text-muted-foreground border-border/60",
};

const FILTER_OPTIONS = ["ALL", "PENDING", "VIEWED", "DISMISSED"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterOption>("PENDING");
  const [page, setPage] = useState(1);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filters = useMemo(
    () => ({ search: search || undefined, status: statusFilter === "ALL" ? undefined : (statusFilter as ReportStatus) }),
    [search, statusFilter]
  );

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getReports({ ...filters, page, limit: PAGE_LIMIT });
      setReports(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load reports.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "sub_admin") {
      loadReports();
    }
  }, [user, loadReports]);

  if (user && user.role !== "admin" && user.role !== "sub_admin") {
    return <ComingSoon title="Reports" />;
  }

  const handleUpdate = async (id: string, status: ReportStatus) => {
    setActioningId(id);
    try {
      await updateReportStatus(id, status);
      toast.success(`Report marked ${status.toLowerCase()}`);
      loadReports();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update report.");
    } finally {
      setActioningId(null);
    }
  };

  const columns: CommonTableColumn<AdminReport>[] = [
    {
      key: "reason",
      title: "Reason",
      render: (_, report) => <span className="text-foreground font-medium max-w-xs truncate block">{report.reason}</span>,
    },
    {
      key: "reported",
      title: "Reported",
      render: (_, report) =>
        report.job ? (
          <Link href={`/dashboard/admin/all-jobs/${report.job.id}/edit`} className="text-brand-blue font-bold hover:underline">
            {report.job.title}
          </Link>
        ) : report.company ? (
          <Link href={`/dashboard/admin/employers/${report.company.id}`} className="text-brand-blue font-bold hover:underline">
            {report.company.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "reporter",
      title: "Reporter",
      render: (_, report) => (
        <span className="text-muted-foreground font-medium">{report.reporter.full_name || report.reporter.email}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, report) => <StatusBadge status={report.status} styles={STATUS_STYLES} />,
    },
    {
      key: "date",
      title: "Date",
      render: (_, report) => (
        <span className="text-muted-foreground font-medium">
          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      width: 100,
      render: (_, report) =>
        report.status !== "DISMISSED" ? (
          <div className="flex items-center justify-end gap-1">
            {report.status === "PENDING" && (
              <button
                title="Mark Viewed"
                disabled={actioningId === report.id}
                onClick={() => handleUpdate(report.id, "VIEWED")}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
              >
                {actioningId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            <button
              title="Dismiss"
              disabled={actioningId === report.id}
              onClick={() => handleUpdate(report.id, "DISMISSED")}
              className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors disabled:opacity-30"
            >
              {actioningId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Jobs and employers reported by candidates.</p>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <CommonTable<AdminReport, string>
        columns={columns}
        data={reports}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyMessage="No reports found."
        search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by reason..." }}
        filters={<StatusFilterPills options={FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />}
        pagination={
          meta
            ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
            : undefined
        }
      />
    </div>
  );
}
