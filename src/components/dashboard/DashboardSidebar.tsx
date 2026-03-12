"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Briefcase, 
  LayoutDashboard, 
  Files, 
  Users, 
  Settings, 
  Building 
} from "lucide-react";

import { siteConfig } from "@/data/branding";

const sidebarLinks = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Manage Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Applications", href: "/dashboard/applications", icon: Users },
  { label: "Company Profile", href: "/dashboard/profile", icon: Building },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-border/60 hidden md:flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border/60 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src={siteConfig.logo.url} 
            alt={siteConfig.logo.alt} 
            className="h-10 w-auto"
          />
        </Link>
      </div>


      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-3">
          Recruiter Menu
        </div>
        
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-[oklch(0.47_0.20_250)]/10 text-[oklch(0.47_0.20_250)]" 
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[oklch(0.47_0.20_250)]" : "text-muted-foreground"}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/60 shrink-0">
        <div className="bg-secondary/50 rounded-xl p-4 border border-border/40">
          <p className="text-sm font-semibold mb-1">Need help?</p>
          <p className="text-xs text-muted-foreground mb-3">
            Contact our support team for assistance with your hiring.
          </p>
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center py-2 text-xs font-semibold bg-white border border-border rounded-lg shadow-sm hover:bg-secondary transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </aside>
  );
}
