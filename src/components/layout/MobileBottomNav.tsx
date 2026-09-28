"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, FileText, Building2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Phone-only fixed tab bar, matching the sister site's mobile pattern
// (Home/Jobs/Resume/.../Profile) -- this app has no separate "Alerts"
// feature, so the two consumer-facing pages an app-store app would put
// there (Resume Builder, Companies) fill those slots instead. Profile
// routes to the dashboard once logged in, or the login page otherwise --
// same rule Header.tsx already uses for its own auth-aware links. Not
// shown on dashboard pages, which already have their own mobile drawer nav
// from the earlier responsive pass.
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = [
    { label: "Home", href: "/", Icon: Home, match: (p: string) => p === "/" },
    { label: "Jobs", href: "/jobs", Icon: Briefcase, match: (p: string) => p.startsWith("/jobs") },
    { label: "Resume", href: "/resume-builder", Icon: FileText, match: (p: string) => p.startsWith("/resume") },
    { label: "Companies", href: "/companies", Icon: Building2, match: (p: string) => p.startsWith("/companies") },
    {
      label: "Profile",
      href: user ? "/dashboard" : "/login",
      Icon: User,
      match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/login"),
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="grid grid-cols-5 h-14">
        {items.map(({ label, href, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
                active ? "text-brand-blue" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-brand-blue" : "text-muted-foreground"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
