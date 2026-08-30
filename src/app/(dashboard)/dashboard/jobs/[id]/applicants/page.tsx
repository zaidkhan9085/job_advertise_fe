"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMyJobs, getJobLeads, type JobPost, type JobLead } from "@/lib/api";
import LeadsTable from "@/components/dashboard/LeadsTable";
import ApplyDialog from "@/components/jobs/ApplyDialog";

export default function JobApplicantsPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPost | null>(null);
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // getJobById (the public job-detail fetch) only ever returns APPROVED
  // jobs -- an employer checking Applicants on their own still-pending job
  // needs "any status", and admin/sub_admin's getJobByIdAdmin is gated to
  // staff roles only, not employers. getMyJobs() already returns all of an
  // employer's own jobs regardless of status (used by Manage Jobs), so
  // finding this one job in that list avoids needing a new endpoint.
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [myJobs, leadsResult] = await Promise.all([getMyJobs(), getJobLeads(params.id)]);
      setJob(myJobs.find((j) => j.id === params.id) ?? null);
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
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Manage Jobs
        </Link>
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
