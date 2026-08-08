"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download, Pencil, Trash2, Lock, ShieldOff, ShieldCheck, Loader2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getAllCandidateUsers,
  updateCandidateUser,
  deleteCandidateUser,
  setCandidateBlocked,
  resetCandidatePassword,
  type CandidateUserAdmin,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<CandidateUserAdmin | null>(null);
  const [passwordCandidate, setPasswordCandidate] = useState<CandidateUserAdmin | null>(null);

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setCandidates(await getAllCandidateUsers());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load candidates.");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this candidate account? This cannot be undone.")) return;
    setActioningId(id);
    try {
      const result = await deleteCandidateUser(id);
      toast.success(result.message);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete candidate.");
    } finally {
      setActioningId(null);
    }
  };

  const handleExport = () => {
    const csv = toCsv(filteredCandidates);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      (c.full_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Candidates</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Every registered candidate account.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredCandidates.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-white border border-border/60 hover:bg-secondary px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="relative flex-1 max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-blue transition-colors" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
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
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Name</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Email</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Phone</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Registered</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    Loading candidates...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-5 font-bold text-foreground">{candidate.full_name || "—"}</td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">{candidate.email}</td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">{candidate.phone || "—"}</td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-5">
                      {candidate.isBlocked ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-rose-50 text-rose-700 border-rose-200">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 transition-opacity ${actioningId === candidate.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
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
                          onClick={() => handleDelete(candidate.id)}
                          className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors disabled:opacity-30"
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
    </div>
  );
}
