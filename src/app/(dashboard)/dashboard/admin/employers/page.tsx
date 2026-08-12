"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Building, ExternalLink, Trash2, Pencil, Lock, ShieldOff, ShieldCheck, Loader2, X, Coins } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getAllCompaniesAdmin,
  deleteCompanyAdmin,
  bulkDeleteCompanies,
  updateCandidateUser,
  setCandidateBlocked,
  resetCandidatePassword,
  grantCreditsToCompany,
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

function toCsv(companies: CompanyAdminListItem[]): string {
  const header = ["Company", "Owner Name", "Owner Email", "Owner Phone", "Region", "Jobs", "Followers", "Pending Reports", "Blocked", "Created"];
  const rows = companies.map((c) => [
    c.name,
    c.owner.full_name ?? "",
    c.owner.email,
    c.owner.phone ?? "",
    c.region?.name ?? "",
    String(c._count.jobs),
    String(c._count.follows),
    String(c.pendingReportCount),
    c.owner.isBlocked ? "Yes" : "No",
    c.createdAt,
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

// Edit/block/reset-password below act on the employer's account (the User
// behind company.owner) via the same generic admin-user endpoints already
// built for Candidates — those endpoints aren't role-restricted on the
// target, just on the caller (admin/sub_admin).
function EditOwnerModal({
  company,
  onClose,
  onSaved,
}: {
  company: CompanyAdminListItem;
  onClose: () => void;
  onSaved: (owner: { id: number; full_name: string | null; email: string; phone: string | null }) => void;
}) {
  const [fullName, setFullName] = useState(company.owner.full_name ?? "");
  const [email, setEmail] = useState(company.owner.email);
  const [phone, setPhone] = useState(company.owner.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateCandidateUser(company.owner.id, { full_name: fullName, email, phone });
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

function PasswordModal({ company, onClose }: { company: CompanyAdminListItem; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsSaving(true);
    try {
      await resetCandidatePassword(company.owner.id, password);
      toast.success("Password updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Change Password</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Set a new password for {company.owner.full_name || company.owner.email} ({company.name}).
        </p>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          type="password"
          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-colors disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

function GrantCreditsModal({ company, onClose }: { company: CompanyAdminListItem; onClose: () => void }) {
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
      const result = await grantCreditsToCompany(company.id, amountNum, note || undefined);
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
          Add credits to {company.name}&apos;s balance for ATS candidate unlocks.
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
  const [editingCompany, setEditingCompany] = useState<CompanyAdminListItem | null>(null);
  const [passwordCompany, setPasswordCompany] = useState<CompanyAdminListItem | null>(null);
  const [creditsCompany, setCreditsCompany] = useState<CompanyAdminListItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleToggleBlock = async (company: CompanyAdminListItem) => {
    setActioningId(company.id);
    try {
      const result = await setCandidateBlocked(company.owner.id, !company.owner.isBlocked);
      toast.success(result.message);
      setCompanies((prev) =>
        prev.map((c) => (c.id === company.id ? { ...c, owner: { ...c.owner, isBlocked: result.user.isBlocked } } : c))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update employer.");
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
      key: "status",
      title: "Status",
      minWidth: 100,
      render: (_, company) =>
        company.owner.isBlocked ? (
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
      minWidth: 250,
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
            title="Edit"
            disabled={actioningId === company.id}
            onClick={() => setEditingCompany(company)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            title="Change Password"
            disabled={actioningId === company.id}
            onClick={() => setPasswordCompany(company)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            title={company.owner.isBlocked ? "Unblock" : "Block"}
            disabled={actioningId === company.id}
            onClick={() => handleToggleBlock(company)}
            className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
              company.owner.isBlocked
                ? "text-emerald-600 hover:bg-emerald-100"
                : "text-muted-foreground hover:bg-amber-100 hover:text-amber-700"
            }`}
          >
            {actioningId === company.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : company.owner.isBlocked ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldOff className="w-4 h-4" />
            )}
          </button>
          <button
            title="Grant Credits"
            disabled={actioningId === company.id}
            onClick={() => setCreditsCompany(company)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <Coins className="w-4 h-4" />
          </button>
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
        exportButton={{ onClick: handleExport, disabled: isExporting || companies.length === 0 }}
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

      {editingCompany && (
        <EditOwnerModal
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSaved={(owner) => {
            setCompanies((prev) => prev.map((c) => (c.id === editingCompany.id ? { ...c, owner: { ...c.owner, ...owner } } : c)));
            setEditingCompany(null);
          }}
        />
      )}

      {passwordCompany && <PasswordModal company={passwordCompany} onClose={() => setPasswordCompany(null)} />}

      {creditsCompany && <GrantCreditsModal company={creditsCompany} onClose={() => setCreditsCompany(null)} />}
    </div>
  );
}
