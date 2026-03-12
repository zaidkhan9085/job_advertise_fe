export interface NavDropdownItem {
  label: string;
  href: string;
  subItems?: NavDropdownItem[];
}

export interface NavItem {
  label: string;
  href: string;
  dropdownItems?: NavDropdownItem[];
}

export const industryItems: NavDropdownItem[] = [
  { label: "Oil & Gas, Petrochemical, Refinery", href: "/jobs?industry=oil-gas" },
  { label: "Power Plant, Substation", href: "/jobs?industry=power-plant" },
  { label: "Construction, EPC", href: "/jobs?industry=construction" },
  { label: "Manufacturing, Production", href: "/jobs?industry=manufacturing" },
  { label: "Facility Management, MEP", href: "/jobs?industry=facility-management" },
  { label: "Healthcare & Hospitality", href: "/jobs?industry=healthcare" },
  { label: "Information Technology", href: "/jobs?industry=it" },
  { label: "Marine & Maritime, Aviation", href: "/jobs?industry=marine" },
  { label: "Non-IT, Banking & Finance", href: "/jobs?industry=banking-finance" },
  { label: "Other", href: "/jobs?industry=other" },
];

export const nearbyJobsItems: NavDropdownItem[] = [
  { label: "East India", href: "/jobs?location=east-india" },
  { label: "North India", href: "/jobs?location=north-india" },
  { label: "South India", href: "/jobs?location=south-india" },
  { label: "West India", href: "/jobs?location=west-india" },
  { label: "GCC", href: "/jobs?location=GCC" },
  { label: "Europe", href: "/jobs?location=Europe" },
];

export const vacancyItems: NavDropdownItem[] = [
  { label: "Gulf Jobs", href: "/jobs?category=gulf-jobs" },
  { label: "Asia Jobs", href: "/jobs?category=asia-jobs" },
  { label: "Europe Jobs", href: "/jobs?category=europe-jobs" },
  { label: "Australia", href: "/jobs?category=australia" },
  { label: "Canada", href: "/jobs?category=canada" },
  { label: "Russia", href: "/jobs?category=russia" },
];

export const mainNavItems: NavItem[] = [
  { label: "Industry", href: "/jobs", dropdownItems: industryItems },
  { label: "Nearby Jobs", href: "/jobs?type=nearby", dropdownItems: nearbyJobsItems },
  { label: "Vacancy", href: "/jobs?type=vacancy", dropdownItems: vacancyItems },
  { label: "Post Resume", href: "/resume" },
  { label: "Pricing", href: "/pricing" },
  { label: "Join Group", href: "https://chat.whatsapp.com/E73OloAiRjv8ZZYQBNqEt5?mode=ac_t" }, // Keep WhatsApp external
];

export const authNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Post Jobs", href: "/post-job" },
];
