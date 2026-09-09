"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Building, Globe, Star, Users, Briefcase, Flag, ArrowLeft, Pencil, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getCompanyAdminDetail, rateCompany, unrateCompany, setCompanyBonusFollowers, resolveImageUrl, type CompanyAdminDetail, type JobPostStatus, type ReportStatus, ApiError } from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import StarRatingInput from "@/components/common/StarRatingInput";

const JOB_STATUS_STYLES: Record<JobPostStatus, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  EXPIRED: "bg-secondary text-muted-foreground border-border/60",
};

const REPORT_STATUS_STYLES: Record<ReportStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  VIEWED: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  DISMISSED: "bg-secondary text-muted-foreground border-border/60",
};

export default function AdminEmployerDetailPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyAdminDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRatingSaving, setIsRatingSaving] = useState(false);
  const [isEditingBonus, setIsEditingBonus] = useState(false);
  const [bonusInput, setBonusInput] = useState("0");
  const [isBonusSaving, setIsBonusSaving] = useState(false);

  // `silent` skips the full-page loading state -- used when refreshing
  // after an in-place action (rating, clearing a rating, saving bonus
  // followers) so the whole page doesn't flash to "Loading employer..."
  // and back for what should be a small, local update. Only the initial
  // load (no data on screen yet) needs the full loading placeholder.
  const loadCompany = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setIsLoading(true);
    setError(null);
    try {
      setCompany(await getCompanyAdminDetail(params.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load employer.");
    } finally {
      if (!options?.silent) setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadCompany();
    }
  }, [user, loadCompany]);

  // Admin's own rating -- exactly the same rateCompany a candidate/employer
  // uses, so it blends into the average as one real vote, not an override.
  const handleRate = async (rating: number) => {
    setIsRatingSaving(true);
    try {
      await rateCompany(params.id, rating);
      toast.success("Rating submitted");
      await loadCompany({ silent: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit rating.");
    } finally {
      setIsRatingSaving(false);
    }
  };

  const handleClearRating = async () => {
    setIsRatingSaving(true);
    try {
      await unrateCompany(params.id);
      toast.success("Rating removed");
      await loadCompany({ silent: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove rating.");
    } finally {
      setIsRatingSaving(false);
    }
  };

  const startEditingBonus = () => {
    setBonusInput(String(company?.bonusFollowers ?? 0));
    setIsEditingBonus(true);
  };

  const saveBonus = async () => {
    const value = Number(bonusInput);
    if (!Number.isInteger(value) || value < 0) {
      toast.error("Bonus followers must be a non-negative whole number");
      return;
    }
    setIsBonusSaving(true);
    try {
      await setCompanyBonusFollowers(params.id, value);
      toast.success("Bonus followers updated");
      setIsEditingBonus(false);
      await loadCompany({ silent: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update bonus followers.");
    } finally {
      setIsBonusSaving(false);
    }
  };

  if (user && user.role !== "admin") {
    return <ComingSoon title="Employers" />;
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
        Loading employer...
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">
        {error || "Employer not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Reachable from both the Employers list and the Reports queue --
          router.back() returns to whichever one the admin actually came
          from, instead of assuming a single fixed origin. */}
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {company.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(company.logo)}
            alt={company.name}
            className="w-16 h-16 rounded-xl object-cover border border-border/60"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <Building className="w-7 h-7" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-foreground">{company.name}</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Owned by {company.owner.full_name || company.owner.email} &middot; {company.region?.name ?? "No region set"}
          </p>
          {company.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{company.description}</p>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:underline mt-2"
            >
              <Globe className="w-3.5 h-3.5" />
              {company.website}
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">{company.jobs.length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jobs</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">{company.followerCount}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Followers</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">
              {company.averageRating.toFixed(1)}{" "}
              <span className="text-xs font-bold text-muted-foreground">({company.ratingCount})</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rating</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">{company.reports.length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reports</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Your rating</div>
          <StarRatingInput value={company.myRating ?? 0} onChange={handleRate} onClear={handleClearRating} size={isRatingSaving ? "w-6 h-6 opacity-50 pointer-events-none" : "w-6 h-6"} />
        </div>
        <div className="sm:border-l sm:border-border/60 sm:pl-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Bonus followers</div>
          {isEditingBonus ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={bonusInput}
                onChange={(e) => setBonusInput(e.target.value)}
                disabled={isBonusSaving}
                className="w-24 px-2 py-1.5 rounded-lg border border-border/60 text-sm font-bold"
                autoFocus
              />
              <button onClick={saveBonus} disabled={isBonusSaving} title="Save" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditingBonus(false)} disabled={isBonusSaving} title="Cancel" className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-50">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={startEditingBonus} className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-brand-blue">
              +{company.bonusFollowers} <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 font-black text-foreground text-sm uppercase tracking-wide">
          Jobs
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Title</th>
                <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Posted</th>
                <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Applicants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {company.jobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground font-medium">
                    No jobs posted yet.
                  </td>
                </tr>
              ) : (
                company.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/admin/all-jobs/${job.id}/edit`} className="font-bold text-foreground hover:text-brand-blue">
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} styles={JOB_STATUS_STYLES} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/admin/all-jobs/${job.id}/applicants`}
                        className="font-bold text-brand-blue hover:underline"
                      >
                        {job.applicationsCount || 0}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 font-black text-foreground text-sm uppercase tracking-wide">
          Reports
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Reason</th>
                <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Reporter</th>
                <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Reported</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {company.reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground font-medium">
                    No reports against this employer.
                  </td>
                </tr>
              ) : (
                company.reports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium max-w-xs truncate">{report.reason}</td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {report.reporter.full_name || report.reporter.email}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} styles={REPORT_STATUS_STYLES} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
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
