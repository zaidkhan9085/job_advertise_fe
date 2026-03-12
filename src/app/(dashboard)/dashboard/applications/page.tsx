"use client";

import { useState } from "react";
import { Search, Filter, Download, User, CheckCircle2, XCircle, Clock } from "lucide-react";
import { mockRecentApplications } from "@/data/dashboard";
import { formatDistanceToNow } from "date-fns";

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApps = mockRecentApplications.filter(app => 
    app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review and manage candidate applications.</p>
        </div>
      </div>

      {/* Filters Overlay */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by candidate or role..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-white focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border/60 rounded-xl hover:bg-secondary text-sm font-medium transition-colors">
          <Filter className="w-4 h-4 text-muted-foreground" />
          Status
        </button>
      </div>

      {/* Apps Grid/List */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-6 py-3 font-semibold">Candidate</th>
                <th className="px-6 py-3 font-semibold">Applied For</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No applications found.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary border border-border/60 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{app.candidateName}</div>
                          <div className="text-xs text-muted-foreground">{app.candidateEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{app.jobTitle}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        app.status === "Shortlisted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        app.status === "Reviewed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        app.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {app.status === "Pending" && <Clock className="w-3 h-3" />}
                        {app.status === "Shortlisted" && <CheckCircle2 className="w-3 h-3" />}
                        {app.status === "Rejected" && <XCircle className="w-3 h-3" />}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="Download Resume" className="p-2 border border-border/60 rounded-lg hover:bg-secondary text-foreground transition-colors flex items-center gap-1.5">
                          <Download className="w-4 h-4" /> <span className="hidden xl:inline text-xs font-semibold">Resume</span>
                        </button>
                        <select className="text-xs font-semibold border border-input rounded-lg p-2 bg-white outline-none cursor-pointer hover:bg-secondary transition-colors text-foreground">
                          <option value="Pending">Move to Pending</option>
                          <option value="Reviewed">Move to Reviewed</option>
                          <option value="Shortlisted">Shortlist</option>
                          <option value="Rejected">Reject</option>
                        </select>
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
