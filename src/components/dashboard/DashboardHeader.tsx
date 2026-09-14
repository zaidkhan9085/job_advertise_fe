"use client";

import Link from "next/link";
import { Menu, Plus, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import Logo from "@/components/common/Logo";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const { openMobileSidebar } = useSidebar();

  return (
    <header className="h-16 bg-white border-b border-border/60 px-4 md:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={openMobileSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Always visible (unlike the sidebar, which is desktop-only unless
            the drawer above is opened) -- the one guaranteed way back to the
            public site from anywhere in the dashboard, on any device. */}
        <Link href="/" className="flex items-center gap-2" title="Back to the main site">
          <Logo size="sm" />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Posting a job is this software's primary function -- kept
            always visible here (every dashboard page, every role that can
            post) rather than tucked into a specific page's own button. */}
        {user && user.role !== "candidate" && (
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center gap-1.5 bg-button-gradient text-white hover:bg-brand-blue-medium px-3 sm:px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Post Job</span>
          </Link>
        )}

        <div className="w-px h-6 bg-border/60 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-sm">
            <span className="font-semibold leading-tight">{user?.fullName || "My Account"}</span>
            <span className="text-xs text-muted-foreground">{user?.displayRole}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
