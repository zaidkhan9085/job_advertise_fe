export type ApplicationStatus = "Pending" | "Reviewed" | "Shortlisted" | "Rejected";

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateResumeUrl?: string;
  candidateAvatar?: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
}
