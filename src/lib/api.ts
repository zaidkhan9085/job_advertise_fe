import { getTokenFromDocumentCookie } from "./auth-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getTokenFromDocumentCookie();
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      // Skip Content-Type for FormData — the browser sets its own multipart
      // boundary, and overriding it here would break the upload.
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const message = (isJson && body?.message) || (isJson && body?.error) || "Request failed";
    throw new ApiError(message, res.status);
  }

  return body as T;
}

// Backend uses lowercase enum values (candidate/employer/sub_admin/admin); the
// UI uses friendlier labels — map between the two at the API boundary only.
// sub_admin has no dedicated UI yet (treated as Recruiter) — it's promoted
// from an Employer account and only gains extra moderation permissions.
export type FrontendRole = "Candidate" | "Recruiter";
export type BackendRole = "candidate" | "employer" | "sub_admin" | "admin";

const FRONTEND_TO_BACKEND_ROLE: Record<FrontendRole, BackendRole> = {
  Candidate: "candidate",
  Recruiter: "employer",
};

const BACKEND_TO_FRONTEND_ROLE: Record<BackendRole, "Candidate" | "Recruiter" | "Admin"> = {
  candidate: "Candidate",
  employer: "Recruiter",
  sub_admin: "Recruiter",
  admin: "Admin",
};

export function toBackendRole(role: FrontendRole): BackendRole {
  return FRONTEND_TO_BACKEND_ROLE[role];
}

export function toFrontendRole(role: BackendRole) {
  return BACKEND_TO_FRONTEND_ROLE[role];
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: FrontendRole;
  phone?: string;
  location?: string;
}

export function registerRequest(payload: RegisterPayload) {
  return apiFetch<{ message: string; userId: number }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...payload, role: toBackendRole(payload.role) }),
  });
}

export function loginRequest(email: string, password: string) {
  return apiFetch<{ token: string; role: BackendRole; full_name: string | null }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export function forgotPasswordRequest(email: string) {
  return apiFetch<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPasswordRequest(token: string, password: string) {
  return apiFetch<{ message: string }>(`/api/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// --- Jobs ---
export type JobPostType = "FEATURED" | "NORMAL" | "STORY";
export type JobPostStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
export type StoryTag = "Long Term" | "Short Term" | "Urgent" | "Contract";

export interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  image: string | null;
  tag: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
  type: JobPostType;
  status: JobPostStatus;
  views: number;
  clicks: number;
  employerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPayload {
  title: string;
  company: string;
  location: string;
  description: string;
  type?: JobPostType;
  tag?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  poster?: File;
}

export function getJobs() {
  return apiFetch<JobPost[]>("/api/jobs");
}

export function getFeaturedJobs() {
  return apiFetch<JobPost[]>("/api/jobs?type=FEATURED");
}

export function getNormalJobs() {
  return apiFetch<JobPost[]>("/api/jobs?type=NORMAL");
}

export function getJobStories() {
  return apiFetch<JobPost[]>("/api/jobs?type=STORY");
}

export function getJobById(id: string) {
  return apiFetch<JobPost>(`/api/jobs/${id}`);
}

export function getRelatedJobs(id: string) {
  return apiFetch<JobPost[]>(`/api/jobs/${id}/related`);
}

export function getMyJobs() {
  return apiFetch<JobPost[]>("/api/jobs/mine");
}

function buildJobBody(payload: CreateJobPayload): BodyInit {
  const { poster, ...fields } = payload;

  if (!poster) {
    return JSON.stringify(fields);
  }

  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) form.append(key, value);
  });
  form.append("poster", poster);
  return form;
}

export function createJob(payload: CreateJobPayload) {
  return apiFetch<{ message: string; job: JobPost }>("/api/jobs", {
    method: "POST",
    body: buildJobBody(payload),
  });
}

export function deleteJob(id: string) {
  return apiFetch<{ message: string }>(`/api/jobs/${id}`, { method: "DELETE" });
}

// --- Admin: job moderation ---
export function getPendingJobs() {
  return apiFetch<(JobPost & { employer: { id: number; full_name: string | null; email: string } })[]>(
    "/api/jobs/pending"
  );
}

export function updateJobStatus(id: string, status: "APPROVED" | "REJECTED") {
  return apiFetch<{ message: string; job: JobPost }>(`/api/jobs/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export interface AdminStats {
  totalJobs: number;
  pendingJobs: number;
  approvedJobs: number;
  totalCandidates: number;
  totalEmployers: number;
  totalApplications: number;
}

export function getAdminStats() {
  return apiFetch<AdminStats>("/api/admin/stats");
}

// --- Applications ---
export function applyToJob(jobId: string, resumeId?: string) {
  return apiFetch<{ success: boolean; message: string }>(`/api/applications/apply/${jobId}`, {
    method: "POST",
    body: JSON.stringify(resumeId ? { resumeId } : {}),
  });
}

export function getMyApplications() {
  return apiFetch<{ success: boolean; count: number; data: unknown[] }>("/api/applications/my");
}

// --- Company / Region ---
export interface Region {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  regionId: string | null;
  region: Region | null;
}

export function getRegions() {
  return apiFetch<Region[]>("/api/regions");
}

export function getMyCompany() {
  return apiFetch<Company | null>("/api/companies/me");
}

export function updateMyCompany(payload: {
  name: string;
  description?: string;
  regionId: string;
  logo?: File;
}) {
  if (payload.logo) {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.description) formData.append("description", payload.description);
    formData.append("regionId", payload.regionId);
    formData.append("logo", payload.logo);
    return apiFetch<{ message: string; company: Company }>("/api/companies/me", {
      method: "PUT",
      body: formData,
    });
  }
  return apiFetch<{ message: string; company: Company }>("/api/companies/me", {
    method: "PUT",
    body: JSON.stringify({ name: payload.name, description: payload.description, regionId: payload.regionId }),
  });
}

export { apiFetch, API_URL };
