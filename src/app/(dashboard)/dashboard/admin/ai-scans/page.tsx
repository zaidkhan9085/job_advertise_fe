"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Activity, Ban, Gauge, Loader2, Save, ScanText, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  getAiScanEmployers,
  getAiScanSummary,
  updateAiScanDefaultLimit,
  updateEmployerScanControls,
  type AiScanEmployerRow,
  type AiScanFilter,
  type AiScanSummary,
  type PaginatedMeta,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";
import StatCard from "@/components/dashboard/StatCard";
import AiScanChart from "@/components/dashboard/AiScanChart";

const PAGE_LIMIT = 20;
const MAX_LIMIT = 1000;
const RANGES = [7, 30, 90] as const;

const FILTER_LABELS: Record<AiScanFilter, string> = {
  all: "All employers",
  used_today: "Used today",
  limit_reached: "Limit reached",
  never_used: "Never used",
  paused: "Paused",
};
const FILTERS = Object.keys(FILTER_LABELS) as AiScanFilter[];

type SortKey = "allTime" | "today" | "lastScan" | "name";
const SORT_LABELS: Record<SortKey, string> = {
  allTime: "Most scans (all time)",
  today: "Most scans today",
  lastScan: "Latest scan",
  name: "Name (A–Z)",
};

const cardClass = "bg-white rounded-2xl border border-border/60 shadow-sm p-4 sm:p-6";
const inputClass =
  "px-3 py-2 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-bold text-sm";
const smallBtn =
  "px-3 py-2 rounded-xl bg-brand-blue text-white font-bold text-xs hover:bg-brand-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

// A whole number 1..MAX_LIMIT, or null when the box doesn't hold one.
function parseLimitInput(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return n >= 1 && n <= MAX_LIMIT ? n : null;
}

// Today's use against the limit: turns amber near the limit and red once the
// employer has used it all, so "who is maxed out" reads at a glance.
function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, (used / limit) * 100);
  const full = used >= limit;
  return (
    <div className="w-28">
      <div className="flex items-baseline justify-between text-xs font-bold">
        <span className={full ? "text-rose-600" : "text-foreground"}>{used}</span>
        <span className="text-muted-foreground">/ {limit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary mt-1 overflow-hidden">
        <div
          className={`h-full rounded-full ${full ? "bg-rose-500" : pct >= 80 ? "bg-amber-500" : "bg-brand-blue"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminAiScansPage() {
  const { user } = useAuth();

  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [summary, setSummary] = useState<AiScanSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [rows, setRows] = useState<AiScanEmployerRow[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [counts, setCounts] = useState<Record<AiScanFilter, number> | null>(null);
  const [defaultLimit, setDefaultLimit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AiScanFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("allTime");
  const [page, setPage] = useState(1);

  // Unsaved edits in the per-row limit boxes, keyed by employer id.
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [defaultDraft, setDefaultDraft] = useState("");
  const [isSavingDefault, setIsSavingDefault] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, filter, sortBy]);

  const loadSummary = useCallback(async () => {
    try {
      const result = await getAiScanSummary(days);
      setSummary(result);
      setSummaryError(null);
      setDefaultDraft((current) => current || String(result.defaultLimit));
    } catch (err) {
      setSummaryError(err instanceof ApiError ? err.message : "Failed to load scan activity.");
    }
  }, [days]);

  // `silent` refreshes the list in place (after a change) without blanking the
  // table behind a loading state.
  const loadEmployers = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      setError(null);
      try {
        const result = await getAiScanEmployers({
          search: search || undefined,
          filter,
          sortBy,
          sortOrder: sortBy === "name" ? "asc" : "desc",
          page,
          limit: PAGE_LIMIT,
        });
        setRows(result.data);
        setMeta(result.meta);
        setCounts(result.counts);
        setDefaultLimit(result.defaultLimit);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load employers.");
      } finally {
        setIsLoading(false);
      }
    },
    [search, filter, sortBy, page]
  );

  const isAdmin = user?.role === "admin";
  useEffect(() => {
    if (isAdmin) loadSummary();
  }, [isAdmin, loadSummary]);
  useEffect(() => {
    if (isAdmin) loadEmployers();
  }, [isAdmin, loadEmployers]);

  const rangeScans = useMemo(
    () => (summary ? summary.series.reduce((sum, d) => sum + d.ai + d.basic, 0) : 0),
    [summary]
  );

  if (user && user.role !== "admin") {
    return <ComingSoon title="AI Scans" />;
  }

  const changeControls = async (
    row: AiScanEmployerRow,
    changes: { limit?: number | null; blocked?: boolean },
    message: (r: { effectiveLimit: number; blocked: boolean }) => string
  ) => {
    setSavingId(row.employerId);
    try {
      const result = await updateEmployerScanControls(row.employerId, changes);
      setRows((prev) =>
        prev.map((r) =>
          r.employerId === result.employerId
            ? { ...r, customLimit: result.customLimit, effectiveLimit: result.effectiveLimit, blocked: result.blocked }
            : r
        )
      );
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[row.employerId];
        return next;
      });
      toast.success(message(result));
      // Counts on the filter chips and the "paused" tile may have moved.
      loadEmployers(true);
      if (changes.blocked !== undefined) loadSummary();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update this employer.");
    } finally {
      setSavingId(null);
    }
  };

  const saveDefaultLimit = async () => {
    const n = parseLimitInput(defaultDraft);
    if (n === null) {
      toast.error(`Enter a whole number between 1 and ${MAX_LIMIT}.`);
      return;
    }
    setIsSavingDefault(true);
    try {
      const result = await updateAiScanDefaultLimit(n);
      setDefaultDraft(String(result.defaultLimit));
      toast.success(`Default limit is now ${result.defaultLimit} scans per day.`);
      loadSummary();
      loadEmployers(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save the default limit.");
    } finally {
      setIsSavingDefault(false);
    }
  };

  const defaultDraftValue = parseLimitInput(defaultDraft);
  const currentDefault = summary?.defaultLimit ?? defaultLimit;

  const columns: CommonTableColumn<AiScanEmployerRow>[] = [
    {
      key: "employer",
      title: "Employer",
      minWidth: 220,
      render: (_, row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{row.name}</span>
            {row.isStaff && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase border bg-secondary text-muted-foreground border-border/60">
                Staff
              </span>
            )}
          </div>
          {row.companyName && row.companyName !== row.name && (
            <div className="text-xs text-foreground/70 font-semibold">{row.companyName}</div>
          )}
          {row.name !== row.email && <div className="text-xs text-muted-foreground font-medium">{row.email}</div>}
        </div>
      ),
    },
    {
      key: "today",
      title: "Today",
      minWidth: 130,
      render: (_, row) =>
        row.effectiveLimit === null ? (
          <span className="font-bold text-foreground">{row.today}</span>
        ) : (
          <UsageMeter used={row.today} limit={row.effectiveLimit} />
        ),
    },
    {
      key: "allTime",
      title: "All time",
      minWidth: 90,
      render: (_, row) => (
        <div>
          <span className={`font-bold ${row.allTime === 0 ? "text-muted-foreground" : "text-foreground"}`}>{row.allTime}</span>
          {row.failed > 0 && <div className="text-[11px] font-bold text-rose-600">{row.failed} failed</div>}
        </div>
      ),
    },
    {
      key: "lastScan",
      title: "Last scan",
      minWidth: 140,
      render: (_, row) =>
        row.lastScanAt ? (
          <span className="text-muted-foreground font-medium" title={format(new Date(row.lastScanAt), "d MMM yyyy, h:mm a")}>
            {formatDistanceToNow(new Date(row.lastScanAt), { addSuffix: true })}
          </span>
        ) : (
          <span className="text-muted-foreground">Never</span>
        ),
    },
    {
      key: "limit",
      title: "Scans per day",
      minWidth: 230,
      render: (_, row) => {
        if (row.isStaff) return <span className="text-muted-foreground font-medium">Unlimited</span>;
        const draft = drafts[row.employerId];
        const draftValue = draft === undefined ? null : parseLimitInput(draft);
        const canSet = draftValue !== null && draftValue !== row.customLimit;
        const busy = savingId === row.employerId;
        return (
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                aria-label={`Scans per day for ${row.name}`}
                placeholder={String(currentDefault ?? "")}
                value={draft ?? (row.customLimit !== null ? String(row.customLimit) : "")}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [row.employerId]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSet && !busy) {
                    changeControls(row, { limit: draftValue }, (r) => `${row.name} can now scan ${r.effectiveLimit} posters a day.`);
                  }
                }}
                className={`${inputClass} w-20 text-center ${draft !== undefined && draftValue === null ? "border-rose-300" : ""}`}
              />
              <button
                type="button"
                disabled={!canSet || busy}
                onClick={() =>
                  changeControls(row, { limit: draftValue }, (r) => `${row.name} can now scan ${r.effectiveLimit} posters a day.`)
                }
                className={smallBtn}
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Set"}
              </button>
            </div>
            <div className="text-[11px] font-medium text-muted-foreground mt-1">
              {row.customLimit !== null ? (
                <>
                  Custom · {row.customLimit}/day ·{" "}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      changeControls(row, { limit: null }, (r) => `${row.name} is back on the default of ${r.effectiveLimit} a day.`)
                    }
                    className="font-bold text-brand-blue hover:underline disabled:opacity-40"
                  >
                    Use default
                  </button>
                </>
              ) : (
                <>Default · {currentDefault}/day</>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "access",
      title: "AI scan",
      minWidth: 110,
      render: (_, row) => {
        if (row.isStaff) return <span className="text-muted-foreground">—</span>;
        const allowed = !row.blocked;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={allowed}
              aria-label={`${allowed ? "Pause" : "Allow"} AI scanning for ${row.name}`}
              disabled={savingId === row.employerId}
              onClick={() =>
                changeControls(row, { blocked: allowed }, () =>
                  allowed ? `AI scanning paused for ${row.name}.` : `AI scanning turned back on for ${row.name}.`
                )
              }
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                allowed ? "bg-emerald-500" : "bg-border"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  allowed ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
            <span
              className={`text-[10px] font-black uppercase tracking-wide ${allowed ? "text-emerald-700" : "text-rose-600"}`}
            >
              {allowed ? "Allowed" : "Paused"}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">AI Scans</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          How recruiters are using the poster scanner — and controls to give an employer more scans or switch AI scanning off for them.
        </p>
      </div>

      {summaryError && (
        <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{summaryError}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={summary && summary.failedToday > 0 ? `Scans today (${summary.failedToday} failed)` : "Scans today"}
          value={summary ? String(summary.scansToday) : "—"}
          icon={ScanText}
          color="bg-brand-blue/10 text-brand-blue"
        />
        <StatCard
          title="Total scans (all time)"
          value={summary ? String(summary.totalScans) : "—"}
          icon={Activity}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title={summary ? `Employers using AI (of ${summary.totalEmployers})` : "Employers using AI"}
          value={summary ? String(summary.employersUsingAi) : "—"}
          icon={Users}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="Paused employers"
          value={summary ? String(summary.pausedEmployers) : "—"}
          icon={Ban}
          color="bg-rose-50 text-rose-600"
        />
      </div>

      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="font-black text-lg text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-blue" /> Scan activity
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-0.5">
              {summary ? `${rangeScans} scan${rangeScans === 1 ? "" : "s"} in the last ${days} days` : "Loading…"}
            </p>
          </div>
          <div className="inline-flex rounded-xl bg-secondary p-1 self-start" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDays(r)}
                aria-pressed={days === r}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors ${
                  days === r ? "bg-white text-brand-blue shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r} days
              </button>
            ))}
          </div>
        </div>
        {summary ? <AiScanChart series={summary.series} /> : <div className="h-64 rounded-xl bg-secondary/40 animate-pulse" />}
      </div>

      <div className={cardClass}>
        <h2 className="font-black text-lg text-foreground flex items-center gap-2">
          <Gauge className="w-5 h-5 text-brand-blue" /> Default daily limit
        </h2>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Applies to every employer who doesn&apos;t have a custom limit
          {currentDefault !== null && currentDefault !== undefined ? ` (currently ${currentDefault} scans per day)` : ""}. The count
          resets every day at midnight IST. Re-opening a poster that was already scanned is free and never counts.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Default scans per day"
            value={defaultDraft}
            onChange={(e) => setDefaultDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && defaultDraftValue !== null && defaultDraftValue !== currentDefault && !isSavingDefault) saveDefaultLimit();
            }}
            className={`${inputClass} w-28 py-3 ${defaultDraft !== "" && defaultDraftValue === null ? "border-rose-300" : ""}`}
          />
          <button
            type="button"
            onClick={saveDefaultLimit}
            disabled={isSavingDefault || defaultDraftValue === null || defaultDraftValue === currentDefault}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSavingDefault ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save default
          </button>
          {defaultDraft !== "" && defaultDraftValue === null && (
            <span className="text-xs font-bold text-rose-600">Enter a whole number from 1 to {MAX_LIMIT}.</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-black text-lg text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-blue" /> Employer usage
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">
            Every employer, including those who have never used AI scan. Changes take effect immediately.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-colors ${
                filter === f ? "bg-brand-blue text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
              }`}
            >
              {FILTER_LABELS[f]}
              {counts && <span className={`ml-1.5 ${filter === f ? "text-white/80" : "text-muted-foreground/70"}`}>{counts[f]}</span>}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

        <CommonTable<AiScanEmployerRow, number>
          dense
          columns={columns}
          data={rows}
          rowKey={(r) => r.employerId}
          loading={isLoading}
          emptyMessage={filter === "all" && !search ? "No employers yet." : "No employers match these filters."}
          search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by name, email or company..." }}
          filters={
            <select
              aria-label="Sort employers"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-4 py-3 rounded-xl border border-border/60 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABELS[k]}
                </option>
              ))}
            </select>
          }
          resetFilters={{
            onReset: () => {
              setSearchInput("");
              setFilter("all");
              setSortBy("allTime");
            },
            hasActiveFilters: !!searchInput || filter !== "all" || sortBy !== "allTime",
          }}
          pagination={
            meta
              ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
              : undefined
          }
        />
      </div>
    </div>
  );
}
