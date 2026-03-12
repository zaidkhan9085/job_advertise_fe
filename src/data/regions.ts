export interface Region {
  id: string;
  label: string;
  flag: string;
  type: "nearby" | "country" | "region";
  jobCount: number;
  href: string;
}

export const nearbyRegions: Region[] = [
  { id: "east-india", label: "East India", flag: "🇮🇳", type: "nearby", jobCount: 380, href: "/jobs?region=east-india" },
  { id: "north-india", label: "North India", flag: "🇮🇳", type: "nearby", jobCount: 520, href: "/jobs?region=north-india" },
  { id: "south-india", label: "South India", flag: "🇮🇳", type: "nearby", jobCount: 610, href: "/jobs?region=south-india" },
  { id: "west-india", label: "West India", flag: "🇮🇳", type: "nearby", jobCount: 490, href: "/jobs?region=west-india" },
  { id: "gcc", label: "GCC Countries", flag: "🌍", type: "nearby", jobCount: 1840, href: "/jobs?region=gcc" },
  { id: "europe", label: "Europe", flag: "🇪🇺", type: "nearby", jobCount: 420, href: "/jobs?region=europe" },
];

export const vacancyCountries: Region[] = [
  { id: "saudi-arabia", label: "Saudi Arabia", flag: "🇸🇦", type: "country", jobCount: 780, href: "/jobs?country=saudi-arabia" },
  { id: "uae", label: "United Arab Emirates", flag: "🇦🇪", type: "country", jobCount: 920, href: "/jobs?country=uae" },
  { id: "qatar", label: "Qatar", flag: "🇶🇦", type: "country", jobCount: 560, href: "/jobs?country=qatar" },
  { id: "kuwait", label: "Kuwait", flag: "🇰🇼", type: "country", jobCount: 340, href: "/jobs?country=kuwait" },
  { id: "oman", label: "Oman", flag: "🇴🇲", type: "country", jobCount: 290, href: "/jobs?country=oman" },
  { id: "bahrain", label: "Bahrain", flag: "🇧🇭", type: "country", jobCount: 180, href: "/jobs?country=bahrain" },
  { id: "australia", label: "Australia", flag: "🇦🇺", type: "country", jobCount: 210, href: "/jobs?country=australia" },
  { id: "canada", label: "Canada", flag: "🇨🇦", type: "country", jobCount: 175, href: "/jobs?country=canada" },
];
