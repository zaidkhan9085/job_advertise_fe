import { mockDashboardStats, mockRecentApplications } from "@/data/dashboard";
import { Briefcase, Users, Eye, CheckCircle2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DashboardOverview() {
  const statCards = [
    {
      title: "Total Active Jobs",
      value: mockDashboardStats.activeJobs.toString(),
      description: `Out of ${mockDashboardStats.totalJobs} total jobs posted`,
      icon: Briefcase,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Applications Received",
      value: mockDashboardStats.applicationsReceived.toString(),
      description: "+12% from last month",
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Profile Views",
      value: mockDashboardStats.viewsThisWeek.toString(),
      description: "In the last 7 days",
      icon: Eye,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Profile Completion",
      value: `${mockDashboardStats.profileCompletion}%`,
      description: "Update your company details",
      icon: CheckCircle2,
      color: "bg-brand-blue/5 text-brand-blue",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back, Global Construction!</h1>
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
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
              <p className="text-xs text-muted-foreground mt-4 font-medium">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Recent Applications</h2>
          <Link href="/dashboard/applications" className="text-sm font-semibold text-[oklch(0.47_0.20_250)] hover:underline">
            View all
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-6 py-3 font-semibold">Candidate</th>
                <th className="px-6 py-3 font-semibold">Role Applied</th>
                <th className="px-6 py-3 font-semibold">Applied</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {mockRecentApplications.map((app) => (
                <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{app.candidateName}</div>
                    <div className="text-xs text-muted-foreground">{app.candidateEmail}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{app.jobTitle}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      app.status === "Shortlisted" ? "bg-emerald-100 text-emerald-700" :
                      app.status === "Reviewed" ? "bg-blue-100 text-blue-700" :
                      app.status === "Rejected" ? "bg-rose-100 text-rose-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
