"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Zap, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getMyJobs, type JobPost, ApiError } from "@/lib/api";
import JobPosterImage from "@/components/common/JobPosterImage";

export default function StoriesPage() {
  const [activeStory, setActiveStory] = useState<JobPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const jobs = await getMyJobs();
      setActiveStory(jobs.find((j) => j.type === "STORY" && (j.status === "PENDING" || j.status === "APPROVED")) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your story.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">Stories</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Only one active story at a time.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
          Loading...
        </div>
      ) : activeStory ? (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 flex gap-5">
          <JobPosterImage
            image={activeStory.image}
            title={activeStory.title}
            company={activeStory.company}
            className="w-24 aspect-9/16 rounded-xl shrink-0"
          />
          <div className="space-y-2 min-w-0">
            <div className="font-bold text-foreground">{activeStory.title}</div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${
              activeStory.status === "APPROVED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              <Clock className="w-3 h-3" /> {activeStory.status}
            </span>
            <p className="text-xs text-muted-foreground">
              Posted {formatDistanceToNow(new Date(activeStory.createdAt), { addSuffix: true })} &middot; expires 24h after approval
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-border/60 p-12 text-center space-y-4">
          <p className="text-muted-foreground font-medium">You don&apos;t have an active story right now.</p>
          <Link
            href="/dashboard/stories/new"
            className="inline-flex items-center gap-2 bg-brand-blue text-white hover:bg-brand-blue-medium px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-blue/20"
          >
            <Zap className="w-4 h-4" /> Post a Story
          </Link>
        </div>
      )}
    </div>
  );
}
