"use client";

import { useMemo, useState } from "react";
import { Phone, MessageCircle, Search, Download, Loader2, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { recordJobInteraction, type JobLead } from "@/lib/api";

const SOURCE_LABEL: Record<JobLead["source"], string> = {
  CANDIDATE: "Applied",
  EMPLOYER: "Added by you",
  ADMIN: "Added by admin",
};

function toCsv(leads: JobLead[]): string {
  const header = ["Name", "Phone", "Location", "Job", "Position", "Industry", "Qualification", "Experience", "Source", "Date"];
  const rows = leads.map((l) => [
    l.name,
    l.phone,
    l.location ?? "",
    l.jobTitle,
    l.position,
    l.industry,
    l.qualification,
    l.isFresher ? "Fresher" : l.experienceYears != null ? `${l.experienceYears} yrs` : "",
    SOURCE_LABEL[l.source],
    l.createdAt,
  ]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

function downloadCsv(csv: string, filenamePrefix: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadsTable({
  leads,
  isLoading,
  showJobColumn = true,
  onAddApplicant,
}: {
  leads: JobLead[];
  isLoading: boolean;
  // Hidden on the per-job Applicants page, where every row is already the
  // same job -- shown on the all-jobs Contact Leads tab.
  showJobColumn?: boolean;
  onAddApplicant?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) => [l.name, l.phone, l.jobTitle, l.qualification, l.position].some((v) => v.toLowerCase().includes(q)));
  }, [leads, search]);

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.applicationId));
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(filtered.map((l) => l.applicationId)));
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = () => {
    const rows = selected.size > 0 ? filtered.filter((l) => selected.has(l.applicationId)) : filtered;
    downloadCsv(toCsv(rows), "contact-leads");
  };

  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, phone, job, skill..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          {onAddApplicant && (
            <button
              onClick={onAddApplicant}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue/90"
            >
              <UserPlus className="w-4 h-4" /> Add Applicant
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border/60 text-sm font-bold text-foreground hover:bg-secondary/60 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-muted/30 text-muted-foreground border-b border-border/60">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-brand-blue" />
              </th>
              <th className="px-4 py-3 font-black uppercase tracking-widest text-[10px]">Candidate</th>
              {showJobColumn && <th className="px-4 py-3 font-black uppercase tracking-widest text-[10px]">Job</th>}
              <th className="px-4 py-3 font-black uppercase tracking-widest text-[10px]">Details</th>
              <th className="px-4 py-3 font-black uppercase tracking-widest text-[10px]">Applied</th>
              <th className="px-4 py-3 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-medium">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-medium">
                  No leads yet.
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr key={lead.applicationId} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(lead.applicationId)}
                      onChange={() => toggleOne(lead.applicationId)}
                      className="w-4 h-4 rounded accent-brand-blue"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-foreground">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[lead.phone, lead.location].filter(Boolean).join(" · ")}
                    </div>
                  </td>
                  {showJobColumn && <td className="px-4 py-4 text-muted-foreground font-medium">{lead.jobTitle}</td>}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {lead.qualification && (
                        <span className="text-[11px] font-bold bg-secondary/60 rounded-full px-2 py-0.5">{lead.qualification}</span>
                      )}
                      {(lead.isFresher || lead.experienceYears != null) && (
                        <span className="text-[11px] font-bold bg-secondary/60 rounded-full px-2 py-0.5">
                          {lead.isFresher ? "Fresher" : `${lead.experienceYears} yrs`}
                        </span>
                      )}
                      {lead.industry && <span className="text-[11px] font-bold bg-secondary/60 rounded-full px-2 py-0.5">{lead.industry}</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-semibold mt-1">{SOURCE_LABEL[lead.source]}</div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground font-medium">
                    {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^\d+]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => recordJobInteraction(lead.jobId, "WHATSAPP")}
                          className="p-2 rounded-lg hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
