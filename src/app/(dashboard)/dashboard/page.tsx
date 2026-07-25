"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Briefcase, Users, Clock, CheckCircle2, Search, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAdminStats, getMyJobs, getMyApplications, ApiError, type AdminStats, type JobPost } from "@/lib/api";

interface StatCard {
  title: string;
  value: string;
  icon: typeof Briefcase;
  color: string;
}

function StatGrid({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-2xl p-5 border border-border/60 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{stat.value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setStats(await getAdminStats());
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Platform-wide activity at a glance.</p>
        </div>
        <Link
          href="/dashboard/admin/jobs"
          className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-blue-medium px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm whitespace-nowrap"
        >
          <Clock className="w-4 h-4" />
          Review Pending Jobs
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      {stats && (
        <StatGrid
          stats={[
            { title: "Total Jobs", value: String(stats.totalJobs), icon: Briefcase, color: "bg-blue-50 text-blue-600" },
            { title: "Pending Approval", value: String(stats.pendingJobs), icon: Clock, color: "bg-amber-50 text-amber-600" },
            { title: "Employers", value: String(stats.totalEmployers), icon: Users, color: "bg-emerald-50 text-emerald-600" },
            { title: "Candidates", value: String(stats.totalCandidates), icon: Users, color: "bg-purple-50 text-purple-600" },
          ]}
        />
      )}
    </div>
  );
}

function RecruiterOverview() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setJobs(await getMyJobs());
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Here is what is happening with your job listings today.</p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-blue-medium px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm whitespace-nowrap"
        >
          <Briefcase className="w-4 h-4" />
          Post a New Job
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <StatGrid
        stats={[
          { title: "Total Jobs Posted", value: String(jobs.length), icon: Briefcase, color: "bg-blue-50 text-blue-600" },
          { title: "Pending Approval", value: String(pending), icon: Clock, color: "bg-amber-50 text-amber-600" },
          { title: "Live Jobs", value: String(approved), icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
        ]}
      />
    </div>
  );
}

function CandidateOverview() {
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await getMyApplications();
      setApplicationCount(res.count);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your applications.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching from the backend API on mount, not duplicated React state
    load();
  }, [load]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Find your next opportunity.</p>
        </div>
        <Link
          href="/dashboard/browse-jobs"
          className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-blue-medium px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          Browse Jobs
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <StatGrid
        stats={[
          { title: "Applications Submitted", value: applicationCount === null ? "-" : String(applicationCount), icon: FileText, color: "bg-blue-50 text-blue-600" },
        ]}
      />
    </div>
  );
}

export default function DashboardOverview() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "admin") return <AdminOverview />;
  if (user.role === "employer" || user.role === "sub_admin") return <RecruiterOverview />;
  return <CandidateOverview />;
}
