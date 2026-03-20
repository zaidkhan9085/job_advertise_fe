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
  { id: "all-india", label: "All India States", flag: "🇮🇳", icon: MapPin, type: "nearby", jobCount: 2000, href: "/jobs?location=india" },
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
  { id: "iran", label: "Iran", flag: "🇮🇷", type: "country", jobCount: 150, href: "/jobs?location=iran" },
  { id: "iraq", label: "Iraq", flag: "🇮🇶", type: "country", jobCount: 210, href: "/jobs?location=iraq" },
  { id: "turkey", label: "Turkey", flag: "🇹🇷", type: "country", jobCount: 130, href: "/jobs?location=turkey" },
  { id: "singapore", label: "Singapore", flag: "🇸🇬", type: "country", jobCount: 410, href: "/jobs?location=singapore" },
  { id: "malaysia", label: "Malaysia", flag: "🇲🇾", type: "country", jobCount: 320, href: "/jobs?location=malaysia" },
  { id: "thailand", label: "Thailand", flag: "🇹🇭", type: "country", jobCount: 180, href: "/jobs?location=thailand" },
  { id: "indonesia", label: "Indonesia", flag: "🇮🇩", type: "country", jobCount: 150, href: "/jobs?location=indonesia" },
  { id: "philippines", label: "Philippines", flag: "🇵🇭", type: "country", jobCount: 240, href: "/jobs?location=philippines" },
  { id: "japan", label: "Japan", flag: "🇯🇵", type: "country", jobCount: 130, href: "/jobs?location=japan" },
  { id: "south-korea", label: "South Korea", flag: "🇰🇷", type: "country", jobCount: 110, href: "/jobs?location=south-korea" },
  { id: "russia", label: "Russia", flag: "🇷🇺", type: "country", jobCount: 120, href: "/jobs?location=russia" },
  { id: "kazakhstan", label: "Kazakhstan", flag: "🇰🇿", type: "country", jobCount: 90, href: "/jobs?location=kazakhstan" },
  { id: "uzbekistan", label: "Uzbekistan", flag: "🇺🇿", type: "country", jobCount: 75, href: "/jobs?location=uzbekistan" },
  { id: "azerbaijan", label: "Azerbaijan", flag: "🇦🇿", type: "country", jobCount: 60, href: "/jobs?location=azerbaijan" },
  { id: "georgia", label: "Georgia", flag: "🇬🇪", type: "country", jobCount: 85, href: "/jobs?location=georgia" },
  { id: "israel", label: "Israel", flag: "🇮🇱", type: "country", jobCount: 110, href: "/jobs?location=israel" },
  { id: "jordan", label: "Jordan", flag: "🇯🇴", type: "country", jobCount: 95, href: "/jobs?location=jordan" },
  { id: "africa", label: "Africa", flag: "🌍", type: "country", jobCount: 320, href: "/jobs?location=africa" },
  { id: "europe", label: "Europe", flag: "🇪🇺", type: "country", jobCount: 420, href: "/jobs?location=europe" },
  { id: "australia", label: "Australia", flag: "🇦🇺", type: "country", jobCount: 210, href: "/jobs?location=australia" },
  { id: "canada", label: "Canada", flag: "🇨🇦", type: "country", jobCount: 175, href: "/jobs?location=canada" },
  { id: "new-zealand", label: "New Zealand", flag: "🇳🇿", type: "country", jobCount: 140, href: "/jobs?location=new-zealand" },
];
