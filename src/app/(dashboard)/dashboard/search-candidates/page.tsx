"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { Coins, Lock, Phone, Mail, Printer, X, Loader2, FileText, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  searchCandidates,
  unlockCandidate,
  getMyCredits,
  getRegions,
  type ATSCandidate,
  type CreditsSummary,
  type Region,
  type PaginatedMeta,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";
import Preview from "@/components/resume-builder/Preview";

const PAGE_LIMIT = 20;
const UNLOCK_COST = 1;

function ResumeModal({
  candidate,
  resume,
  onClose,
}: {
  candidate: ATSCandidate;
  resume: { theme: unknown; sections: unknown } | null;
  onClose: () => void;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: previewRef, documentTitle: `Resume_${candidate.name}` });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/60 shrink-0">
          <div>
            <h3 className="font-bold text-foreground">{candidate.name}</h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
              {candidate.whatsapp && (
                <a
                  href={`https://wa.me/${candidate.whatsapp.replace(/[^\d+]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" /> {candidate.whatsapp}
                </a>
              )}
              {candidate.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {candidate.email}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {resume && (
              <button
                onClick={() => handlePrint()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue/90"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            )}
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-secondary/30 p-6 flex justify-center">
          {resume ? (
            <Preview ref={previewRef} data={{ theme: resume.theme, sections: resume.sections }} />
          ) : (
            <div className="text-center text-muted-foreground py-20">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              This candidate hasn&apos;t built a resume yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchCandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<ATSCandidate[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [credits, setCredits] = useState<CreditsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [regionId, setRegionId] = useState("");
  const [nationality, setNationality] = useState("");
  const [page, setPage] = useState(1);

  const [unlockingId, setUnlockingId] = useState<number | null>(null);
  const [viewing, setViewing] = useState<{ candidate: ATSCandidate; resume: { theme: unknown; sections: unknown } | null } | null>(
    null
  );

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, regionId, nationality]);

  const filters = useMemo(
    () => ({ search: search || undefined, region: regionId || undefined, nationality: nationality || undefined }),
    [search, regionId, nationality]
  );

  const loadCredits = useCallback(async () => {
    try {
      setCredits(await getMyCredits());
    } catch {
      // non-fatal — the balance just won't show
    }
  }, []);

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [result] = await Promise.all([searchCandidates({ ...filters, page, limit: PAGE_LIMIT }), loadCredits()]);
      setCandidates(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to search candidates.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, loadCredits]);

  useEffect(() => {
    if (user && (user.role === "employer" || user.role === "sub_admin" || user.role === "admin")) {
      getRegions().then(setRegions).catch(() => {});
      loadCandidates();
    }
  }, [user, loadCandidates]);

  if (user && user.role !== "employer" && user.role !== "sub_admin" && user.role !== "admin") {
    return <ComingSoon title="Search Candidates" />;
  }

  const handleUnlock = async (candidate: ATSCandidate) => {
    setUnlockingId(candidate.userId);
    try {
      const result = await unlockCandidate(candidate.userId);
      toast.success(candidate.isUnlocked ? "Resume opened" : `Unlocked — ${result.creditsRemaining} credit(s) remaining`);
      setCandidates((prev) =>
        prev.map((c) =>
          c.userId === candidate.userId
            ? { ...c, isUnlocked: true, whatsapp: result.candidate.whatsapp, email: result.candidate.email }
            : c
        )
      );
      setCredits((prev) => (prev ? { ...prev, creditsRemaining: result.creditsRemaining } : prev));
      setViewing({ candidate: { ...candidate, isUnlocked: true, ...result.candidate }, resume: result.resume });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to unlock candidate.");
    } finally {
      setUnlockingId(null);
    }
  };

  const columns: CommonTableColumn<ATSCandidate>[] = [
    {
      key: "name",
      title: "Name & Position",
      minWidth: 200,
      render: (_, c) => (
        <>
          <div className="font-bold text-foreground">{c.name}</div>
          <div className="text-xs text-muted-foreground">{c.position}</div>
        </>
      ),
    },
    {
      key: "nationality",
      title: "Nationality",
      minWidth: 130,
      render: (_, c) => <span className="text-muted-foreground font-medium">{c.nationality || "—"}</span>,
    },
    {
      key: "experience",
      title: "Experience",
      minWidth: 160,
      render: (_, c) => (
        <span className="text-muted-foreground font-medium">
          {[c.gulfExp && `Gulf: ${c.gulfExp}`, c.indianExp && `India: ${c.indianExp}`].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "location",
      title: "Location",
      minWidth: 160,
      render: (_, c) => (
        <span className="text-muted-foreground font-medium flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> {c.currentLocation || c.region?.name || "—"}
        </span>
      ),
    },
    {
      key: "contact",
      title: "Contact",
      minWidth: 140,
      render: (_, c) =>
        c.isUnlocked ? (
          <span className="text-emerald-700 font-bold text-xs">Unlocked</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-bold">
            <Lock className="w-3.5 h-3.5" /> Locked
          </span>
        ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      minWidth: 160,
      render: (_, c) => (
        <button
          disabled={unlockingId === c.userId}
          onClick={() => handleUnlock(c)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue/90 transition-all disabled:opacity-60"
        >
          {unlockingId === c.userId ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : c.isUnlocked ? (
            <FileText className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
          {c.isUnlocked ? "View Resume" : `Unlock (${UNLOCK_COST} credit)`}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Search Candidates</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Search the candidate database. Unlock a profile to reveal contact info and resume.
          </p>
        </div>
        {credits && (
          <div className="inline-flex items-center gap-2 bg-white border border-border/60 rounded-xl px-4 py-2.5 shadow-sm">
            <Coins className="w-4 h-4 text-brand-orange" />
            <span className="font-black text-foreground">{credits.creditsRemaining}</span>
            <span className="text-xs text-muted-foreground font-medium">credits remaining</span>
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <CommonTable<ATSCandidate, number>
        columns={columns}
        data={candidates}
        rowKey={(c) => c.userId}
        loading={isLoading}
        emptyMessage="No candidates match your search yet."
        search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by name, position, qualification..." }}
        filters={
          <div className="flex items-center gap-2">
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="px-3 py-3 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium appearance-none cursor-pointer"
            >
              <option value="">All regions</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <input
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="Nationality"
              className="px-3 py-3 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium w-36"
            />
          </div>
        }
        resetFilters={{
          onReset: () => {
            setSearchInput("");
            setRegionId("");
            setNationality("");
          },
          hasActiveFilters: !!searchInput || !!regionId || !!nationality,
        }}
        pagination={
          meta
            ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
            : undefined
        }
      />

      {viewing && <ResumeModal candidate={viewing.candidate} resume={viewing.resume} onClose={() => setViewing(null)} />}
    </div>
  );
}
