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

// "Industry", "Location" (formerly "Nearby Jobs"), and "Jobs Opening" are no
// longer static link trees -- they're rendered by bespoke, live-data
// components (IndustryNavPanel/LocationNavPanel/JobsOpeningNavPanel in
// components/layout/) directly in Header.tsx, since their content now
// comes from the real Industry/JobLocation/Job tables instead of a
// hand-maintained list that had drifted out of sync with real ids (every
// old "Industry" link used a made-up slug that matched zero real jobs).
// The plain hrefs below are only a fallback for MobileNav, which still
// renders any item with no `dropdownItems` as a simple link.
// Same ?jobtype= value jobs/page.tsx's JOB_TYPE_OPTIONS and the homepage's
// Short Term CTA button already use -- keeping one shared constant so all
// three can never drift apart the way the old hardcoded nav links did.
export const SHORT_TERM_JOBS_HREF = `/jobs?jobtype=${encodeURIComponent("Short Term")}`;

export const mainNavItems: NavItem[] = [
  { label: "Industry", href: "/jobs" },
  { label: "Location", href: "/jobs" },
  { label: "Jobs Opening", href: "/jobs" },
  { label: "Short Term", href: SHORT_TERM_JOBS_HREF },
  { label: "Resume Builder", href: "/resume-builder" },
  { label: "Candidates Login", href: "/login" },
];

export const authNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Post Jobs", href: "/post-job" },
];
