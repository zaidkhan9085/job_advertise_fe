"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Building, Trash2, Pencil, Lock, ShieldOff, ShieldCheck, Loader2, X, Coins, Star, UserX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getAllCompaniesAdmin,
  deleteEmployerUserAdmin,
  bulkDeleteEmployerUsers,
  updateCandidateUser,
  setCandidateBlocked,
  grantCreditsToCompany,
  grantCreditsToEmployerUser,
  setCompanyFeatured,
  revokeCompanyAutoApprove,
  grantCompanyAutoApprove,
  resolveImageUrl,
  type EmployerAdminListItem,
  type PaginatedMeta,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";
import RowActionsMenu from "@/components/dashboard/RowActionsMenu";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { useTableSelection } from "@/hooks/useTableSelection";
import ResetPasswordModal from "@/components/dashboard/ResetPasswordModal";
import { isValidEmail } from "@/lib/isValidEmail";

const PAGE_LIMIT = 20;

function toCsv(rows: EmployerAdminListItem[]): string {
  const header = ["Company", "Owner Name", "Owner Email", "Owner Phone", "Location", "Jobs", "Followers", "Pending Reports", "Top Hiring", "Blocked", "Registered"];
  const csvRows = rows.map((r) => [
    r.company?.name ?? "",
    r.fullName ?? "",
    r.email,
    r.phone ?? "",
    r.company?.jobLocation?.name ?? "",
    String(r.company?.jobCount ?? 0),
    String(r.company?.followerCount ?? 0),
    String(r.company?.pendingReportCount ?? 0),
    r.company?.isFeaturedTopHiring ? "Yes" : "No",
    r.isBlocked ? "Yes" : "No",
    r.registeredAt,
  ]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [header, ...csvRows].map((row) => row.map(escape).join(",")).join("\n");
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

// Edit/block/reset-password act on the employer's own account (User) via
// the same generic admin-user endpoints already built for Candidates —
// those aren't role-restricted on the target, just on the caller
// (admin/sub_admin). None of this needs a Company to exist.
function EditOwnerModal({
  row,
  onClose,
  onSaved,
}: {
  row: EmployerAdminListItem;
  onClose: () => void;
  onSaved: (owner: { id: number; full_name: string | null; email: string; phone: string | null }) => void;
}) {
  const [fullName, setFullName] = useState(row.fullName ?? "");
  const [email, setEmail] = useState(row.email);
  const [phone, setPhone] = useState(row.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateCandidateUser(row.userId, { full_name: fullName, email, phone });
      toast.success("Employer updated");
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update employer.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Edit Employer</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Owner name"
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-colors disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// Credits are a plain User field -- grants through whichever endpoint
// actually applies (company-id one when a company exists, since that's the
// established route; user-id one otherwise), but the UI/flow is identical
// either way.
function GrantCreditsModal({ row, onClose }: { row: EmployerAdminListItem; onClose: () => void }) {
  const [amount, setAmount] = useState("5");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const amountNum = Number(amount);
    if (!Number.isInteger(amountNum) || amountNum <= 0) {
      toast.error("Amount must be a positive whole number.");
      return;
    }
    setIsSaving(true);
    try {
      const result = row.company
        ? await grantCreditsToCompany(row.company.id, amountNum, note || undefined)
        : await grantCreditsToEmployerUser(row.userId, amountNum, note || undefined);
      toast.success(result.message);
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to grant credits.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Grant Credits</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Add credits to {row.company?.name ?? (row.fullName || row.email)}&apos;s balance for ATS candidate unlocks.
        </p>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          min={1}
          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-colors disabled:opacity-70"
        >
          {isSaving ? "Granting..." : "Grant Credits"}
        </button>
      </div>
    </div>
  );
}

export default function AdminEmployersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<EmployerAdminListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [actioningId, setActioningId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployerAdminListItem | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [editingRow, setEditingRow] = useState<EmployerAdminListItem | null>(null);
  const [passwordRow, setPasswordRow] = useState<EmployerAdminListItem | null>(null);
  const [creditsRow, setCreditsRow] = useState<EmployerAdminListItem | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<EmployerAdminListItem | null>(null);
  const [grantTarget, setGrantTarget] = useState<EmployerAdminListItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const selection = useTableSelection<number>();

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filters = useMemo(() => ({ search: search || undefined }), [search]);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllCompaniesAdmin({ ...filters, page, limit: PAGE_LIMIT });
      setRows(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load employers.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadRows();
    }
  }, [user, loadRows]);

  // Job counts for rows the admin can actually see right now — for
  // "select all matching filters" the exact count isn't known client-side,
  // so the dialog falls back to a generic (still explicit) warning.
  const selectedJobCount = useMemo(() => {
    if (selection.selectAllMatching) return null;
    return rows.filter((r) => selection.isSelected(r.userId)).reduce((sum, r) => sum + (r.company?.jobCount ?? 0), 0);
  }, [rows, selection]);

  if (user && user.role !== "admin") {
    return <ComingSoon title="Employers" />;
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActioningId(deleteTarget.userId);
    try {
      await deleteEmployerUserAdmin(deleteTarget.userId);
      toast.success("Employer deleted");
      setDeleteTarget(null);
      loadRows();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete employer.");
    } finally {
      setActioningId(null);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const result = await bulkDeleteEmployerUsers(selection.toBulkDeletePayload(filters));
      if (result.failed.length > 0) {
        toast.error(`Deleted ${result.deleted.length}, but ${result.failed.length} failed.`);
      } else {
        toast.success(`Deleted ${result.deleted.length} employer(s).`);
      }
      selection.clear();
      setIsBulkDeleteOpen(false);
      loadRows();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete employers.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleToggleBlock = async (row: EmployerAdminListItem) => {
    setActioningId(row.userId);
    try {
      const result = await setCandidateBlocked(row.userId, !row.isBlocked);
      toast.success(result.message);
      setRows((prev) => prev.map((r) => (r.userId === row.userId ? { ...r, isBlocked: result.user.isBlocked } : r)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update employer.");
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleFeatured = async (row: EmployerAdminListItem) => {
    if (!row.company) return;
    const company = row.company;
    setActioningId(row.userId);
    try {
      const result = await setCompanyFeatured(company.id, !company.isFeaturedTopHiring);
      toast.success(
        result.isFeaturedTopHiring
          ? `${company.name} added to Top Companies Hiring`
          : `${company.name} removed from Top Companies Hiring`
      );
      setRows((prev) =>
        prev.map((r) => (r.userId === row.userId && r.company ? { ...r, company: { ...r.company, isFeaturedTopHiring: result.isFeaturedTopHiring } } : r))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update featured status.");
    } finally {
      setActioningId(null);
    }
  };

  const handleRevokeAutoApprove = async () => {
    if (!revokeTarget?.company) return;
    const { userId, company } = revokeTarget;
    setActioningId(userId);
    try {
      const result = await revokeCompanyAutoApprove(company.id);
      toast.success(
        result.jobsSetPending > 0
          ? `Auto-approval paused — ${result.jobsSetPending} job${result.jobsSetPending === 1 ? "" : "s"} set back to Pending.`
          : "Auto-approval paused."
      );
      setRows((prev) => prev.map((r) => (r.userId === userId && r.company ? { ...r, company: { ...r.company, autoApprove: false } } : r)));
      setRevokeTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to pause auto-approval.");
    } finally {
      setActioningId(null);
    }
  };

  const handleGrantAutoApprove = async () => {
    if (!grantTarget?.company) return;
    const { userId, company } = grantTarget;
    setActioningId(userId);
    try {
      const result = await grantCompanyAutoApprove(company.id);
      toast.success(
        result.jobsApproved > 0
          ? `Auto-approval granted — ${result.jobsApproved} pending job${result.jobsApproved === 1 ? "" : "s"} approved now.`
          : "Auto-approval granted."
      );
      setRows((prev) => prev.map((r) => (r.userId === userId && r.company ? { ...r, company: { ...r.company, autoApprove: true } } : r)));
      setGrantTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to grant auto-approval.");
    } finally {
      setActioningId(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getAllCompaniesAdmin({ ...filters, all: true });
      downloadCsv(toCsv(result.data), "employers");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to export employers.");
    } finally {
      setIsExporting(false);
    }
  };

  const columns: CommonTableColumn<EmployerAdminListItem>[] = [
    {
      key: "company",
      title: "Company",
      minWidth: 220,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {row.company?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveImageUrl(row.company.logo)}
              alt={row.company.name}
              className="w-8 h-8 rounded-lg object-cover border border-border/60"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
          )}
          {row.company ? (
            <span className="font-bold text-foreground">{row.company.name}</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-600">
              <UserX className="w-3.5 h-3.5" /> No company profile
            </span>
          )}
        </div>
      ),
    },
    {
      key: "owner",
      title: "Owner",
      minWidth: 180,
      render: (_, row) => <span className="text-muted-foreground font-medium">{row.fullName || row.email}</span>,
    },
    {
      key: "location",
      title: "Location",
      minWidth: 120,
      render: (_, row) => <span className="text-muted-foreground font-medium">{row.company?.jobLocation?.name ?? "—"}</span>,
    },
    {
      key: "jobs",
      title: "Jobs",
      minWidth: 70,
      render: (_, row) => <span className="font-bold text-foreground">{row.company?.jobCount ?? 0}</span>,
    },
    {
      key: "followers",
      title: "Followers",
      minWidth: 100,
      render: (_, row) => <span className="font-bold text-foreground">{row.company?.followerCount ?? 0}</span>,
    },
    {
      key: "reports",
      title: "Reports",
      minWidth: 130,
      render: (_, row) =>
        row.company && row.company.pendingReportCount > 0 ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-rose-50 text-rose-700 border-rose-200">
            {row.company.pendingReportCount} pending
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "featured",
      title: "Top Hiring",
      minWidth: 100,
      render: (_, row) =>
        row.company ? (
          <button
            title={row.company.isFeaturedTopHiring ? "Remove from Top Companies Hiring" : "Add to Top Companies Hiring"}
            disabled={actioningId === row.userId}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFeatured(row);
            }}
            className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
              row.company.isFeaturedTopHiring
                ? "text-amber-500 hover:bg-amber-100"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Star className={`w-4 h-4 ${row.company.isFeaturedTopHiring ? "fill-amber-400" : ""}`} />
          </button>
        ) : (
          <span className="text-muted-foreground px-2">—</span>
        ),
    },
    {
      key: "created",
      title: "Created",
      minWidth: 140,
      render: (_, row) => (
        <span className="text-muted-foreground font-medium">
          {formatDistanceToNow(new Date(row.registeredAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      minWidth: 100,
      render: (_, row) =>
        row.isBlocked ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-rose-50 text-rose-700 border-rose-200">
            Blocked
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-emerald-50 text-emerald-700 border-emerald-200">
            Active
          </span>
        ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      minWidth: 120,
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            title="Edit"
            disabled={actioningId === row.userId}
            onClick={() => setEditingRow(row)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            {actioningId === row.userId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
          </button>
          <button
            title="Delete Employer"
            disabled={actioningId === row.userId}
            onClick={() => setDeleteTarget(row)}
            className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <RowActionsMenu
            items={[
              {
                label: "Change Password",
                icon: <Lock className="w-4 h-4" />,
                onClick: () => setPasswordRow(row),
              },
              {
                label: row.isBlocked ? "Unblock Employer" : "Block Employer",
                icon: row.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />,
                onClick: () => handleToggleBlock(row),
              },
              {
                label: "Grant Credits",
                icon: <Coins className="w-4 h-4" />,
                onClick: () => setCreditsRow(row),
              },
              // Auto-approval is a Company-level setting -- nothing to
              // toggle for a row with no company yet.
              ...(row.company
                ? [
                    {
                      label: row.company.autoApprove ? "Pause Auto-Approval" : "Grant Auto-Approval",
                      icon: row.company.autoApprove ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />,
                      onClick: () => (row.company?.autoApprove ? setRevokeTarget(row) : setGrantTarget(row)),
                      danger: row.company.autoApprove,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">Employers</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Every registered employer, complete or not, with job counts, followers, and pending reports.
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <CommonTable<EmployerAdminListItem, number>
        columns={columns}
        data={rows}
        rowKey={(r) => r.userId}
        loading={isLoading}
        emptyMessage="No employers found."
        onRowClick={(row) => row.company && router.push(`/dashboard/admin/employers/${row.company.id}`)}
        search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by company or owner..." }}
        resetFilters={{ onReset: () => setSearchInput(""), hasActiveFilters: !!searchInput }}
        exportButton={{ onClick: handleExport, disabled: isExporting || rows.length === 0 }}
        pagination={
          meta
            ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
            : undefined
        }
        selection={{
          pageIds: rows.map((r) => r.userId),
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
          deleteTarget?.company && deleteTarget.company.jobCount > 0
            ? `Permanently delete "${deleteTarget.company.name}" and its owner's account?\n\nThis will also delete ${deleteTarget.company.jobCount} job posting(s) and all of its follows, ratings, and reports, plus the employer's login, credit history, and resume unlock history.\n\nThis cannot be undone.`
            : `Permanently delete "${deleteTarget?.company?.name ?? deleteTarget?.fullName ?? deleteTarget?.email}" and their account?\n\nThis will also delete the employer's login, credit history, and resume unlock history.\n\nThis cannot be undone.`
        }
        confirmLabel="Delete"
        variant="danger"
        isConfirming={actioningId === deleteTarget?.userId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        title="Delete Selected Employers"
        message={
          selection.selectAllMatching
            ? `Permanently delete all ${selection.count(meta?.total ?? 0)} matching employers and their accounts?\n\nThis will also delete their job postings, follows, ratings, reports, credit history, and resume unlock history.\n\nThis cannot be undone.`
            : `Permanently delete ${selection.count(meta?.total ?? 0)} employer(s) and their accounts${
                selectedJobCount ? ` and ${selectedJobCount} of their job posting(s)` : ""
              }?\n\nThis will also delete their follows, ratings, reports, credit history, and resume unlock history.\n\nThis cannot be undone.`
        }
        confirmLabel="Delete All"
        variant="danger"
        isConfirming={isBulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setIsBulkDeleteOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!revokeTarget}
        title="Pause auto-approval?"
        message="Future job posts from this employer will need manual review again, and every job of theirs that's currently Approved will be set back to Pending for you to re-review."
        confirmLabel="Pause"
        variant="danger"
        isConfirming={actioningId === revokeTarget?.userId}
        onConfirm={handleRevokeAutoApprove}
        onCancel={() => setRevokeTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!grantTarget}
        title="Grant auto-approval?"
        message="Future job posts from this employer will skip manual review, and every job of theirs that's currently Pending will be approved right now too."
        confirmLabel="Grant"
        isConfirming={actioningId === grantTarget?.userId}
        onConfirm={handleGrantAutoApprove}
        onCancel={() => setGrantTarget(null)}
      />

      {editingRow && (
        <EditOwnerModal
          row={editingRow}
          onClose={() => setEditingRow(null)}
          onSaved={(owner) => {
            setRows((prev) =>
              prev.map((r) => (r.userId === editingRow.userId ? { ...r, fullName: owner.full_name, email: owner.email, phone: owner.phone } : r))
            );
            setEditingRow(null);
          }}
        />
      )}

      {passwordRow && (
        <ResetPasswordModal
          targetLabel={
            passwordRow.company
              ? `${passwordRow.fullName || passwordRow.email} (${passwordRow.company.name})`
              : passwordRow.fullName || passwordRow.email
          }
          userId={passwordRow.userId}
          onClose={() => setPasswordRow(null)}
        />
      )}

      {creditsRow && <GrantCreditsModal row={creditsRow} onClose={() => setCreditsRow(null)} />}
    </div>
  );
}
