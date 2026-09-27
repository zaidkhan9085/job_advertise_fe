"use client";

import { useState, useRef } from "react";
import { X, Upload, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { importCandidatesAdmin, downloadCandidateImportTemplate, ApiError, type CandidateImportResult, type CandidateImportRowResult } from "@/lib/api";
import { buildCsv, downloadCsv } from "@/lib/csv";

export default function CandidateImportModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<CandidateImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      await downloadCandidateImportTemplate();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to download template.");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await importCandidatesAdmin(file);
      setResult(res);
      if (res.imported > 0) onImported();
      toast.success(`Imported ${res.imported} candidate${res.imported === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Import failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadRowsCsv = (rows: CandidateImportRowResult[], filenamePrefix: string) => {
    const csvRows = rows.map((r) => [String(r.row), r.name, r.email, r.phone, r.reason]);
    downloadCsv(buildCsv(["Row", "Name", "Email", "Phone", "Reason"], csvRows), filenamePrefix);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Import Candidates</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!result ? (
          <>
            <p className="text-sm text-muted-foreground">
              Upload an Excel (.xlsx) or CSV file to bulk-create candidate profiles. Use our template for the most
              accurate results — a similarly-shaped export from elsewhere will still mostly work, but fields like
              Qualification and Location may need a manual check afterward.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 bg-white text-sm font-bold text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-60"
            >
              {isDownloadingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download Template
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl bg-secondary/30 border-2 border-dashed border-border/60 hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-muted-foreground hover:text-brand-blue"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm font-semibold">{file ? file.name : "Choose a file"}</span>
            </button>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? "Importing..." : "Upload & Import"}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                <div className="text-2xl font-black text-emerald-700">{result.imported}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700/70">Imported</div>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                <div className="text-2xl font-black text-amber-700">{result.partial}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-700/70">Needs Review</div>
              </div>
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
                <div className="text-2xl font-black text-rose-700">{result.failed}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-rose-700/70">Failed</div>
              </div>
            </div>

            {result.partial > 0 && (
              <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-amber-800">
                  Imported, but need a manual check (e.g. an unmatched qualification or location).
                </p>
                <button
                  onClick={() => downloadRowsCsv(result.partialRows, "candidates-needing-review")}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 hover:underline shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            )}

            {result.failed > 0 && (
              <div className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-rose-800">Not imported at all — see the reason for each row.</p>
                <button
                  onClick={() => downloadRowsCsv(result.failedRows, "candidates-failed")}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-rose-800 hover:underline shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
                className="flex-1 py-3 rounded-xl border border-border/60 font-bold text-sm hover:bg-secondary/60 transition-colors"
              >
                Import Another File
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
