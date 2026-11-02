"use client";

import { useState } from "react";
import { X, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { matchResumeToJob, ApiError, type ResumeMatchScore } from "@/lib/api";
import type { ResumeSection } from "@/lib/resumeTemplates/types";

interface MatchScoreModalProps {
  sections: ResumeSection[];
  onClose: () => void;
}

// Scores the builder's current content (whatever's on screen, saved or
// not -- see matchResumeToJob/the backend handler) against a pasted job
// description, ATS-keyword-match style. A separate modal rather than an
// inline panel since it needs its own sizeable text input (the job
// description) that doesn't belong permanently in the editor column.
export default function MatchScoreModal({ sections, onClose }: MatchScoreModalProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeMatchScore | null>(null);

  const handleCheck = async () => {
    if (!jobDescription.trim()) {
      toast.error("Paste a job description first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await matchResumeToJob({ sections, jobDescription });
      setResult(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't score your resume right now.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = !result ? "" : result.score >= 75 ? "text-emerald-500" : result.score >= 50 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Job Match Score</h2>
              <p className="text-[11px] font-bold text-slate-400">See how well your resume matches a job description</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          <textarea
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full px-5 py-4 rounded-2xl bg-slate-100/50 border-2 border-slate-300 focus:border-brand-blue/30 focus:bg-white transition-all outline-none font-medium text-sm text-slate-800 placeholder:text-slate-500 resize-none leading-relaxed shadow-inner"
          />

          <button
            onClick={handleCheck}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-brand-blue text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
            {loading ? "Checking..." : "Check Match"}
          </button>

          {result && (
            <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`text-4xl font-black ${scoreColor}`}>{result.score}%</div>
                <div>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Match Score</p>
                  <p className="text-[11px] font-bold text-slate-400">Based on keyword overlap with this job description</p>
                </div>
              </div>

              {result.matchedKeywords.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Matched</p>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords.map((kw) => (
                      <span key={kw} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.missingKeywords.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Consider Adding</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw) => (
                      <span key={kw} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
