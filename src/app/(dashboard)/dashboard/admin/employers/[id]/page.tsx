"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Building, Globe, Star, Users, Briefcase, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { getCompanyAdminDetail, resolveImageUrl, type CompanyAdminDetail, type JobPostStatus, type ReportStatus, ApiError } from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

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
  const [company, setCompany] = useState<CompanyAdminDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompany = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setCompany(await getCompanyAdminDetail(params.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load employer.");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadCompany();
    }
  }, [user, loadCompany]);

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
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {company.jobs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground font-medium">
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
