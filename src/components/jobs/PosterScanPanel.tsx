"use client";

import { Sparkles, PenLine, Check, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

export type ScanPhase = "choose" | "scanning" | "scanned" | "manual" | "failed";

// Cosmetic stages shown while a scan is in flight -- the backend is one
// request (OCR -> AI -> merge, ~3-10s) with no real progress to report, so
// the page advances these on a timer. Purely so the recruiter has something
// concrete to look at instead of an indefinite spinner.
export const SCAN_STEPS = [
  "Preparing your poster",
  "Reading the text",
  "Finding job details",
  "Matching industry & location",
  "Filling your form",
];

const cardClass = "w-full max-w-md rounded-2xl border border-border/60 bg-white p-4 sm:p-5 shadow-sm text-left";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-brand-blue text-white font-bold text-sm shadow-md shadow-brand-blue/20 hover:bg-brand-blue-medium transition-colors";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-secondary/50 text-foreground font-bold text-sm border border-border/60 hover:bg-secondary transition-colors";

// Shown once a poster image has been uploaded: the recruiter chooses AI
// auto-fill or manual entry AFTER seeing their image attached (rather than
// having to decide before uploading), and can always switch or re-scan.
export default function PosterScanPanel({
  phase,
  step,
  progress,
  roleCount = 0,
  shortTerm = false,
  basic = false,
  quota = null,
  locked = false,
  errorMessage,
  onScan,
  onManual,
  onRescan,
}: {
  phase: ScanPhase;
  step: number;
  progress: number;
  roleCount?: number;
  shortTerm?: boolean;
  basic?: boolean;
  // Daily allowance after the last scan (null for staff / not scanned yet).
  quota?: { limit: number; used: number; remaining: number } | null;
  // The scan was refused for good (limit used up / paused by an admin), so
  // "Try again" is left out and manual entry is the only way forward.
  locked?: boolean;
  errorMessage?: string | null;
  onScan: () => void;
  onManual: () => void;
  onRescan: () => void;
}) {
  if (phase === "scanning") {
    return (
      <div className={cardClass} role="status" aria-live="polite">
        <p className="text-sm font-black text-foreground">Reading your poster…</p>
        <p className="text-xs text-muted-foreground mt-0.5 mb-4">Keep this page open, this takes a few seconds.</p>
        <div className="flex items-center">
          {SCAN_STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex items-center last:flex-none">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                  i < step
                    ? "bg-brand-blue text-white"
                    : i === step
                      ? "bg-brand-blue text-white animate-pulse"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < SCAN_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full ${i < step ? "bg-brand-blue" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm font-bold text-brand-blue mt-3">{SCAN_STEPS[step]}</p>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-brand-blue rounded-full transition-[width] duration-200 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs font-semibold text-muted-foreground mt-1">{Math.round(progress)}%</p>
      </div>
    );
  }

  if (phase === "scanned") {
    return (
      <div className={cardClass}>
        <p className="flex items-center gap-2 text-sm font-black text-foreground">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Details filled from your poster
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {roleCount > 1
            ? `Found ${roleCount} positions — all listed in the description below. `
            : ""}
          Please review every field and fix anything that was misread.
        </p>
        {quota && (
          <p className={`text-xs font-semibold mt-2 ${quota.remaining === 0 ? "text-amber-800" : "text-muted-foreground"}`}>
            {quota.remaining === 0
              ? `That was your last AI scan for today (${quota.limit} a day).`
              : `${quota.remaining} of ${quota.limit} AI scans left today.`}{" "}
            Re-scan uses one.
          </p>
        )}
        {shortTerm && (
          <p className="text-xs font-semibold text-brand-blue mt-2">
            Job Type set to Short Term — the poster mentions a shutdown or short-term job. Change it below if that&apos;s wrong.
          </p>
        )}
        {basic && (
          <p className="flex items-start gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
            <span>
              AI was busy, so we used a basic scan. Some fields may be missing — check them carefully, or press
              Re-scan in a minute.
            </span>
          </p>
        )}
        <div className="mt-3">
          <button type="button" onClick={onRescan} className={secondaryBtn}>
            <RotateCcw className="w-4 h-4" /> Re-scan poster
          </button>
        </div>
      </div>
    );
  }

  if (phase === "manual") {
    return (
      <div className={cardClass}>
        <p className="flex items-center gap-2 text-sm font-black text-foreground">
          <PenLine className="w-4 h-4 text-brand-blue shrink-0" />
          Manual entry selected
        </p>
        <p className="text-xs text-muted-foreground mt-1">Fill in the details below.</p>
        <div className="mt-3">
          <button type="button" onClick={onScan} className={secondaryBtn}>
            <Sparkles className="w-4 h-4" /> Scan with AI instead
          </button>
        </div>
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div className={`${cardClass} border-rose-200 bg-rose-50/40`}>
        <p className="flex items-center gap-2 text-sm font-black text-rose-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {locked ? "AI scan isn't available right now" : "We couldn't scan this poster"}
        </p>
        <p className="text-xs text-rose-800/80 mt-1">
          {errorMessage || "Something went wrong while reading it."}
          {!locked && " Your image is still attached, so you can try again without uploading it a second time."}
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          {!locked && (
            <button type="button" onClick={onScan} className={primaryBtn}>
              <RotateCcw className="w-4 h-4" /> Try again
            </button>
          )}
          <button type="button" onClick={onManual} className={locked ? primaryBtn : secondaryBtn}>
            <PenLine className="w-4 h-4" /> Fill manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <p className="text-sm font-black text-foreground">How would you like to continue?</p>
      <p className="text-xs text-muted-foreground mt-1">
        We can read the poster and fill this form for you. You can edit every field afterwards.
      </p>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <button type="button" onClick={onScan} className={primaryBtn}>
          <Sparkles className="w-4 h-4" /> Scan with AI &amp; auto-fill
        </button>
        <button type="button" onClick={onManual} className={secondaryBtn}>
          <PenLine className="w-4 h-4" /> Fill manually
        </button>
      </div>
    </div>
  );
}
