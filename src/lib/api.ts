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

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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

// Backend uses lowercase enum values (candidate/employer/admin); the UI uses
// friendlier labels — map between the two at the API boundary only.
export type FrontendRole = "Candidate" | "Recruiter";
export type BackendRole = "candidate" | "employer" | "admin";

const FRONTEND_TO_BACKEND_ROLE: Record<FrontendRole, BackendRole> = {
  Candidate: "candidate",
  Recruiter: "employer",
};

const BACKEND_TO_FRONTEND_ROLE: Record<BackendRole, "Candidate" | "Recruiter" | "Admin"> = {
  candidate: "Candidate",
  employer: "Recruiter",
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

export { apiFetch, API_URL };
