"use client";

import { Menu, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-border/60 px-4 md:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle (functionality can be wired later) */}
        <button className="md:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:block">
          <h2 className="text-lg font-bold text-foreground">Dashboard</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-foreground/70" />
          <span className="absolute top-2 right-2 flex w-2.5 h-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.68_0.21_45)] opacity-75"></span>
            <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-[oklch(0.68_0.21_45)] border-2 border-white"></span>
          </span>
        </button>
        
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
