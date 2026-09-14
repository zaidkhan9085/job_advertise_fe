"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Search,
  FileText,
  MessageSquare,
  Star,
  FileCheck2,
  Flag,
  PlayCircle,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminStats,
  getMyJobs,
  getMyApplications,
  getMyCompany,
  getJobLeads,
  getMyResume,
  getMyCandidateProfile,
  getReports,
  ApiError,
  type AdminStats,
  type JobPost,
} from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import { computeProfileCompleteness } from "@/lib/profileCompleteness";

function OverviewHeader({
  title,
  subtitle,
  actionHref,
  actionLabel,
  actionIcon: ActionIcon,
}: {
  title: string;
  subtitle: string;
  actionHref: string;
  actionLabel: string;
  actionIcon: typeof Briefcase;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <Link
        href={actionHref}
        className="inline-flex items-center justify-center gap-2 bg-button-gradient text-white hover:bg-brand-blue-medium px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm whitespace-nowrap"
      >
        <ActionIcon className="w-4 h-4" />
        {actionLabel}
      </Link>
    </div>
  );
}

// A row of secondary, same-size action links below the main stat grid --
// for actions that don't have their own number to show (Post a Story,
// Search Candidates, Complete Profile, ...).
function QuickActions({ actions }: { actions: { label: string; href: string; icon: typeof Briefcase }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-2.5 bg-white rounded-2xl p-4 border border-border/60 shadow-sm hover:border-brand-blue/40 hover:shadow-md transition-all font-semibold text-sm text-foreground"
          >
            <Icon className="w-4 h-4 text-brand-blue shrink-0" />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [openReports, setOpenReports] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        getAdminStats(),
        getReports({ status: "PENDING", limit: 1 }),
      ]);
      setStats(statsRes);
      setOpenReports(reportsRes.meta.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load stats.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching from the backend API on mount, not duplicated React state
    load();
  }, [load]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <OverviewHeader
        title="Admin Overview"
        subtitle="Platform-wide activity at a glance."
        actionHref="/dashboard/admin/jobs"
        actionLabel="Review Pending Jobs"
        actionIcon={Clock}
      />

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Jobs" value={String(stats.totalJobs)} icon={Briefcase} color="bg-blue-50 text-blue-600" href="/dashboard/admin/all-jobs" />
          <StatCard title="Pending Approval" value={String(stats.pendingJobs)} icon={Clock} color="bg-amber-50 text-amber-600" href="/dashboard/admin/jobs" />
          <StatCard title="Employers" value={String(stats.totalEmployers)} icon={Users} color="bg-emerald-50 text-emerald-600" href="/dashboard/admin/employers" />
          <StatCard title="Candidates" value={String(stats.totalCandidates)} icon={Users} color="bg-purple-50 text-purple-600" href="/dashboard/search-candidates" />
          <StatCard
            title="Open Reports"
            value={openReports === null ? "-" : String(openReports)}
            icon={Flag}
            color="bg-rose-50 text-rose-600"
            href="/dashboard/admin/reports"
          />
        </div>
      )}
    </div>
  );
}

function RecruiterOverview() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [leadsCount, setLeadsCount] = useState<number | null>(null);
  const [company, setCompany] = useState<{ followerCount: number; averageRating: number; ratingCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [jobsRes, leadsRes, companyRes] = await Promise.all([
        getMyJobs(),
        getJobLeads(),
        getMyCompany(),
      ]);
      setJobs(jobsRes);
      setLeadsCount(leadsRes.count);
      if (companyRes) {
        setCompany({
          followerCount: companyRes.followerCount,
          averageRating: companyRes.averageRating,
          ratingCount: companyRes.ratingCount,
        });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your jobs.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching from the backend API on mount, not duplicated React state
    load();
  }, [load]);

  const pending = jobs.filter((j) => j.status === "PENDING").length;
  const approved = jobs.filter((j) => j.status === "APPROVED").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <OverviewHeader
        title="Overview"
        subtitle="Your job posting activity at a glance."
        actionHref="/dashboard/jobs/new"
        actionLabel="Post a New Job"
        actionIcon={Briefcase}
      />

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Jobs Posted" value={String(jobs.length)} icon={Briefcase} color="bg-blue-50 text-blue-600" href="/dashboard/jobs" />
        <StatCard title="Pending Approval" value={String(pending)} icon={Clock} color="bg-amber-50 text-amber-600" href="/dashboard/jobs" />
        <StatCard title="Live Jobs" value={String(approved)} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" href="/dashboard/jobs" />
        <StatCard
          title="Contact Leads"
          value={leadsCount === null ? "-" : String(leadsCount)}
          icon={MessageSquare}
          color="bg-cyan-50 text-cyan-600"
          href="/dashboard/jobs?tab=leads"
        />
        {company && (
          <StatCard
            title="Followers"
            value={String(company.followerCount)}
            icon={Users}
            color="bg-indigo-50 text-indigo-600"
            href="/dashboard/profile"
          />
        )}
        {company && (
          <StatCard
            title="Avg. Rating"
            value={`${company.averageRating.toFixed(1)} (${company.ratingCount})`}
            icon={Star}
            color="bg-orange-50 text-orange-600"
            href="/dashboard/profile"
          />
        )}
      </div>

      <QuickActions
        actions={[
          { label: "Post a Story", href: "/dashboard/stories/new", icon: PlayCircle },
          { label: "Search Candidates", href: "/dashboard/search-candidates", icon: Search },
          { label: "Company Profile", href: "/dashboard/profile", icon: UserCircle2 },
        ]}
      />
    </div>
  );
}

function CandidateOverview() {
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const [completeness, setCompleteness] = useState<number | null>(null);
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [applicationsRes, profileRes, resumeRes] = await Promise.all([
        getMyApplications(),
        getMyCandidateProfile(),
        getMyResume(),
      ]);
      setApplicationCount(applicationsRes.count);
      setCompleteness(computeProfileCompleteness(profileRes).completeness);
      setHasResume(!!resumeRes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your activity.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching from the backend API on mount, not duplicated React state
    load();
  }, [load]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <OverviewHeader
        title="Overview"
        subtitle="Your job search activity at a glance."
        actionHref="/jobs"
        actionLabel="Browse Jobs"
        actionIcon={Search}
      />

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Applications Submitted"
          value={applicationCount === null ? "-" : String(applicationCount)}
          icon={FileText}
          color="bg-blue-50 text-blue-600"
          href="/dashboard/applications"
        />
        <StatCard
          title="Profile Completeness"
          value={completeness === null ? "-" : `${completeness}%`}
          icon={UserCircle2}
          color="bg-emerald-50 text-emerald-600"
          href="/dashboard/my-profile"
        />
        <StatCard
          title="Resume"
          value={hasResume === null ? "-" : hasResume ? "Built" : "Not built"}
          icon={FileCheck2}
          color="bg-purple-50 text-purple-600"
          href="/resume-builder"
        />
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "admin") return <AdminOverview />;
  if (user.role === "employer" || user.role === "sub_admin") return <RecruiterOverview />;
  return <CandidateOverview />;
}
