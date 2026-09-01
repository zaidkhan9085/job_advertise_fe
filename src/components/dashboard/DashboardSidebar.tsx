"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  Users,
  Settings,
  Building,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Search,
  PlayCircle,
  Flag,
  FileText,
  X,
} from "lucide-react";

import { siteConfig } from "@/data/branding";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import type { BackendRole } from "@/lib/api";

interface SidebarLink {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const LINKS_BY_ROLE: Record<BackendRole, SidebarLink[]> = {
  admin: [
    { label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
    { label: "Pending Jobs", href: "/dashboard/admin/jobs", icon: Briefcase },
    { label: "All Jobs", href: "/dashboard/admin/all-jobs", icon: ShieldCheck },
    { label: "Reports", href: "/dashboard/admin/reports", icon: Flag },
    { label: "Employers", href: "/dashboard/admin/employers", icon: Building },
    { label: "Candidates", href: "/dashboard/admin/candidates", icon: Users },
    { label: "Settings", href: "/dashboard/coming-soon", icon: Settings },
  ],
  employer: [
    { label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
    { label: "Manage Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { label: "Search Candidates", href: "/dashboard/search-candidates", icon: Search },
    { label: "Stories", href: "/dashboard/stories", icon: PlayCircle },
    { label: "Contact Leads", href: "/dashboard/jobs?tab=leads", icon: Users },
    { label: "Company Profile", href: "/dashboard/profile", icon: Building },
  ],
  // sub_admin has no dedicated nav yet — it's promoted from Employer and
  // gains moderation permissions, not a distinct dashboard (see [[api.ts]]).
  sub_admin: [
    { label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
    { label: "Manage Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { label: "Search Candidates", href: "/dashboard/search-candidates", icon: Search },
    { label: "Pending Jobs", href: "/dashboard/admin/jobs", icon: ShieldCheck },
    { label: "All Jobs", href: "/dashboard/admin/all-jobs", icon: ShieldCheck },
    { label: "Reports", href: "/dashboard/admin/reports", icon: Flag },
    { label: "Settings", href: "/dashboard/coming-soon", icon: Settings },
  ],
  candidate: [
    { label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/my-profile", icon: Users },
    { label: "Browse Jobs", href: "/jobs", icon: Search },
    { label: "My Applications", href: "/dashboard/applications", icon: Briefcase },
    { label: "My Resume", href: "/resume-builder", icon: FileText },
  ],
};

const ROLE_SECTION_LABEL: Record<BackendRole, string> = {
  admin: "Admin",
  employer: "Recruiter",
  sub_admin: "Recruiter",
  candidate: "Candidate",
};

// The nav-links list + support box, shared verbatim between the desktop
// rail and the mobile drawer -- only the outer chrome around this (fixed
// rail vs full-width slide-in panel) differs, so the role-based link data
// and its rendering stay defined once here instead of duplicated per layout.
function SidebarNavContent({
  links,
  role,
  pathname,
  isCollapsed,
  onLinkClick,
}: {
  links: SidebarLink[];
  role: BackendRole;
  pathname: string;
  isCollapsed: boolean;
  onLinkClick?: () => void;
}) {
  return (
    <>
      <nav className={`flex-1 overflow-y-auto py-6 space-y-1 transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"}`}>
        {!isCollapsed && (
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-3 mb-4 opacity-60 flex items-center gap-1.5">
            {role === "admin" && <ShieldCheck className="w-3 h-3" />}
            {ROLE_SECTION_LABEL[role]}
          </div>
        )}

        {links.map((link, index) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={`${link.href}-${index}`}
              href={link.href}
              onClick={onLinkClick}
              title={isCollapsed ? link.label : ""}
              className={`flex items-center gap-3 py-3 rounded-xl text-sm font-bold transition-all relative group ${
                isCollapsed ? "px-0 justify-center" : "px-4"
              } ${
                isActive
                  ? "bg-brand-blue/10 text-brand-blue"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-brand-blue" : "text-muted-foreground group-hover:text-foreground"}`} />
              {!isCollapsed && (
                <span className="whitespace-nowrap transition-opacity duration-300">
                  {link.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-brand-blue" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t border-border/60 shrink-0 transition-all duration-300 ${isCollapsed ? "px-2" : "p-4"}`}>
        {isCollapsed ? (
          <Link
            href="/contact"
            title="Contact Support"
            className="flex items-center justify-center h-12 w-full rounded-xl bg-secondary/50 border border-border/40 text-muted-foreground hover:bg-brand-blue hover:text-white transition-all shadow-inner"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>
        ) : (
          <div className="bg-brand-blue/5 rounded-2xl p-5 border border-brand-blue/10">
            <p className="text-sm font-black text-brand-blue mb-2">Need help?</p>
            <p className="text-[11px] text-brand-blue/60 mb-4 font-medium leading-relaxed">
              Contact our global support team for hiring assistance.
            </p>
            <Link
              href="/contact"
              onClick={onLinkClick}
              className="inline-flex w-full items-center justify-center py-2.5 text-[10px] font-black uppercase tracking-widest bg-white text-brand-blue border border-brand-blue/20 rounded-xl shadow-sm hover:bg-brand-blue hover:text-white transition-all"
            >
              Contact Support
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
  const { user } = useAuth();

  const role = user?.role ?? "candidate";
  const sidebarLinks = LINKS_BY_ROLE[role];

  // Same body-scroll-lock pattern as MobileNav.tsx/ApplyDialog.tsx -- the
  // mobile drawer below is a fixed-position overlay, so the page behind it
  // shouldn't keep scrolling while it's open.
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      <aside
        className={`bg-white border-r border-border/60 hidden md:flex flex-col h-full shrink-0 transition-all duration-300 relative ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-border/60 rounded-full flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all shadow-sm z-50 text-muted-foreground"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Logo Section */}
        <div className={`h-16 flex items-center border-b border-border/60 shrink-0 transition-all duration-300 ${
          isCollapsed ? "px-0 justify-center" : "px-6"
        }`}>
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <img
              src={siteConfig.logo.url}
              alt={siteConfig.logo.alt}
              className={`h-10 w-auto transition-all ${isCollapsed ? "min-w-[40px] scale-90" : ""}`}
            />
          </Link>
        </div>

        <SidebarNavContent links={sidebarLinks} role={role} pathname={pathname} isCollapsed={isCollapsed} />
      </aside>

      {/* Mobile drawer -- same proven pattern as components/layout/MobileNav.tsx
          (fixed backdrop + slide-in panel), since DashboardSidebar is fully
          hidden below md and had no mobile equivalent before this. */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-brand-blue/30 backdrop-blur-md md:hidden animate-in fade-in-0 duration-300"
            onClick={closeMobileSidebar}
          />
          <div className="fixed inset-y-0 left-0 z-[70] w-full max-w-[300px] bg-white shadow-2xl flex flex-col md:hidden animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between border-b border-border/60 shrink-0 px-4">
              <Link href="/dashboard" onClick={closeMobileSidebar} className="flex items-center gap-2 overflow-hidden">
                <img src={siteConfig.logo.url} alt={siteConfig.logo.alt} className="h-10 w-auto" />
              </Link>
              <button
                onClick={closeMobileSidebar}
                className="p-2 -mr-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <SidebarNavContent
              links={sidebarLinks}
              role={role}
              pathname={pathname}
              isCollapsed={false}
              onLinkClick={closeMobileSidebar}
            />
          </div>
        </>
      )}
    </>
  );
}
