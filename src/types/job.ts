export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Temporary";
export type WorkplaceType = "On-site" | "Hybrid" | "Remote";
export type JobStatus = "Draft" | "Active" | "Closed";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  workplace: WorkplaceType;
  salary?: string;
  category: string;
  experience?: string;
  
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  
  // Phase 1 legacy fields for featured jobs
  jobUrl?: string;
  categoryUrl?: string;
  whatsapp?: string;
  call?: string;
  badges?: string[];
  count?: number;
  image?: string;
  imageAlt?: string;
  isFavorite?: boolean;

  postedAt: string;
  status: JobStatus;
  featured?: boolean;
}
