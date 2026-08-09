"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Building, ExternalLink, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getAllCompaniesAdmin,
  deleteCompanyAdmin,
  bulkDeleteCompanies,
  resolveImageUrl,
  type CompanyAdminListItem,
  type PaginatedMeta,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { useTableSelection } from "@/hooks/useTableSelection";

const PAGE_LIMIT = 20;

export default function AdminEmployersPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyAdminListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [actioningId, setActioningId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CompanyAdminListItem | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const selection = useTableSelection<string>();

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filters = useMemo(() => ({ search: search || undefined }), [search]);

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllCompaniesAdmin({ ...filters, page, limit: PAGE_LIMIT });
      setCompanies(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load employers.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadCompanies();
    }
  }, [user, loadCompanies]);

  // Job counts for rows the admin can actually see right now — for
  // "select all matching filters" the exact count isn't known client-side,
  // so the dialog falls back to a generic (still explicit) warning.
  const selectedJobCount = useMemo(() => {
    if (selection.selectAllMatching) return null;
    return companies.filter((c) => selection.isSelected(c.id)).reduce((sum, c) => sum + c._count.jobs, 0);
  }, [companies, selection]);

  if (user && user.role !== "admin") {
    return <ComingSoon title="Employers" />;
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActioningId(deleteTarget.id);
    try {
      const result = await deleteCompanyAdmin(deleteTarget.id, true);
      toast.success(result.message);
      setDeleteTarget(null);
      loadCompanies();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete employer.");
    } finally {
      setActioningId(null);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const result = await bulkDeleteCompanies(selection.toBulkDeletePayload(filters));
      if (result.failed.length > 0) {
        toast.error(`Deleted ${result.deleted.length}, but ${result.failed.length} failed.`);
      } else {
        toast.success(`Deleted ${result.deleted.length} employer(s).`);
      }
      selection.clear();
      setIsBulkDeleteOpen(false);
      loadCompanies();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete employers.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: CommonTableColumn<CompanyAdminListItem>[] = [
    {
      key: "company",
      title: "Company",
      minWidth: 220,
      render: (_, company) => (
        <div className="flex items-center gap-3">
          {company.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveImageUrl(company.logo)}
              alt={company.name}
              className="w-8 h-8 rounded-lg object-cover border border-border/60"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
          )}
          <span className="font-bold text-foreground">{company.name}</span>
        </div>
      ),
    },
    {
      key: "owner",
      title: "Owner",
      minWidth: 180,
      render: (_, company) => (
        <span className="text-muted-foreground font-medium">{company.owner.full_name || company.owner.email}</span>
      ),
    },
    {
      key: "region",
      title: "Region",
      minWidth: 120,
      render: (_, company) => <span className="text-muted-foreground font-medium">{company.region?.name ?? "—"}</span>,
    },
    {
      key: "jobs",
      title: "Jobs",
      minWidth: 70,
      render: (_, company) => <span className="font-bold text-foreground">{company._count.jobs}</span>,
    },
    {
      key: "followers",
      title: "Followers",
      minWidth: 100,
      render: (_, company) => <span className="font-bold text-foreground">{company._count.follows}</span>,
    },
    {
      key: "reports",
      title: "Reports",
      minWidth: 130,
      render: (_, company) =>
        company.pendingReportCount > 0 ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-rose-50 text-rose-700 border-rose-200">
            {company.pendingReportCount} pending
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "created",
      title: "Created",
      minWidth: 140,
      render: (_, company) => (
        <span className="text-muted-foreground font-medium">
          {formatDistanceToNow(new Date(company.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      minWidth: 100,
      render: (_, company) => (
        <div
          className={`flex items-center justify-end gap-1 transition-opacity ${
            actioningId === company.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <Link
            href={`/dashboard/admin/employers/${company.id}`}
            title="View Employer"
            className="inline-flex p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            title="Delete Employer"
            disabled={actioningId === company.id}
            onClick={() => setDeleteTarget(company)}
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
        <h1 className="text-2xl font-black text-foreground">Employers</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Every registered company, with job counts, followers, and pending reports.
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <CommonTable<CompanyAdminListItem, string>
        columns={columns}
        data={companies}
        rowKey={(c) => c.id}
        loading={isLoading}
        emptyMessage="No employers found."
        search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by company or owner..." }}
        resetFilters={{ onReset: () => setSearchInput(""), hasActiveFilters: !!searchInput }}
        pagination={
          meta
            ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
            : undefined
        }
        selection={{
          pageIds: companies.map((c) => c.id),
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
        title="Delete Employer"
        message={
          deleteTarget && deleteTarget._count.jobs > 0
            ? `Delete "${deleteTarget.name}"? This will also delete ${deleteTarget._count.jobs} job posting(s) and all of its follows, ratings, and reports. This cannot be undone.`
            : `Delete "${deleteTarget?.name}"? This cannot be undone.`
        }
        confirmLabel="Delete"
        variant="danger"
        isConfirming={actioningId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        title="Delete Selected Employers"
        message={
          selection.selectAllMatching
            ? `Delete all ${selection.count(meta?.total ?? 0)} matching employers? Any of their job postings, follows, ratings, and reports will also be deleted. This cannot be undone.`
            : `Delete ${selection.count(meta?.total ?? 0)} employer(s)${
                selectedJobCount ? ` and ${selectedJobCount} of their job posting(s)` : ""
              }? This cannot be undone.`
        }
        confirmLabel="Delete All"
        variant="danger"
        isConfirming={isBulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setIsBulkDeleteOpen(false)}
      />
    </div>
  );
}
