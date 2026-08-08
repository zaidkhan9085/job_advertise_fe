"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Pencil, Trash2, Lock, ShieldOff, ShieldCheck, Loader2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getAllCandidateUsers,
  updateCandidateUser,
  deleteCandidateUser,
  bulkDeleteCandidateUsers,
  setCandidateBlocked,
  resetCandidatePassword,
  type CandidateUserAdmin,
  type PaginatedMeta,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { useTableSelection } from "@/hooks/useTableSelection";

const PAGE_LIMIT = 20;

function toCsv(candidates: CandidateUserAdmin[]): string {
  const header = ["Name", "Email", "Phone", "Location", "Verified", "Blocked", "Registered"];
  const rows = candidates.map((c) => [
    c.full_name ?? "",
    c.email,
    c.phone ?? "",
    c.location ?? "",
    c.is_verified ? "Yes" : "No",
    c.isBlocked ? "Yes" : "No",
    c.created_at,
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

function EditCandidateModal({
  candidate,
  onClose,
  onSaved,
}: {
  candidate: CandidateUserAdmin;
  onClose: () => void;
  onSaved: (updated: CandidateUserAdmin) => void;
}) {
  const [fullName, setFullName] = useState(candidate.full_name ?? "");
  const [email, setEmail] = useState(candidate.email);
  const [phone, setPhone] = useState(candidate.phone ?? "");
  const [location, setLocation] = useState(candidate.location ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateCandidateUser(candidate.id, {
        full_name: fullName,
        email,
        phone,
        location,
      });
      toast.success("Candidate updated");
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update candidate.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Edit Candidate</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
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
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
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

function PasswordModal({
  candidate,
  onClose,
}: {
  candidate: CandidateUserAdmin;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsSaving(true);
    try {
      await resetCandidatePassword(candidate.id, password);
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
          Set a new password for {candidate.full_name || candidate.email}.
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

export default function AdminCandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateUserAdmin[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [actioningId, setActioningId] = useState<number | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<CandidateUserAdmin | null>(null);
  const [passwordCandidate, setPasswordCandidate] = useState<CandidateUserAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CandidateUserAdmin | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const selection = useTableSelection<number>();

  // Debounce the search box so every keystroke doesn't hit the backend.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, dateFrom, dateTo]);

  const filters = useMemo(
    () => ({ search: search || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
    [search, dateFrom, dateTo]
  );

  const loadCandidates = useCallback(async () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateError("'From' date must be before or equal to 'To' date.");
      return;
    }
    setDateError(null);
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllCandidateUsers({ ...filters, page, limit: PAGE_LIMIT });
      setCandidates(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load candidates.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, dateFrom, dateTo]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "sub_admin") {
      loadCandidates();
    }
  }, [user, loadCandidates]);

  if (user && user.role !== "admin" && user.role !== "sub_admin") {
    return <ComingSoon title="Candidates" />;
  }

  const handleToggleBlock = async (candidate: CandidateUserAdmin) => {
    setActioningId(candidate.id);
    try {
      const result = await setCandidateBlocked(candidate.id, !candidate.isBlocked);
      toast.success(result.message);
      setCandidates((prev) => prev.map((c) => (c.id === candidate.id ? result.user : c)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update candidate.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActioningId(deleteTarget.id);
    try {
      const result = await deleteCandidateUser(deleteTarget.id);
      toast.success(result.message);
      setDeleteTarget(null);
      loadCandidates();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete candidate.");
    } finally {
      setActioningId(null);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const result = await bulkDeleteCandidateUsers(selection.toBulkDeletePayload(filters));
      if (result.failed.length > 0) {
        toast.error(`Deleted ${result.deleted.length}, but ${result.failed.length} couldn't be deleted (existing data).`);
      } else {
        toast.success(`Deleted ${result.deleted.length} candidate(s).`);
      }
      selection.clear();
      setIsBulkDeleteOpen(false);
      loadCandidates();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete candidates.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getAllCandidateUsers({ ...filters, all: true });
      downloadCsv(toCsv(result.data), "candidates");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to export candidates.");
    } finally {
      setIsExporting(false);
    }
  };

  const columns: CommonTableColumn<CandidateUserAdmin>[] = [
    {
      key: "name",
      title: "Name",
      render: (_, c) => <span className="font-bold text-foreground">{c.full_name || "—"}</span>,
    },
    {
      key: "email",
      title: "Email",
      render: (_, c) => <span className="text-muted-foreground font-medium">{c.email}</span>,
    },
    {
      key: "phone",
      title: "Phone",
      render: (_, c) => <span className="text-muted-foreground font-medium">{c.phone || "—"}</span>,
    },
    {
      key: "registered",
      title: "Registered",
      render: (_, c) => (
        <span className="text-muted-foreground font-medium">
          {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, c) =>
        c.isBlocked ? (
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
      render: (_, candidate) => (
        <div
          className={`flex items-center justify-end gap-1 transition-opacity ${
            actioningId === candidate.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            title="Edit"
            disabled={actioningId === candidate.id}
            onClick={() => setEditingCandidate(candidate)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            title="Change Password"
            disabled={actioningId === candidate.id}
            onClick={() => setPasswordCandidate(candidate)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            title={candidate.isBlocked ? "Unblock" : "Block"}
            disabled={actioningId === candidate.id}
            onClick={() => handleToggleBlock(candidate)}
            className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
              candidate.isBlocked
                ? "text-emerald-600 hover:bg-emerald-100"
                : "text-muted-foreground hover:bg-amber-100 hover:text-amber-700"
            }`}
          >
            {actioningId === candidate.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : candidate.isBlocked ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldOff className="w-4 h-4" />
            )}
          </button>
          <button
            title="Delete"
            disabled={actioningId === candidate.id}
            onClick={() => setDeleteTarget(candidate)}
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
        <h1 className="text-2xl font-black text-foreground">Candidates</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Every registered candidate account.</p>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}
      {dateError && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{dateError}</div>}

      <CommonTable<CandidateUserAdmin, number>
        columns={columns}
        data={candidates}
        rowKey={(c) => c.id}
        loading={isLoading}
        emptyMessage="No candidates found."
        search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by name, email, or phone..." }}
        filters={
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-3 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium"
              aria-label="Registered from"
            />
            <span className="text-muted-foreground text-sm font-medium">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-3 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium"
              aria-label="Registered to"
            />
          </div>
        }
        exportButton={{ onClick: handleExport, disabled: isExporting || candidates.length === 0 }}
        pagination={
          meta
            ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
            : undefined
        }
        selection={{
          pageIds: candidates.map((c) => c.id),
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

      {editingCandidate && (
        <EditCandidateModal
          candidate={editingCandidate}
          onClose={() => setEditingCandidate(null)}
          onSaved={(updated) => {
            setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setEditingCandidate(null);
          }}
        />
      )}

      {passwordCandidate && (
        <PasswordModal candidate={passwordCandidate} onClose={() => setPasswordCandidate(null)} />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Candidate"
        message={`Delete ${deleteTarget?.full_name || deleteTarget?.email}'s account? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isConfirming={actioningId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        title="Delete Selected Candidates"
        message={`Delete ${selection.count(meta?.total ?? 0)} candidate account(s)? This cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        isConfirming={isBulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setIsBulkDeleteOpen(false)}
      />
    </div>
  );
}
