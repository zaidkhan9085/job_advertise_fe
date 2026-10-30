"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { mainNavItems, type NavItem, type NavDropdownItem } from "@/data/navigation";
import Logo from "@/components/common/Logo";
import { X, ChevronDown, ChevronRight, LifeBuoy, MapPin, Send, MessageCircle, Globe, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { slugify, buildMergedJobsUrl } from "@/lib/utils";
import { useJobsOpeningCounts } from "@/hooks/useJobsOpeningCounts";

function MobileNavSubSection({ item, depth = 0 }: { item: NavDropdownItem, depth?: number }) {
  const [open, setOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  if (!hasSubItems) {
    return (
      <Link
        href={item.href}
        className={`block py-3 text-[14px] transition-colors ${depth > 0 ? 'text-muted-foreground hover:text-brand-blue pl-6' : 'text-foreground/80 hover:text-brand-blue px-5'}`}
      >
        <span className="flex items-center gap-2">
          {depth > 0 && <span className="w-1 h-px bg-border" />}
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between py-3 text-[14px] font-bold transition-colors ${depth > 0 ? 'text-brand-blue pl-6 pr-5' : 'text-foreground px-5'}`}
      >
        <span className="flex items-center gap-2">
          {depth > 0 && <span className="w-1 h-px bg-brand-blue/30" />}
          {item.label}
        </span>
        <ChevronRight
          className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-90 text-brand-blue" : "text-muted-foreground/50"}`}
        />
      </button>
      {open && (
        <div className={`border-l ml-8 my-1 border-brand-blue/10 flex flex-col`}>
          {item.subItems!.map((sub) => (
            <MobileNavSubSection key={sub.label} item={sub} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Same live job-count-by-location data as desktop's JobsOpeningNavPanel
// (useJobsOpeningCounts), rendered as a plain inline list instead of an
// absolutely-positioned dropdown.
function MobileJobsOpeningSection({ onClose }: { onClose: () => void }) {
  const searchParams = useSearchParams();
  const rows = useJobsOpeningCounts();

  if (rows === null) {
    return (
      <div className="flex flex-col gap-1.5 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 rounded-lg bg-secondary/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="px-5 py-6 text-sm text-muted-foreground text-center">No open positions yet.</p>;
  }

  return (
    <div className="bg-secondary/10 py-2 max-h-[min(50vh,420px)] overflow-y-auto custom-scrollbar">
      {rows.map((row) => (
        <Link
          key={row.id}
          href={buildMergedJobsUrl(searchParams, "location", slugify(row.name))}
          onClick={onClose}
          className="flex items-center justify-between gap-3 px-5 py-2.5 text-[14px] text-foreground/80 hover:text-brand-blue hover:bg-brand-blue-muted transition-all"
        >
          <span className="truncate">{row.name}</span>
          <span className="shrink-0 text-xs font-black text-brand-blue tabular-nums">{row.count}</span>
        </Link>
      ))}
      <Link
        href="/jobs"
        onClick={onClose}
        className="block mt-1 px-5 py-2.5 text-sm font-bold text-brand-blue hover:bg-brand-blue-muted transition-all text-center border-t border-border/40 pt-3"
      >
        View all jobs
      </Link>
    </div>
  );
}

function MobileNavSection({ item, onClose }: { item: NavItem, onClose: () => void }) {
  const [open, setOpen] = useState(false);

  // Industry just scrolls to the homepage's live "Browse by Industry"
  // section -- a plain hash link, not a dropdown, since the full picker is
  // already right there on the page it jumps to.
  if (item.label === "Industry") {
    return (
      <Link
        href="/#industries"
        onClick={onClose}
        className="block px-5 py-4 text-[15px] font-black text-brand-blue border-b border-border/40 hover:bg-brand-blue-muted transition-colors uppercase tracking-tight"
      >
        {item.label}
      </Link>
    );
  }

  if (item.label === "Jobs Opening") {
    return (
      <div className="border-b border-border/40">
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-5 py-4 text-[15px] font-black transition-all uppercase tracking-tight ${open ? 'bg-brand-blue text-white' : 'text-brand-blue hover:bg-brand-blue-muted'}`}
        >
          {item.label}
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
        {open && <MobileJobsOpeningSection onClose={onClose} />}
      </div>
    );
  }

  if (!item.dropdownItems) {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className="block px-5 py-4 text-[15px] font-black text-brand-blue border-b border-border/40 hover:bg-brand-blue-muted transition-colors uppercase tracking-tight"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-border/40">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-4 text-[15px] font-black transition-all uppercase tracking-tight ${open ? 'bg-brand-blue text-white' : 'text-brand-blue hover:bg-brand-blue-muted'}`}
      >
        {item.label}
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="bg-secondary/10 py-3">
          {item.dropdownItems.map((sub) => (
            <MobileNavSubSection key={sub.label} item={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

// Same role-based destination MobileNav's own "Post Jobs" footer CTA
// already uses (guest -> /login, employer -> the real posting form) --
// /dashboard/jobs/new is where PosterScanPanel (the actual AI-scan feature)
// lives; /post-job is an unrelated public marketing page with no scan UI.
// A logged-in candidate has no company and isn't staff, so the real page
// would immediately bounce them with a toast + redirect -- sent to their
// own dashboard instead.
function aiPosterScanHref(user: { role: string } | null): string {
  if (!user) return "/login";
  if (user.role === "employer" || user.role === "admin" || user.role === "sub_admin") return "/dashboard/jobs/new";
  return "/dashboard";
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const { user, logout } = useAuth();
  // "Location" is dropped from the mobile menu entirely (desktop's own
  // Location nav panel is untouched) -- client's own call after seeing the
  // inline search-by-name version live.
  const visibleNavItems = mainNavItems.filter(
    (item) => item.label !== "Location" && (!user || item.href !== "/login")
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-brand-blue/30 backdrop-blur-md animate-in fade-in-0 duration-500"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-[340px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 cubic-bezier(0.4, 0, 0.2, 1)">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40 bg-white sticky top-0 z-10">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 active:scale-95 transition-transform shrink-0">
            <Logo size="lg" />
          </Link>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-secondary/50 hover:bg-brand-blue-muted text-brand-blue transition-all border border-border/20"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-2">
          <Link
            href={aiPosterScanHref(user)}
            onClick={onClose}
            className="mx-5 mt-1 mb-3 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-blue-light text-white shadow-lg shadow-[#1098F0]/20 active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black leading-tight">AI Poster Scan</p>
              <p className="text-[11px] text-white/80 leading-tight truncate">Upload a poster, auto-fill the job form</p>
            </div>
          </Link>

          {visibleNavItems.map((item) => (
            <MobileNavSection key={item.label} item={item} onClose={onClose} />
          ))}
          
          {/* Quick Support Card */}
          <div className="m-5 p-6 rounded-3xl bg-brand-blue-muted/30 border border-brand-blue/5">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue/50 mb-5">Support Center</h5>
            <div className="space-y-5">
              <Link
                href="/contact"
                onClick={onClose}
                className="flex items-center gap-4 text-sm font-bold text-brand-blue/80 hover:text-brand-blue transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-border/40">
                  <LifeBuoy className="w-5 h-5 text-brand-blue" />
                </div>
                Contact Support
              </Link>
              <div className="flex items-center gap-4 text-sm font-bold text-brand-blue/80">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-border/40">
                  <MapPin className="w-5 h-5 text-brand-blue-light" />
                </div>
                Global HQ (Mumbai)
              </div>
            </div>
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border/40 bg-white/80 backdrop-blur-lg">
          <div className="space-y-4">
            {user ? (
              <>
                {/* Same role rule as Header.tsx's desktop CTA and
                    DashboardHeader's own Post Job button -- an employer gets
                    both the primary posting-form shortcut AND a plain
                    Dashboard link (below, alongside Sign Out), not just one
                    replacing the other. Candidates and admin/sub_admin just
                    get the generic dashboard overview. */}
                {user.role === "employer" && (
                  <Link
                    href="/dashboard/jobs/new"
                    onClick={onClose}
                    className="flex items-center justify-center py-4 px-4 text-sm font-black text-white bg-brand-blue rounded-2xl shadow-xl shadow-[#1098F0]/20 active:scale-95 text-center border border-white/10"
                  >
                    Post Jobs
                  </Link>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className={
                      user.role === "employer"
                        ? "flex items-center justify-center py-4 px-4 text-sm font-black text-brand-blue bg-brand-blue-muted/50 rounded-2xl hover:bg-brand-blue-muted transition-all active:scale-95 text-center"
                        : "flex items-center justify-center py-4 px-4 text-sm font-black text-white bg-brand-blue rounded-2xl shadow-xl shadow-[#1098F0]/20 active:scale-95 text-center border border-white/10"
                    }
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); onClose(); }}
                    className="flex items-center justify-center gap-2 py-4 px-4 text-sm font-black text-brand-blue bg-brand-blue-muted/50 rounded-2xl hover:bg-brand-blue-muted transition-all active:scale-95"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center py-4 px-4 text-sm font-black text-brand-blue bg-brand-blue-muted/50 rounded-2xl hover:bg-brand-blue-muted transition-all active:scale-95"
                >
                  Sign In
                </Link>
                {/* Goes to login, not the /post-job marketing page -- same
                    reasoning as Header.tsx's desktop CTA: clicking "Post
                    Job" already signals intent, no need for another pitch.
                    /post-job itself stays public/reachable on its own. */}
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center py-4 px-4 text-sm font-black text-white bg-brand-blue rounded-2xl shadow-xl shadow-[#1098F0]/20 active:scale-95 text-center border border-white/10"
                >
                  Post Job
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Ops Online</span>
          </div>
        </div>
      </div>
    </>
  );
}
