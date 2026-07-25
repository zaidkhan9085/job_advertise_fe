"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Building2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getMyApplications, ApiError } from "@/lib/api";

interface MyApplication {
  id: string;
  status: string;
  createdAt: string;
  job: { title: string; company: string; location: string } | null;
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyApplications();
      setApplications(res.data as MyApplication[]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load your applications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">My Applications</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Jobs you&apos;ve applied to.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
          Loading your applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/60 p-12 text-center text-muted-foreground font-medium">
          You haven&apos;t applied to any jobs yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-foreground">{app.job?.title ?? "Job no longer available"}</div>
                {app.job && (
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{app.job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.job.location}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200 w-fit">
                <Clock className="w-3 h-3" /> {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
