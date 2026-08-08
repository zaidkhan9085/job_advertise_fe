"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, FileText, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getAllCandidateProfilesAdmin,
  approveCandidateProfile,
  rejectCandidateProfile,
  resolveImageUrl,
  type CandidateProfileAdmin,
  type ProfileStatus,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { StatusFilterPills } from "@/components/dashboard/StatusFilterPills";

const STATUS_STYLES: Record<ProfileStatus, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
};

const FILTER_OPTIONS = ["PENDING", "APPROVED", "REJECTED", "ALL"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

export default function AdminCandidatesPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<CandidateProfileAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterOption>("PENDING");
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [actioningAction, setActioningAction] = useState<"APPROVE" | "REJECT" | null>(null);

  const loadProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProfiles(
        await getAllCandidateProfilesAdmin(statusFilter === "ALL" ? undefined : { status: statusFilter })
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load candidates.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "sub_admin") {
      loadProfiles();
    }
  }, [user, loadProfiles]);

  if (user && user.role !== "admin" && user.role !== "sub_admin") {
    return <ComingSoon title="Candidates" />;
  }

  const handleDecision = async (id: number, action: "APPROVE" | "REJECT") => {
    setActioningId(id);
    setActioningAction(action);
    try {
      if (action === "APPROVE") {
        await approveCandidateProfile(id);
        toast.success("Candidate profile approved");
      } else {
        await rejectCandidateProfile(id);
        toast.success("Candidate profile rejected");
      }
      setProfiles((prev) =>
        statusFilter === "ALL"
          ? prev.map((p) => (p.id === id ? { ...p, status: action === "APPROVE" ? "APPROVED" : "REJECTED" } : p))
          : prev.filter((p) => p.id !== id)
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update candidate profile.");
    } finally {
      setActioningId(null);
      setActioningAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">Candidates</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Review and approve candidate profiles.
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
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Name & Position</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Contact</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Location</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Resume</th>
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
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-foreground">{profile.name}</div>
                      <div className="text-xs text-muted-foreground font-medium">{profile.position}</div>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      <div>{profile.email}</div>
                      <div className="text-xs">{profile.whatsapp}</div>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {profile.currentLocation || "Not specified"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {profile.resumeUrl ? (
                        <a
                          href={resolveImageUrl(profile.resumeUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-brand-blue font-bold hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={profile.status} styles={STATUS_STYLES} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {profile.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Reject"
                            disabled={actioningId === profile.id}
                            onClick={() => handleDecision(profile.id, "REJECT")}
                            className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors disabled:opacity-30"
                          >
                            {actioningId === profile.id && actioningAction === "REJECT" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            title="Approve"
                            disabled={actioningId === profile.id}
                            onClick={() => handleDecision(profile.id, "APPROVE")}
                            className="p-2 rounded-lg hover:bg-emerald-100 text-muted-foreground hover:text-emerald-600 transition-colors disabled:opacity-30"
                          >
                            {actioningId === profile.id && actioningAction === "APPROVE" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
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
