import { getTokenFromDocumentCookie } from "./auth-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

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

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
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
    const message =
      (isJson && body?.message) || (isJson && body?.error) || "Request failed";
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
  | {
      selectAllMatching: true;
      filters: Record<string, unknown>;
      excludeIds: (string | number)[];
    };

function buildQuery(
  params: Record<string, string | number | boolean | string[] | undefined>,
): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) => usp.append(key, v));
    } else {
      usp.set(key, String(value));
    }
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

const BACKEND_TO_FRONTEND_ROLE: Record<
  BackendRole,
  "Candidate" | "Recruiter" | "Admin"
> = {
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
  jobLocationId?: string;
}

export function registerRequest(payload: RegisterPayload) {
  return apiFetch<{ message: string; userId: number }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...payload, role: toBackendRole(payload.role) }),
  });
}

export function loginRequest(email: string, password: string) {
  return apiFetch<{
    token: string;
    role: BackendRole;
    full_name: string | null;
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
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

// Logged-in user changing their own password -- distinct from
// forgot/reset above, which are for someone locked out with no session.
export function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ message: string }>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
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
  // Only present on getMyJobs() rows -- see jobController.js's getMyJobs.
  applicationsCount?: number;
  employerId: number;
  companyId: string | null;
  jobLocationId: string | null;
  jobLocationCountryId: string | null;
  jobLocationStateId: string | null;
  jobTypeId: string | null;
  jobType: { id: string; name: string } | null;
  industryId: string | null;
  industry: { id: string; name: string } | null;
  jobLocation: { id: string; name: string; parentId: string | null } | null;
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
    if (value !== undefined)
      form.append(key, typeof value === "boolean" ? String(value) : value);
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
  return apiFetch<
    (JobPost & {
      employer: { id: number; full_name: string | null; email: string };
    })[]
  >("/api/jobs/pending");
}

export type AdminJob = JobPost & {
  employer: { id: number; full_name: string | null; email: string };
};

export function getAllJobsAdmin(
  filters?: AdminListParams & { status?: JobPostStatus; type?: JobPostType },
) {
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
  return apiFetch<{ deleted: string[]; count: number }>(
    "/api/jobs/admin/bulk-delete",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updateJobStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
  trustEmployer?: boolean,
) {
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
  industry: string | null;
  whatsapp: string;
  email: string;
  currentLocation: string | null;
  resumeUrl: string | null;
  status: ProfileStatus;
  createdAt: string;
  user: { id: number; full_name: string | null; email: string };
}

export function getAllCandidateProfilesAdmin(filters?: {
  status?: ProfileStatus;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  const query = params.toString();
  return apiFetch<CandidateProfileAdmin[]>(
    `/api/candidate/admin/profiles${query ? `?${query}` : ""}`,
  );
}

export function approveCandidateProfile(id: number) {
  return apiFetch<CandidateProfileAdmin>(
    `/api/candidate/admin/profile/approve/${id}`,
    { method: "PUT" },
  );
}

export function rejectCandidateProfile(id: number) {
  return apiFetch<CandidateProfileAdmin>(
    `/api/candidate/admin/profile/reject/${id}`,
    { method: "PUT" },
  );
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

export function getAllCandidateUsers(
  filters?: AdminListParams & { dateFrom?: string; dateTo?: string },
) {
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
  return apiFetch<Paginated<CandidateUserAdmin>>(
    `/api/candidate/admin/users${query}`,
  );
}

export function bulkDeleteCandidateUsers(payload: BulkDeletePayload) {
  return apiFetch<{
    deleted: number[];
    failed: { id: number; reason: string }[];
  }>("/api/candidate/admin/users/bulk-delete", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCandidateUser(
  id: number,
  payload: {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
  },
) {
  return apiFetch<CandidateUserAdmin>(`/api/candidate/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCandidateUser(id: number) {
  return apiFetch<{ message: string }>(`/api/candidate/admin/users/${id}`, {
    method: "DELETE",
  });
}

export function setCandidateBlocked(id: number, isBlocked: boolean) {
  return apiFetch<{ message: string; user: CandidateUserAdmin }>(
    `/api/candidate/admin/users/${id}/block`,
    {
      method: "PATCH",
      body: JSON.stringify({ isBlocked }),
    },
  );
}

export function resetCandidatePassword(id: number, password: string) {
  return apiFetch<{ message: string }>(
    `/api/candidate/admin/users/${id}/password`,
    {
      method: "PUT",
      body: JSON.stringify({ password }),
    },
  );
}

// --- Admin: employer/company moderation ---
export interface CompanyAdminOwner {
  id: number;
  full_name: string | null;
  email: string;
  phone: string | null;
  isBlocked: boolean;
}

export interface CompanyAdminListItem extends Company {
  owner: CompanyAdminOwner;
  _count: { jobs: number; follows: number; reports: number };
  pendingReportCount: number;
}

export interface CompanyAdminDetail extends CompanyDetail {
  owner: CompanyAdminOwner;
  jobs: {
    id: string;
    title: string;
    status: JobPostStatus;
    createdAt: string;
  }[];
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
  return apiFetch<Paginated<CompanyAdminListItem>>(
    `/api/admin/companies${query}`,
  );
}

export function getCompanyAdminDetail(id: string) {
  return apiFetch<CompanyAdminDetail>(`/api/admin/companies/${id}`);
}

// Throws ApiError with status 409 and body { jobCount, requiresConfirmation }
// if the company has jobs and confirm wasn't passed — callers should catch
// that specific case and re-call with confirm=true after the admin confirms.
export function deleteCompanyAdmin(id: string, confirm?: boolean) {
  return apiFetch<{ message: string }>(
    `/api/admin/companies/${id}${confirm ? "?confirm=true" : ""}`,
    {
      method: "DELETE",
    },
  );
}

export function bulkDeleteCompanies(payload: BulkDeletePayload) {
  return apiFetch<{
    deleted: string[];
    failed: { id: string; reason: string }[];
  }>("/api/admin/companies/bulk-delete", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- Admin: reports queue ---
export type ReportStatus = "PENDING" | "VIEWED" | "DISMISSED";

export interface AdminReport {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reporter: { id: number; full_name: string | null; email: string };
  job: {
    id: string;
    title: string;
    company: string;
    status: JobPostStatus;
  } | null;
  company: { id: string; name: string } | null;
}

export type ReportTargetType = "JOB" | "COMPANY";

export function getReports(
  filters?: AdminListParams & {
    status?: ReportStatus;
    targetType?: ReportTargetType;
  },
) {
  const query = buildQuery({
    status: filters?.status,
    targetType: filters?.targetType,
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
  return apiFetch<{ message: string; report: AdminReport }>(
    `/api/reports/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
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
  return apiFetch<{ message: string; resume: ResumeRecord }>(
    "/api/resume/mine",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

// --- Applications ---
// Everything the apply-dialog collects -- all optional, so a bare
// applyToJob(jobId) with no payload still works exactly like before
// (backend auto-picks the candidate's latest resume either way). Also used
// (with `email`, which self-apply never sends) for applyToJobProxy below.
export interface ApplyPayload {
  resumeId?: string;
  name?: string;
  phone?: string;
  email?: string;
  position?: string;
  jobLocationId?: string;
  industry?: string;
  course?: string;
  specialization?: string;
  experienceYears?: number;
  isFresher?: boolean;
}

export interface ApplyResult {
  success: boolean;
  message: string;
  data: { id: string; status: string };
  // Only present on a real (non-duplicate) self-apply -- used to build the
  // wa.me redirect to the recruiter. Null if the job has no WhatsApp number
  // on file.
  contactWhatsapp?: string | null;
  resumeLink?: string;
}

export function applyToJob(jobId: string, payload: ApplyPayload = {}) {
  return apiFetch<ApplyResult>(`/api/applications/apply/${jobId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Employer/admin logging a candidate's application on their behalf (walk-in,
// phone referral) -- same payload shape, `phone` is required by the backend
// since that's what it matches an existing candidate account by.
export function applyToJobProxy(jobId: string, payload: ApplyPayload) {
  return apiFetch<{ success: boolean; message: string; data: { id: string } }>(
    `/api/applications/apply-proxy/${jobId}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function getMyApplications() {
  return apiFetch<{ success: boolean; count: number; data: unknown[] }>(
    "/api/applications/my",
  );
}

// Contact Leads -- every applicant against the caller's own jobs (every job,
// for admin/sub_admin), optionally scoped to one job for the per-job
// Applicants page. Deliberately not credit-gated (see atsController.js's
// two-tier unlock for the DIFFERENT, credit-gated "browse the whole
// candidate database" feature) -- these are people who reached out about
// the employer's own postings.
export interface JobLead {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  source: "CANDIDATE" | "EMPLOYER" | "ADMIN";
  createdAt: string;
  name: string;
  phone: string;
  location: string | null;
  position: string;
  industry: string;
  qualification: string;
  experienceYears: number | null;
  isFresher: boolean;
  resumeLink: string;
}

export function getJobLeads(jobId?: string) {
  const query = buildQuery({ jobId });
  return apiFetch<{ success: boolean; count: number; data: JobLead[] }>(
    `/api/applications/leads${query}`,
  );
}

// Fire-and-forget Call/WhatsApp click tracking on a job listing -- feeds
// Contact Leads alongside real applications. Never blocks or fails loudly:
// the actual tel:/wa.me navigation should proceed either way.
export function recordJobInteraction(jobId: string, type: "CALL" | "WHATSAPP") {
  apiFetch(`/api/jobs/${jobId}/interaction`, {
    method: "POST",
    body: JSON.stringify({ type }),
  }).catch(() => {});
}

// --- Company / Region ---
export interface Region {
  id: string;
  name: string;
}

// Shape of a JobLocation row as returned by a Prisma `include` (e.g. on
// Company/CandidateProfile) — distinct from JobLocationSearchResult, which
// is the shape the /job-locations/search endpoint returns.
export interface JobLocationRef {
  id: string;
  name: string;
  countryName: string | null;
  stateName: string | null;
}

export interface Company {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  regionId: string | null;
  region: Region | null;
  jobLocationId: string | null;
  jobLocation: JobLocationRef | null;
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
  jobLocationId: string;
  website?: string;
  logo?: File;
}) {
  if (payload.logo) {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.description)
      formData.append("description", payload.description);
    formData.append("jobLocationId", payload.jobLocationId);
    if (payload.website) formData.append("website", payload.website);
    formData.append("logo", payload.logo);
    return apiFetch<{ message: string; company: Company }>(
      "/api/companies/me",
      {
        method: "PUT",
        body: formData,
      },
    );
  }
  return apiFetch<{ message: string; company: Company }>("/api/companies/me", {
    method: "PUT",
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      jobLocationId: payload.jobLocationId,
      website: payload.website,
    }),
  });
}

// --- Candidate: My Profile ---
// Structured screening data (nationality, passport, Gulf/India experience,
// preferred location) — distinct from Resume, which is the formatted CV
// document. See MyCandidateProfilePayload below for the editable fields.
// A repeatable entry within Experience / Education / Projects — same shape
// convention already proven by Resume builder's LIST section type.
export interface ProfileEntry {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  content: string;
  // Only Education entries populate these (see courseSpecializations.ts) --
  // shared here rather than a parallel type so ProfileEntryList/Experience/
  // Projects keep working unchanged, they just never set them.
  course?: string;
  specialization?: string;
}

export interface MyCandidateProfile {
  id: number;
  userId: number;
  name: string;
  position: string;
  passportNo: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  gender: string | null;
  experienceYears: number | null;
  isFresher: boolean;
  industry: string | null;
  whatsapp: string;
  email: string;
  currentLocation: string | null;
  preferredLocationId: string | null;
  preferredLocation: JobLocationRef | null;
  summary: string | null;
  skills: string[] | null;
  experience: ProfileEntry[] | null;
  education: ProfileEntry[] | null;
  certifications: string[] | null;
  projects: ProfileEntry[] | null;
  resumeUrl: string | null;
  profileImage: string | null;
  regionId: string | null;
  region: Region | null;
  jobLocationId: string | null;
  jobLocation: JobLocationRef | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface MyCandidateProfilePayload {
  name: string;
  position: string;
  whatsapp: string;
  email: string;
  jobLocationId: string;
  passportNo?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
  experienceYears?: number;
  isFresher?: boolean;
  industry?: string;
  preferredLocationId?: string;
  summary?: string;
  skills?: string[];
  experience?: ProfileEntry[];
  education?: ProfileEntry[];
  certifications?: string[];
  projects?: ProfileEntry[];
  profileImage?: File;
}

function buildCandidateProfileFormData(
  payload: MyCandidateProfilePayload,
): FormData {
  const formData = new FormData();
  const { profileImage, ...fields } = payload;
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined) return;
    // Array fields (skills/experience/education/certifications/projects)
    // travel as JSON strings — this is multipart/form-data (profileImage
    // rides along), which can't carry real arrays/objects.
    formData.append(
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  });
  if (profileImage) formData.append("profileImage", profileImage);
  return formData;
}

export function getMyCandidateProfile() {
  return apiFetch<MyCandidateProfile | null>("/api/candidate/my-profile");
}

export function createCandidateProfile(payload: MyCandidateProfilePayload) {
  return apiFetch<{ message: string; profile: MyCandidateProfile }>(
    "/api/candidate/profile",
    {
      method: "POST",
      body: buildCandidateProfileFormData(payload),
    },
  );
}

// Uploads (or replaces) the candidate's resume file — a separate, focused
// endpoint from create/updateCandidateProfile above so it can run the
// moment a file is picked, independent of the rest of the form (also sets
// up the later "upload -> parse -> pre-fill" flow, which needs the upload
// step decoupled from Save). If the candidate has no profile row yet, the
// backend auto-creates a minimal one seeded from their registration data.
export function uploadCandidateResume(file: File) {
  const formData = new FormData();
  formData.append("resume", file);
  return apiFetch<{
    message: string;
    resumeUrl: string;
    profile: MyCandidateProfile;
  }>("/api/candidate/profile/resume", {
    method: "POST",
    body: formData,
  });
}

// Structured data extracted from the candidate's already-uploaded resume
// file (see uploadCandidateResume above) — returned for the frontend to
// review/pre-fill into the profile form, never auto-saved by the backend.
// currentLocation is intentionally NOT part of the profile's own location
// picker shape (CityAutocomplete's LocationValue) — it's raw text as
// written on the resume, not a validated worldwide-location match, so the
// caller doesn't attempt to auto-select a location from it.
export interface ParsedResumeData {
  name: string;
  position: string;
  email: string;
  whatsapp: string;
  currentLocation: string;
  industry: string;
  // null when Gemini couldn't form a confident estimate -- never a guess,
  // see geminiParseResume.js's prompt. isFresher forces this to 0 already
  // (backend-side), so the two never arrive contradictory.
  totalExperienceYears: number | null;
  isFresher: boolean;
  summary: string;
  skills: string[];
  certifications: string[];
  // No `id` — these are freshly extracted, not yet real ProfileEntry rows;
  // the frontend assigns one when applying them into the form, same as
  // ProfileEntryList's own "add entry" already does.
  experience: Omit<ProfileEntry, "id">[];
  education: Omit<ProfileEntry, "id">[];
  projects: Omit<ProfileEntry, "id">[];
}

export function parseCandidateResume() {
  return apiFetch<{ message: string; parsed: ParsedResumeData }>(
    "/api/resume/parse",
    {
      method: "POST",
    },
  );
}

export function updateCandidateProfile(payload: MyCandidateProfilePayload) {
  return apiFetch<{ message: string }>("/api/candidate/profile", {
    method: "PUT",
    body: buildCandidateProfileFormData(payload),
  });
}

// --- Employer: credits ---
export interface CreditsSummary {
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
}

export function getMyCredits() {
  return apiFetch<CreditsSummary>("/api/employer/credits");
}

export function grantCreditsToCompany(
  companyId: string,
  amount: number,
  note?: string,
) {
  return apiFetch<{ message: string }>(
    `/api/admin/companies/${companyId}/credits`,
    {
      method: "POST",
      body: JSON.stringify({ amount, note }),
    },
  );
}

// --- ATS: candidate search ---
// Contact info (whatsapp/email) is null until this employer has unlocked
// that candidate — the backend masks it per-row, not just the frontend.
export interface ATSCandidate {
  id: number;
  userId: number;
  name: string;
  position: string;
  nationality: string | null;
  // Legacy free-text field, retired from the profile form -- shown only as
  // a fallback for candidates saved before Course/Specialization existed.
  qualification: string | null;
  industry: string | null;
  experienceYears: number | null;
  isFresher: boolean;
  age: number | null;
  gender: string | null;
  currentLocation: string | null;
  preferredLocation: string | null;
  region: Region | null;
  hasResume: boolean;
  resumeUpdatedAt: string | null;
  isUnlocked: boolean;
  isResumeUnlocked: boolean;
  whatsapp: string | null;
  email: string | null;
  summary: string | null;
  skills: string[] | null;
  certifications: string[] | null;
  experience: ProfileEntry[] | null;
  education: ProfileEntry[] | null;
  projects: ProfileEntry[] | null;
}

export interface ATSSearchResult extends Paginated<ATSCandidate> {
  stats: { totalCandidates: number; withResumeCount: number };
}

export interface ATSSearchFilters extends AdminListParams {
  region?: string;
  jobLocationId?: string;
  nationality?: string;
  gender?: string;
  keywordMode?: "all" | "any";
  resumeWithinDays?: number;
  industry?: string;
  course?: string;
  specialization?: string;
  expMin?: number;
  expMax?: number;
  fresherOnly?: boolean;
  ageMax?: number;
  skills?: string[];
}

export function searchCandidates(filters?: ATSSearchFilters) {
  const query = buildQuery({
    page: filters?.page,
    limit: filters?.limit,
    search: filters?.search,
    sortBy: filters?.sortBy,
    sortOrder: filters?.sortOrder,
    all: filters?.all,
    region: filters?.region,
    jobLocationId: filters?.jobLocationId,
    nationality: filters?.nationality,
    gender: filters?.gender,
    keywordMode: filters?.keywordMode,
    resumeWithinDays: filters?.resumeWithinDays,
    industry: filters?.industry,
    course: filters?.course,
    specialization: filters?.specialization,
    expMin: filters?.expMin,
    expMax: filters?.expMax,
    fresherOnly: filters?.fresherOnly,
    ageMax: filters?.ageMax,
    skills: filters?.skills,
  });
  return apiFetch<ATSSearchResult>(`/api/ats/search${query}`);
}

export interface UnlockCandidateResult {
  candidate: { whatsapp: string | null; email: string | null };
  resume: { theme: unknown; sections: unknown } | null;
  // Signed, ready-to-open URL for the candidate's uploaded resume FILE
  // (PDF/DOC/DOCX) — a separate source from the Resume Builder `resume`
  // field above; a candidate can have either, both, or neither.
  uploadedResumeUrl: string | null;
  creditsRemaining: number;
}

export function unlockCandidate(userId: number, type: "resume" | "profile") {
  return apiFetch<UnlockCandidateResult>(
    `/api/ats/candidates/${userId}/unlock`,
    {
      method: "POST",
      body: JSON.stringify({ type }),
    },
  );
}

export function followCompany(id: string) {
  return apiFetch<{ message: string }>(`/api/companies/${id}/follow`, {
    method: "POST",
  });
}

export function unfollowCompany(id: string) {
  return apiFetch<{ message: string }>(`/api/companies/${id}/follow`, {
    method: "DELETE",
  });
}

export function rateCompany(id: string, rating: number, review?: string) {
  return apiFetch<{ message: string }>(`/api/companies/${id}/ratings`, {
    method: "POST",
    body: JSON.stringify({ rating, review }),
  });
}

export function blockCompany(id: string) {
  return apiFetch<{ message: string }>(`/api/companies/${id}/block`, {
    method: "POST",
  });
}

export function unblockCompany(id: string) {
  return apiFetch<{ message: string }>(`/api/companies/${id}/block`, {
    method: "DELETE",
  });
}

export function reportContent(payload: {
  jobId?: string;
  companyId?: string;
  reason: string;
}) {
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

// Worldwide search-as-you-type over the JobLocation tree (countries,
// states, and cities alike) — used by CityAutocomplete. Distinct from
// getJobLocations() above, which returns the whole coarse tree at once and
// doesn't scale to city-level row counts.
export interface JobLocationSearchResult {
  id: string;
  name: string;
  country: string | null;
  state: string | null;
}

export function searchJobLocations(q: string) {
  return apiFetch<JobLocationSearchResult[]>(
    `/api/job-locations/search?q=${encodeURIComponent(q)}`,
  );
}

export function getJobTypes() {
  return apiFetch<JobType[]>("/api/job-types");
}

export function getIndustries() {
  return apiFetch<Industry[]>("/api/industries");
}

export interface Qualification {
  id: string;
  name: string;
}

export function getQualifications() {
  return apiFetch<Qualification[]>("/api/qualifications");
}

// Real skills candidates currently have (frequency-sorted), not a fixed
// taxonomy — powers the ATS Skills filter's suggestions.
export interface SkillSuggestion {
  value: string;
  label: string;
}

export function getSkillSuggestions() {
  return apiFetch<SkillSuggestion[]>("/api/ats/skills");
}

export { apiFetch, API_URL };
