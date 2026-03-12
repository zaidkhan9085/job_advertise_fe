export interface Industry {
  id: string;
  label: string;
  icon: string;
  jobCount: number;
  href: string;
}

export const industries: Industry[] = [
  { id: "oil-gas", label: "Oil & Gas", icon: "⚙️", jobCount: 1240, href: "/jobs?industry=oil-gas" },
  { id: "construction", label: "Construction & EPC", icon: "🏗️", jobCount: 980, href: "/jobs?industry=construction" },
  { id: "power-plant", label: "Power Plant", icon: "⚡", jobCount: 640, href: "/jobs?industry=power-plant" },
  { id: "manufacturing", label: "Manufacturing", icon: "🏭", jobCount: 760, href: "/jobs?industry=manufacturing" },
  { id: "it", label: "Information Technology", icon: "💻", jobCount: 1100, href: "/jobs?industry=it" },
  { id: "healthcare", label: "Healthcare & Hospitality", icon: "🏥", jobCount: 520, href: "/jobs?industry=healthcare" },
  { id: "facility", label: "Facility Mgmt & MEP", icon: "🔧", jobCount: 430, href: "/jobs?industry=facility-management" },
  { id: "marine", label: "Marine & Aviation", icon: "✈️", jobCount: 310, href: "/jobs?industry=marine" },
  { id: "banking", label: "Banking & Finance", icon: "🏦", jobCount: 480, href: "/jobs?industry=banking-finance" },
  { id: "other", label: "Other Industries", icon: "📋", jobCount: 290, href: "/jobs?industry=other" },
];
