"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Eye, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getReports, updateReportStatus, type AdminReport, type ReportStatus, ApiError } from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { StatusFilterPills } from "@/components/dashboard/StatusFilterPills";

const STATUS_STYLES: Record<ReportStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  VIEWED: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  DISMISSED: "bg-secondary text-muted-foreground border-border/60",
};

const FILTER_OPTIONS = ["PENDING", "VIEWED", "DISMISSED", "ALL"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterOption>("PENDING");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setReports(await getReports(statusFilter === "ALL" ? undefined : { status: statusFilter }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load reports.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

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
      setReports((prev) =>
        statusFilter === "ALL" ? prev.map((r) => (r.id === id ? { ...r, status } : r)) : prev.filter((r) => r.id !== id)
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update report.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Jobs and employers reported by candidates.
        </p>
      </div>

      <StatusFilterPills options={FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />

      {error && (
        <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Reason</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Reported</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Reporter</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Date</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-5 text-foreground font-medium max-w-xs truncate">{report.reason}</td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      {report.job ? (
                        <Link href={`/dashboard/admin/all-jobs/${report.job.id}/edit`} className="text-brand-blue font-bold hover:underline">
                          {report.job.title}
                        </Link>
                      ) : report.company ? (
                        <Link href={`/dashboard/admin/employers/${report.company.id}`} className="text-brand-blue font-bold hover:underline">
                          {report.company.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      {report.reporter.full_name || report.reporter.email}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={report.status} styles={STATUS_STYLES} />
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.status !== "DISMISSED" && (
                        <div className="flex items-center justify-end gap-1">
                          {report.status === "PENDING" && (
                            <button
                              title="Mark Viewed"
                              disabled={actioningId === report.id}
                              onClick={() => handleUpdate(report.id, "VIEWED")}
                              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                            >
                              {actioningId === report.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            title="Dismiss"
                            disabled={actioningId === report.id}
                            onClick={() => handleUpdate(report.id, "DISMISSED")}
                            className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors disabled:opacity-30"
                          >
                            {actioningId === report.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
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
