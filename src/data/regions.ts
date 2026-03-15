import { MapPin, Globe, Compass, Navigation, Landmark, Plane, GraduationCap } from "lucide-react";

export interface Region {
  id: string;
  label: string;
  flag?: string;
  icon?: any;
  type: "nearby" | "country" | "region";
  jobCount: number;
  href: string;
}

export const nearbyRegions: Region[] = [
  { id: "east-india", label: "East India", flag: "🇮🇳", icon: Compass, type: "nearby", jobCount: 380, href: "/jobs?location=east-india" },
  { id: "west-india", label: "West India", flag: "🇮🇳", icon: Navigation, type: "nearby", jobCount: 490, href: "/jobs?location=west-india" },
  { id: "north-india", label: "North India", flag: "🇮🇳", icon: MapPin, type: "nearby", jobCount: 520, href: "/jobs?location=north-india" },
  { id: "south-india", label: "South India", flag: "🇮🇳", icon: Globe, type: "nearby", jobCount: 610, href: "/jobs?location=south-india" },
  { id: "gulf-jobs", label: "Gulf Jobs", flag: "🌍", icon: Landmark, type: "nearby", jobCount: 1840, href: "/jobs?location=gulf" },
  { id: "asia-jobs", label: "Asia Jobs", flag: "🌏", icon: Plane, type: "nearby", jobCount: 920, href: "/jobs?location=asia" },
  { id: "europe", label: "Europe", flag: "🇪🇺", icon: GraduationCap, type: "nearby", jobCount: 420, href: "/jobs?location=europe" },
];

export const vacancyCountries: Region[] = [
  { id: "uae", label: "UAE", flag: "🇦🇪", type: "country", jobCount: 920, href: "/jobs?location=uae" },
  { id: "saudi-arabia", label: "Saudi Arabia", flag: "🇸🇦", type: "country", jobCount: 780, href: "/jobs?location=saudi-arabia" },
  { id: "qatar", label: "Qatar", flag: "🇶🇦", type: "country", jobCount: 560, href: "/jobs?location=qatar" },
  { id: "oman", label: "Oman", flag: "🇴🇲", type: "country", jobCount: 290, href: "/jobs?location=oman" },
  { id: "kuwait", label: "Kuwait", flag: "🇰🇼", type: "country", jobCount: 340, href: "/jobs?location=kuwait" },
  { id: "bahrain", label: "Bahrain", flag: "🇧🇭", type: "country", jobCount: 180, href: "/jobs?location=bahrain" },
  { id: "russia", label: "Russia", flag: "🇷🇺", type: "country", jobCount: 120, href: "/jobs?location=russia" },
  { id: "singapore", label: "Singapore", flag: "🇸🇬", type: "country", jobCount: 410, href: "/jobs?location=singapore" },
  { id: "australia", label: "Australia", flag: "🇦🇺", type: "country", jobCount: 210, href: "/jobs?location=australia" },
  { id: "canada", label: "Canada", flag: "🇨🇦", type: "country", jobCount: 175, href: "/jobs?location=canada" },
  { id: "new-zealand", label: "New Zealand", flag: "🇳🇿", type: "country", jobCount: 140, href: "/jobs?location=new-zealand" },
];
