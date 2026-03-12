export type UserRole = "Candidate" | "Recruiter" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  joinedAt: string;
}

export interface Candidate extends User {
  role: "Candidate";
  title?: string;
  resumeUrl?: string;
  skills?: string[];
  location?: string;
}

export interface Recruiter extends User {
  role: "Recruiter";
  companyId: string;
  companyName: string;
}
