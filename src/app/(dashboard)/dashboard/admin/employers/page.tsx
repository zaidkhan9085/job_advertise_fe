"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Search, Building, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { getAllCompaniesAdmin, resolveImageUrl, type CompanyAdminListItem, ApiError } from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function AdminEmployersPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyAdminListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setCompanies(await getAllCompaniesAdmin());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load employers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      loadCompanies();
    }
  }, [user, loadCompanies]);

  if (user && user.role !== "admin") {
    return <ComingSoon title="Employers" />;
  }

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.owner.full_name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">Employers</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Every registered company, with job counts, followers, and pending reports.
        </p>
      </div>

      <div className="relative flex-1 max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-blue transition-colors" />
        <input
          type="text"
          placeholder="Search by company or owner..."
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
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Company</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Owner</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Region</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Jobs</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Followers</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Reports</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Created</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    Loading employers...
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No employers found.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resolveImageUrl(company.logo)}
                            alt={company.name}
                            className="w-8 h-8 rounded-lg object-cover border border-border/60"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                            <Building className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-bold text-foreground">{company.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      {company.owner.full_name || company.owner.email}
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      {company.region?.name ?? "—"}
                    </td>
                    <td className="px-6 py-5 font-bold text-foreground">{company._count.jobs}</td>
                    <td className="px-6 py-5 font-bold text-foreground">{company._count.follows}</td>
                    <td className="px-6 py-5">
                      {company.pendingReportCount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-rose-50 text-rose-700 border-rose-200">
                          {company.pendingReportCount} pending
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(company.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/admin/employers/${company.id}`}
                        title="View Employer"
                        className="inline-flex p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
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
