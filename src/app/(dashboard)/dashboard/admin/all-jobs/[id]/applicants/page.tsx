"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getJobByIdAdmin, getJobLeads, type JobPost, type JobLead } from "@/lib/api";
import LeadsTable from "@/components/dashboard/LeadsTable";
import ApplyDialog from "@/components/jobs/ApplyDialog";

// Admin/sub_admin equivalent of dashboard/jobs/[id]/applicants -- same
// LeadsTable/ApplyDialog usage, but sources the job via getJobByIdAdmin
// (admin doesn't own the job, so getMyJobs isn't an option) and getJobLeads
// already treats admin/sub_admin as seeing every application regardless of
// which employer posted the job (see applicationController.js's getLeads).
export default function AdminJobApplicantsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobPost | null>(null);
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [jobResult, leadsResult] = await Promise.all([getJobByIdAdmin(params.id), getJobLeads(params.id)]);
      setJob(jobResult);
      setLeads(leadsResult.data);
    } catch {
      // handled by the empty states below
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        {/* This page is reachable from both All Jobs and an Employer's own
            detail page -- router.back() returns to whichever one the admin
            actually came from, instead of assuming a single fixed origin. */}
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <h1 className="text-2xl font-black text-foreground">Applicants</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">{job ? `for ${job.title}` : "Loading job..."}</p>
      </div>

      <LeadsTable leads={leads} isLoading={isLoading} showJobColumn={false} onAddApplicant={() => setIsAddOpen(true)} />

      {isAddOpen && job && (
        <ApplyDialog jobId={job.id} jobTitle={job.title} mode="proxy" onClose={() => setIsAddOpen(false)} onSuccess={load} />
      )}
    </div>
  );
}
