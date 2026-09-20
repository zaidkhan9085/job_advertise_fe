import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMyApplications } from "@/lib/api";

// Which jobs the logged-in candidate has already applied to, so cards can
// show "Applied" instead of offering a duplicate submit (the backend blocks
// duplicates too, but that's a worse experience than never offering it).
// Only candidates apply, so this stays empty -- and makes no request -- for
// logged-out visitors, employers and admins.
export function useAppliedJobs() {
  const { user } = useAuth();
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.role !== "candidate") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting when the session changes, not derived state
      setAppliedIds(new Set());
      return;
    }
    let cancelled = false;
    getMyApplications()
      .then((res) => {
        if (cancelled) return;
        setAppliedIds(new Set((res.data as { jobId: string }[]).map((a) => a.jobId)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const markApplied = useCallback((jobId: string) => {
    setAppliedIds((prev) => new Set(prev).add(jobId));
  }, []);

  return { appliedIds, markApplied };
}
