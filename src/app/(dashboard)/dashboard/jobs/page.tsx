"use client";

import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react";
import { mockRecruiterJobs } from "@/data/dashboard";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export default function ManageJobsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = mockRecruiterJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Jobs</h1>
          <p className="text-muted-foreground mt-1 text-sm">View and manage your active job postings.</p>
        </div>
        <Link 
          href="/dashboard/jobs/new"
          className="inline-flex items-center justify-center gap-2 bg-[oklch(0.68_0.21_45)] text-white hover:bg-[oklch(0.55_0.22_45)] px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </Link>
      </div>

      {/* Filters Overlay */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs by title or location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-white focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border/60 rounded-xl hover:bg-secondary text-sm font-medium transition-colors">
          <Filter className="w-4 h-4 text-muted-foreground" />
          Filters
        </button>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-6 py-3 font-semibold">Job Title & Location</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Posted</th>
                <th className="px-6 py-3 font-semibold">Views</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No jobs found. Try adjusting your search.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{job.title}</div>
                      <div className="text-xs text-muted-foreground">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{job.type}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{job.count || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        job.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        job.status === "Closed" ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="View Details" className="p-2 rounded-lg hover:bg-[oklch(0.47_0.20_250)]/10 text-muted-foreground hover:text-[oklch(0.47_0.20_250)] transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button title="Edit Job" className="p-2 rounded-lg hover:bg-[oklch(0.47_0.20_250)]/10 text-muted-foreground hover:text-[oklch(0.47_0.20_250)] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button title="Delete Job" className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors">
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
    </div>
  );
}
