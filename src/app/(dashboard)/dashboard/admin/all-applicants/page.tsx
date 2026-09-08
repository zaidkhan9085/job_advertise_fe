"use client";

import { useCallback, useEffect, useState } from "react";
import { getJobLeads, type JobLead } from "@/lib/api";
import LeadsTable from "@/components/dashboard/LeadsTable";

// Global, unscoped applicants view for admin/sub_admin -- getJobLeads()
// with no jobId returns every application across every employer's jobs
// (see applicationController.js's getLeads, already admin-aware). Mirrors
// the employer's own unscoped "Contact Leads" tab on dashboard/jobs, just
// without the per-job "add applicant" action since this isn't scoped to
// one job.
export default function AdminAllApplicantsPage() {
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getJobLeads();
      setLeads(result.data);
    } catch {
      // handled by the empty state below
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">All Applicants</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Every candidate who applied across all jobs</p>
      </div>

      <LeadsTable leads={leads} isLoading={isLoading} showJobColumn={true} />
    </div>
  );
}
