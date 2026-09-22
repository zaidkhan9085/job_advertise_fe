"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Plus, User, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import Logo from "@/components/common/Logo";
import { getMyCompany, getMyCandidateProfile, getMe, resolveImageUrl } from "@/lib/api";

// Where clicking the avatar goes -- each role's own "edit yourself" page.
// Admin/sub_admin have no such page yet, so their avatar isn't a link.
const PROFILE_HREF: Partial<Record<string, string>> = {
  candidate: "/dashboard/my-profile",
  employer: "/dashboard/profile",
};

function initialsOf(name: string | null) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const { openMobileSidebar } = useSidebar();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // `user.fullName` only ever comes from the JWT payload set at login time
  // (see AuthContext) -- it decodes back to null on every page refresh, since
  // the token itself never carried a name. Re-fetching it here means the
  // header (and this new initials fallback) still shows a real name after a
  // refresh, not just right after signing in.
  const [fullName, setFullName] = useState<string | null>(null);
  // An employer identifies by their COMPANY name here, not their own
  // personal account name (often just a placeholder typed at signup, e.g.
  // "ggg") -- renaming the company on the profile page should be reflected
  // here too.
  const [companyName, setCompanyName] = useState<string | null>(null);

  // The photo lives on a different record per role (a candidate's own
  // profile picture vs. an employer's company logo) -- the JWT-derived
  // `user` object carries neither, so this is a small extra fetch, same
  // pattern the profile pages themselves already use to load their own data.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting when the session changes, not derived state
    setAvatarUrl(null);
    setFullName(null);
    setCompanyName(null);
    if (!user) return;

    getMe()
      .then((me) => setFullName(me.full_name))
      .catch(() => {});

    if (user.role === "candidate") {
      getMyCandidateProfile()
        .then((p) => setAvatarUrl(p?.profileImage ? resolveImageUrl(p.profileImage) : null))
        .catch(() => {});
    } else if (user.role === "employer") {
      getMyCompany()
        .then((c) => {
          setAvatarUrl(c?.logo ? resolveImageUrl(c.logo) : null);
          setCompanyName(c?.name ?? null);
        })
        .catch(() => {});
    }
  }, [user]);

  const displayName = companyName || fullName || user?.fullName || "My Account";
  const initials = initialsOf(companyName ?? fullName ?? user?.fullName ?? null);
  const profileHref = user ? PROFILE_HREF[user.role] : undefined;

  const avatar = (
    <div
      className={`w-9 h-9 rounded-full bg-secondary border border-border/60 flex items-center justify-center overflow-hidden shrink-0 ${
        profileHref ? "hover:ring-2 hover:ring-brand-blue/30 transition-all" : ""
      }`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
      ) : initials ? (
        <span className="text-xs font-black text-muted-foreground">{initials}</span>
      ) : (
        <User className="w-5 h-5 text-muted-foreground" />
      )}
    </div>
  );

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
            className="relative inline-flex items-center gap-1.5 bg-brand-blue text-white hover:bg-brand-blue-medium px-3 sm:px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Post Job</span>
            {/* Flags the new AI poster-scan option to recruiters who haven't
                noticed it yet -- corner-positioned so it works the same
                whether the button shows the icon alone (mobile) or the full
                label (desktop). */}
            <span className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 bg-white text-brand-blue text-[9px] font-black leading-none px-1.5 py-0.5 rounded-full shadow-sm ring-1 ring-brand-blue/10">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          </Link>
        )}

        <div className="w-px h-6 bg-border/60 hidden sm:block" />

        <div className="flex items-center gap-3">
          {profileHref ? (
            <Link href={profileHref} className="hidden sm:flex flex-col items-end text-sm" title="View your profile">
              <span className="font-semibold leading-tight">{displayName}</span>
              <span className="text-xs text-muted-foreground">{user?.displayRole}</span>
            </Link>
          ) : (
            <div className="hidden sm:flex flex-col items-end text-sm">
              <span className="font-semibold leading-tight">{displayName}</span>
              <span className="text-xs text-muted-foreground">{user?.displayRole}</span>
            </div>
          )}
          {profileHref ? (
            <Link href={profileHref} title="View your profile">
              {avatar}
            </Link>
          ) : (
            avatar
          )}
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
