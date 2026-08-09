import { getTokenFromDocumentCookie } from "./auth-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// File URLs are now Cloudinary URLs (already absolute, e.g.
// "https://res.cloudinary.com/..."), but records created before that
// migration still have old local paths like "/uploads/jobs/xyz.png" that
// need the API_URL prefix. This handles both without a data backfill.
export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : `${API_URL}${path}`;
}

export class ApiError extends Error {
  status: number;
  // Full parsed JSON error body, when present — some endpoints (e.g. the
  // employer-delete 409) attach extra structured data beyond just a message.
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
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
    throw new ApiError(message, res.status, isJson ? body : undefined);
  }

  return body as T;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  all?: boolean;
}

export type BulkDeletePayload =
  | { ids: (string | number)[] }
  | { selectAllMatching: true; filters: Record<string, unknown>; excludeIds: (string | number)[] };

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") usp.set(key, String(value));
  });
  const query = usp.toString();
  return query ? `?${query}` : "";
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
  location: string | null;
  description: string;
  image: string | null;
  tag: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
  isFreeRecruitment: boolean;
  type: JobPostType;
  status: JobPostStatus;
  views: number;
  clicks: number;
  employerId: number;
  companyId: string | null;
  jobLocationId: string | null;
  jobTypeId: string | null;
  industryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPayload {
  title: string;
  description?: string;
  type?: JobPostType;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  isFreeRecruitment?: boolean;
  jobLocationId?: string;
  jobTypeId?: string;
  industryId?: string;
  poster?: File;
  // Stories only — a free-text location/tag, separate from the structured
  // JobLocation/JobType lookups used by regular job posts.
  location?: string;
  tag?: string;
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

// Admin/sub_admin only — unlike getJobById, returns a job regardless of status
// (public getJobById only returns APPROVED jobs).
export function getJobByIdAdmin(id: string) {
  return apiFetch<JobPost>(`/api/jobs/admin/${id}`);
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
    if (value !== undefined) form.append(key, typeof value === "boolean" ? String(value) : value);
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

export type UpdateJobPayload = Partial<CreateJobPayload>;

export function updateJob(id: string, payload: UpdateJobPayload) {
  return apiFetch<{ message: string; job: JobPost }>(`/api/jobs/${id}`, {
    method: "PUT",
    body: buildJobBody(payload as CreateJobPayload),
  });
}

// --- Admin: job moderation ---
export function getPendingJobs() {
  return apiFetch<(JobPost & { employer: { id: number; full_name: string | null; email: string } })[]>(
    "/api/jobs/pending"
  );
}

export type AdminJob = JobPost & { employer: { id: number; full_name: string | null; email: string } };

export function getAllJobsAdmin(filters?: AdminListParams & { status?: JobPostStatus; type?: JobPostType }) {
  const query = buildQuery({
    status: filters?.status,
    type: filters?.type,
    page: filters?.page,
    limit: filters?.limit,
    search: filters?.search,
    sortBy: filters?.sortBy,
    sortOrder: filters?.sortOrder,
    all: filters?.all,
  });
  return apiFetch<Paginated<AdminJob>>(`/api/jobs/admin/all${query}`);
}

export function bulkDeleteJobs(payload: BulkDeletePayload) {
  return apiFetch<{ deleted: string[]; count: number }>("/api/jobs/admin/bulk-delete", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateJobStatus(id: string, status: "APPROVED" | "REJECTED", trustEmployer?: boolean) {
  return apiFetch<{ message: string; job: JobPost }>(`/api/jobs/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, trustEmployer }),
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

// --- Admin: candidate profile moderation ---
export type ProfileStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CandidateProfileAdmin {
  id: number;
  userId: number;
  name: string;
  position: string;
  nationality: string | null;
  qualification: string | null;
  industry: string | null;
  whatsapp: string;
  email: string;
  currentLocation: string | null;
  preferredLocation: string | null;
  resumeUrl: string | null;
  status: ProfileStatus;
  createdAt: string;
  user: { id: number; full_name: string | null; email: string };
}

export function getAllCandidateProfilesAdmin(filters?: { status?: ProfileStatus }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  const query = params.toString();
  return apiFetch<CandidateProfileAdmin[]>(`/api/candidate/admin/profiles${query ? `?${query}` : ""}`);
}

export function approveCandidateProfile(id: number) {
  return apiFetch<CandidateProfileAdmin>(`/api/candidate/admin/profile/approve/${id}`, { method: "PUT" });
}

export function rejectCandidateProfile(id: number) {
  return apiFetch<CandidateProfileAdmin>(`/api/candidate/admin/profile/reject/${id}`, { method: "PUT" });
}

// --- Admin: candidate accounts ---
// Registration only collects name/email/phone (no separate profile-completion
// form exists yet — see CandidateProfileAdmin above), so admin candidate
// management works directly off the account, not the mostly-empty profile.
export interface CandidateUserAdmin {
  id: number;
  full_name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  is_verified: boolean;
  isBlocked: boolean;
  created_at: string;
}

export function getAllCandidateUsers(filters?: AdminListParams & { dateFrom?: string; dateTo?: string }) {
  const query = buildQuery({
    page: filters?.page,
    limit: filters?.limit,
    search: filters?.search,
    sortBy: filters?.sortBy,
    sortOrder: filters?.sortOrder,
    all: filters?.all,
    dateFrom: filters?.dateFrom,
    dateTo: filters?.dateTo,
  });
  return apiFetch<Paginated<CandidateUserAdmin>>(`/api/candidate/admin/users${query}`);
}

export function bulkDeleteCandidateUsers(payload: BulkDeletePayload) {
  return apiFetch<{ deleted: number[]; failed: { id: number; reason: string }[] }>(
    "/api/candidate/admin/users/bulk-delete",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export function updateCandidateUser(
  id: number,
  payload: { full_name?: string; email?: string; phone?: string; location?: string }
) {
  return apiFetch<CandidateUserAdmin>(`/api/candidate/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCandidateUser(id: number) {
  return apiFetch<{ message: string }>(`/api/candidate/admin/users/${id}`, { method: "DELETE" });
}

export function setCandidateBlocked(id: number, isBlocked: boolean) {
  return apiFetch<{ message: string; user: CandidateUserAdmin }>(`/api/candidate/admin/users/${id}/block`, {
    method: "PATCH",
    body: JSON.stringify({ isBlocked }),
  });
}

export function resetCandidatePassword(id: number, password: string) {
  return apiFetch<{ message: string }>(`/api/candidate/admin/users/${id}/password`, {
    method: "PUT",
    body: JSON.stringify({ password }),
  });
}

// --- Admin: employer/company moderation ---
export interface CompanyAdminListItem extends Company {
  owner: { id: number; full_name: string | null; email: string };
  _count: { jobs: number; follows: number; reports: number };
  pendingReportCount: number;
}

export interface CompanyAdminDetail extends CompanyDetail {
  owner: { id: number; full_name: string | null; email: string };
  jobs: { id: string; title: string; status: JobPostStatus; createdAt: string }[];
  reports: {
    id: string;
    reason: string;
    status: ReportStatus;
    createdAt: string;
    reporter: { id: number; full_name: string | null; email: string };
  }[];
}

export function getAllCompaniesAdmin(filters?: AdminListParams) {
  const query = buildQuery({
    page: filters?.page,
    limit: filters?.limit,
    search: filters?.search,
    sortBy: filters?.sortBy,
    sortOrder: filters?.sortOrder,
    all: filters?.all,
  });
  return apiFetch<Paginated<CompanyAdminListItem>>(`/api/admin/companies${query}`);
}

export function getCompanyAdminDetail(id: string) {
  return apiFetch<CompanyAdminDetail>(`/api/admin/companies/${id}`);
}

// Throws ApiError with status 409 and body { jobCount, requiresConfirmation }
// if the company has jobs and confirm wasn't passed — callers should catch
// that specific case and re-call with confirm=true after the admin confirms.
export function deleteCompanyAdmin(id: string, confirm?: boolean) {
  return apiFetch<{ message: string }>(`/api/admin/companies/${id}${confirm ? "?confirm=true" : ""}`, {
    method: "DELETE",
  });
}

export function bulkDeleteCompanies(payload: BulkDeletePayload) {
  return apiFetch<{ deleted: string[]; failed: { id: string; reason: string }[] }>(
    "/api/admin/companies/bulk-delete",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

// --- Admin: reports queue ---
export type ReportStatus = "PENDING" | "VIEWED" | "DISMISSED";

export interface AdminReport {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reporter: { id: number; full_name: string | null; email: string };
  job: { id: string; title: string; company: string; status: JobPostStatus } | null;
  company: { id: string; name: string } | null;
}

export function getReports(filters?: AdminListParams & { status?: ReportStatus }) {
  const query = buildQuery({
    status: filters?.status,
    page: filters?.page,
    limit: filters?.limit,
    search: filters?.search,
    sortBy: filters?.sortBy,
    sortOrder: filters?.sortOrder,
    all: filters?.all,
  });
  return apiFetch<Paginated<AdminReport>>(`/api/reports${query}`);
}

export function updateReportStatus(id: string, status: ReportStatus) {
  return apiFetch<{ message: string; report: AdminReport }>(`/api/reports/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// --- Resume Builder ---
// The builder's document is a loosely-typed { theme, sections } structure
// (see Editor.tsx/resume-builder/page.tsx, which use `any` throughout) --
// kept loose here too rather than introducing stricter typing the rest of
// that feature doesn't have.
export interface ResumeRecord {
  id: string;
  theme: unknown;
  sections: unknown;
  fullName: string | null;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  updatedAt: string;
}

export function getMyResume() {
  return apiFetch<ResumeRecord | null>("/api/resume/mine");
}

export function upsertMyResume(payload: { theme: unknown; sections: unknown }) {
  return apiFetch<{ message: string; resume: ResumeRecord }>("/api/resume/mine", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
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
  website: string | null;
  regionId: string | null;
  region: Region | null;
  createdAt: string;
}

export interface CompanyDetail extends Company {
  followerCount: number;
  averageRating: number;
  ratingCount: number;
  isFollowing: boolean;
  isBlocked: boolean;
}

export function getRegions() {
  return apiFetch<Region[]>("/api/regions");
}

export function getMyCompany() {
  return apiFetch<Company | null>("/api/companies/me");
}

export function getCompanyById(id: string) {
  return apiFetch<CompanyDetail>(`/api/companies/${id}`);
}

export function updateMyCompany(payload: {
  name: string;
  description?: string;
  regionId: string;
  website?: string;
  logo?: File;
}) {
  if (payload.logo) {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.description) formData.append("description", payload.description);
    formData.append("regionId", payload.regionId);
    if (payload.website) formData.append("website", payload.website);
    formData.append("logo", payload.logo);
    return apiFetch<{ message: string; company: Company }>("/api/companies/me", {
      method: "PUT",
      body: formData,
    });
  }
  return apiFetch<{ message: string; company: Company }>("/api/companies/me", {
    method: "PUT",
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      regionId: payload.regionId,
      website: payload.website,
    }),
  });
}

// --- Candidate: My Profile ---
// Structured screening data (nationality, passport, Gulf/India experience,
// preferred location) — distinct from Resume, which is the formatted CV
// document. See MyCandidateProfilePayload below for the editable fields.
export interface MyCandidateProfile {
  id: number;
  userId: number;
  name: string;
  position: string;
  passportNo: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  gender: string | null;
  indianExp: string | null;
  gulfExp: string | null;
  qualification: string | null;
  industry: string | null;
  whatsapp: string;
  email: string;
  currentLocation: string | null;
  preferredLocation: string | null;
  resumeUrl: string | null;
  profileImage: string | null;
  regionId: string | null;
  region: Region | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface MyCandidateProfilePayload {
  name: string;
  position: string;
  whatsapp: string;
  email: string;
  regionId: string;
  passportNo?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
  indianExp?: string;
  gulfExp?: string;
  qualification?: string;
  industry?: string;
  currentLocation?: string;
  preferredLocation?: string;
  profileImage?: File;
}

function buildCandidateProfileFormData(payload: MyCandidateProfilePayload): FormData {
  const formData = new FormData();
  const { profileImage, ...fields } = payload;
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, value);
  });
  if (profileImage) formData.append("profileImage", profileImage);
  return formData;
}

export function getMyCandidateProfile() {
  return apiFetch<MyCandidateProfile | null>("/api/candidate/my-profile");
}

export function createCandidateProfile(payload: MyCandidateProfilePayload) {
  return apiFetch<{ message: string; profile: MyCandidateProfile }>("/api/candidate/profile", {
    method: "POST",
    body: buildCandidateProfileFormData(payload),
  });
}

export function updateCandidateProfile(payload: MyCandidateProfilePayload) {
  return apiFetch<{ message: string }>("/api/candidate/profile", {
    method: "PUT",
    body: buildCandidateProfileFormData(payload),
  });
}

export function followCompany(id: string) {
  return apiFetch<{ message: string }>(`/api/companies/${id}/follow`, { method: "POST" });
}

export function unfollowCompany(id: string) {
  return apiFetch<{ message: string }>(`/api/companies/${id}/follow`, { method: "DELETE" });
}

export function rateCompany(id: string, rating: number, review?: string) {
  return apiFetch<{ message: string }>(`/api/companies/${id}/ratings`, {
    method: "POST",
    body: JSON.stringify({ rating, review }),
  });
}

export function blockCompany(id: string) {
  return apiFetch<{ message: string }>(`/api/companies/${id}/block`, { method: "POST" });
}

export function unblockCompany(id: string) {
  return apiFetch<{ message: string }>(`/api/companies/${id}/block`, { method: "DELETE" });
}

export function reportContent(payload: { jobId?: string; companyId?: string; reason: string }) {
  return apiFetch<{ message: string }>("/api/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- Job posting lookups: Location (hierarchical), Job Type, Industry ---
export interface JobLocation {
  id: string;
  name: string;
  parentId: string | null;
  children: JobLocation[];
}

export interface JobType {
  id: string;
  name: string;
}

export interface Industry {
  id: string;
  name: string;
}

export function getJobLocations() {
  return apiFetch<JobLocation[]>("/api/job-locations");
}

export function getJobTypes() {
  return apiFetch<JobType[]>("/api/job-types");
}

export function getIndustries() {
  return apiFetch<Industry[]>("/api/industries");
}

export { apiFetch, API_URL };
