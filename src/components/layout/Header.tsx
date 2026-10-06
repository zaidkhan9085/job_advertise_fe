"use client";

import Link from "next/link";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Menu, ArrowRight, ChevronRight, LogOut } from "lucide-react";
import { toast } from "sonner";
import { mainNavItems, type NavItem, type NavDropdownItem } from "@/data/navigation";
import Logo from "@/components/common/Logo";
import { Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { buildMergedJobsUrl } from "@/lib/utils";
import { contactLinks } from "@/data/socialLinks";
import { getSocialLinks, type SocialLinks } from "@/lib/api";
import MobileNav from "./MobileNav";
import IndustryNavPanel from "./IndustryNavPanel";
import LocationNavPanel from "./LocationNavPanel";
import JobsOpeningNavPanel from "./JobsOpeningNavPanel";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import AndroidIcon from "@/components/icons/AndroidIcon";
import AppleIcon from "@/components/icons/AppleIcon";

// Same static-fallback-then-live-fetch pattern Footer.tsx already uses for
// these admin-editable links -- avoids a client-side fetch waterfall flash
// of nothing before the real values load, at the one-time cost of a flash
// of the static WhatsApp default before any admin-set app links appear.
const INITIAL_APP_LINKS = { whatsapp: contactLinks.whatsapp, androidApp: "", iosApp: "" };

// Phone-only quick-access row (WhatsApp, Android/iOS app) -- the client
// specifically asked for this to match the sister site's mobile header.
// Android/iOS have no real app yet, so until an admin sets a real Play
// Store/App Store link in Settings, clicking either tells the visitor
// it's coming rather than opening a dead/placeholder link; WhatsApp
// already has a real community link and always opens it.
function MobileAppLinks() {
  const [links, setLinks] = useState<Pick<SocialLinks, "whatsapp" | "androidApp" | "iosApp">>(INITIAL_APP_LINKS);

  useEffect(() => {
    getSocialLinks()
      .then(setLinks)
      .catch(() => {});
  }, []);

  const notifyComingSoon = (platform: string) => toast(`${platform} app coming soon`);

  return (
    <div className="flex md:hidden items-center gap-1.5">
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our WhatsApp"
        className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0"
      >
        <WhatsAppIcon className="w-4 h-4" />
      </a>
      {links.androidApp ? (
        <a
          href={links.androidApp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get the Android app"
          className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0"
        >
          <AndroidIcon className="w-4 h-4" />
        </a>
      ) : (
        <button
          type="button"
          onClick={() => notifyComingSoon("Android")}
          aria-label="Android app"
          className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0"
        >
          <AndroidIcon className="w-4 h-4" />
        </button>
      )}
      {links.iosApp ? (
        <a
          href={links.iosApp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get the iOS app"
          className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0"
        >
          <AppleIcon className="w-4 h-4" />
        </a>
      ) : (
        <button
          type="button"
          onClick={() => notifyComingSoon("iOS")}
          aria-label="iOS app"
          className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0"
        >
          <AppleIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Shared hover/click-outside trigger for a nav item whose panel is a
// bespoke, live-data component rather than a static NavDropdownItem tree
// (see IndustryNavPanel/LocationNavPanel/JobsOpeningNavPanel) -- same open
// behavior as NavItemComponent below, just rendering arbitrary children
// instead of a fixed link-tree shape.
function NavPanelTrigger({ label, children }: { label: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative pb-2 mb-[-8px]"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 lg:px-4 py-2 text-[15px] font-bold transition-all rounded-xl ${
          open ? "bg-brand-blue text-white shadow-lg shadow-[#1098F0]/20" : "text-foreground/70 hover:text-brand-blue hover:bg-brand-blue-muted"
        }`}
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && children(() => setOpen(false))}
    </div>
  );
}

function Submenu({ items, active }: { items: NavDropdownItem[], active: boolean }) {
  if (!active) return null;
  
  const isLong = items.length > 15;
  
  return (
    <div className={`absolute top-0 left-full ml-1 bg-white rounded-2xl shadow-[10px_10px_40px_rgba(16,152,240,0.1)] border border-border/40 p-2 z-[60] animate-in fade-in-0 slide-in-from-left-2 duration-200 max-h-[min(80vh,500px)] overflow-y-auto custom-scrollbar ${
      isLong ? 'w-[480px]' : 'w-64'
    }`}>
      <div className={`${isLong ? 'grid grid-cols-2 gap-x-1' : 'flex flex-col gap-0.5'}`}>
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:text-brand-blue hover:bg-brand-blue-muted rounded-xl transition-all group/sub shrink-0"
          >
            <span className="w-1 h-1 rounded-full bg-border group-hover/sub:bg-brand-blue transition-colors shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DropdownItem({ item }: { item: NavDropdownItem }) {
  const [hovered, setHovered] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <div 
      className="relative group/item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={item.href}
        className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
          hovered ? 'bg-brand-blue-muted text-brand-blue' : 'text-foreground/80'
        } ${hasSubItems ? 'font-bold' : ''} text-sm`}
      >
        <span className="flex items-center gap-2">
          {!hasSubItems && <span className={`w-1.5 h-1.5 rounded-full transition-all ${hovered ? 'bg-brand-blue scale-125' : 'bg-brand-blue/20'}`} />}
          {item.label}
        </span>
        {hasSubItems && <ChevronRight className={`w-4 h-4 transition-transform ${hovered ? 'translate-x-1' : 'opacity-40'}`} />}
      </Link>
      
      {hasSubItems && <Submenu items={item.subItems!} active={hovered} />}
    </div>
  );
}

function DropdownMenu({ items, label }: { items: NavDropdownItem[], label: string }) {
  const isIndustry = label === "Industry";
  
  return (
    <div className="absolute top-full left-0 pt-3 z-50"> {/* Bridge the gap with wrapper padding */}
      <div className={`bg-white rounded-2xl shadow-[0_20px_50px_rgba(16,152,240,0.15)] border border-border/40 p-2 animate-in fade-in-0 slide-in-from-top-2 duration-200 ${
        isIndustry ? 'w-[640px]' : 'w-72'
      }`}>
        <div className={`${isIndustry ? 'grid grid-cols-2 gap-x-2' : 'flex flex-col gap-0.5'}`}>
          {items.map((item) => (
            <DropdownItem key={item.label} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// useSearchParams() forces Next.js to bail out of static prerendering for
// any page that renders it unless it's isolated behind its own Suspense
// boundary -- kept as its own tiny component (rather than called directly
// in Header, which every page renders) so only this one link opts out of
// static rendering instead of the whole header.
function ShortTermLink() {
  const searchParams = useSearchParams();
  return (
    <Link
      href={buildMergedJobsUrl(searchParams, "jobtype", "Short Term")}
      className="px-2.5 lg:px-4 py-2 text-[15px] font-bold text-foreground/70 hover:text-brand-blue rounded-xl hover:bg-brand-blue-muted transition-all"
    >
      Short Term
    </Link>
  );
}

// Same link, styled to match the "More" panel's other items instead of the
// top-level nav bar -- used only inside that dropdown (md-to-lg gap).
function ShortTermMoreLink({ onNavigate }: { onNavigate: () => void }) {
  const searchParams = useSearchParams();
  return (
    <Link
      href={buildMergedJobsUrl(searchParams, "jobtype", "Short Term")}
      onClick={onNavigate}
      className="px-4 py-2.5 rounded-xl text-sm text-foreground/80 hover:bg-brand-blue-muted hover:text-brand-blue transition-all"
    >
      Short Term
    </Link>
  );
}

function NavItemComponent({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!item.dropdownItems) {
    return (
      <Link
        href={item.href}
        className="px-2.5 lg:px-4 py-2 text-[15px] font-bold text-foreground/70 hover:text-brand-blue rounded-xl hover:bg-brand-blue-muted transition-all"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative pb-2 mb-[-8px]" // Ensure hit area extends to dropdown
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 lg:px-4 py-2 text-[15px] font-bold transition-all rounded-xl ${
          open ? 'bg-brand-blue text-white shadow-lg shadow-[#1098F0]/20' : 'text-foreground/70 hover:text-brand-blue hover:bg-brand-blue-muted'
        }`}
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <DropdownMenu items={item.dropdownItems} label={item.label} />}
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Logged-in users already have an account — never show the guest
  // "Candidates Login" link, which used to send an authenticated user back
  // through the login form.
  const visibleNavItems = user ? mainNavItems.filter((item) => item.href !== "/login") : mainNavItems;

  // At 768px (md, tablet portrait) the full 6-item bar plus logo and CTA
  // measurably overflows the header (confirmed live: "Jobs Opening" wraps
  // to two lines and the CTA button gets clipped off the right edge) --
  // there just isn't room for all of it before `lg` (1024px). Rather than
  // give tablet the exact same full-screen hamburger overlay as a phone
  // (the bug this is fixing), keep the three richest items -- the ones with
  // real dropdown panels -- inline, and fold the remaining three into a
  // compact "More" menu that only exists in the md-to-lg gap; at `lg` and
  // up they go back to being flat top-level items like before.
  const PRIMARY_LABELS = ["Industry", "Location", "Jobs Opening"];
  const primaryNavItems = visibleNavItems.filter((item) => PRIMARY_LABELS.includes(item.label));
  const secondaryNavItems = visibleNavItems.filter((item) => !PRIMARY_LABELS.includes(item.label));

  function renderNavItem(item: NavItem) {
    if (item.label === "Industry") {
      return (
        <NavPanelTrigger key={item.label} label="Industry">
          {() => <IndustryNavPanel />}
        </NavPanelTrigger>
      );
    }
    if (item.label === "Location") {
      return (
        <NavPanelTrigger key={item.label} label="Location">
          {(close) => <LocationNavPanel onNavigate={close} />}
        </NavPanelTrigger>
      );
    }
    if (item.label === "Jobs Opening") {
      return (
        <NavPanelTrigger key={item.label} label="Jobs Opening">
          {() => <JobsOpeningNavPanel />}
        </NavPanelTrigger>
      );
    }
    if (item.label === "Short Term") {
      return (
        <Suspense
          key={item.label}
          fallback={
            <span className="px-2.5 lg:px-4 py-2 text-[15px] font-bold text-foreground/70">
              Short Term
            </span>
          }
        >
          <ShortTermLink />
        </Suspense>
      );
    }
    return <NavItemComponent key={item.label} item={item} />;
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-lg shadow-[0_8px_30px_rgb(16,152,240,0.06)] py-1.5" : "bg-white border-b border-border/40 py-3"
        }`}
      >
        <div className="container-site flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform shrink-0">
              <Logo size="lg" />
            </Link>

          <nav className="hidden md:flex items-center gap-0 xl:gap-0.5">
            {primaryNavItems.map(renderNavItem)}

            {/* xl+ (1280px+): full room, these render as flat top-level
                items exactly like before. `contents` makes this wrapper
                itself invisible to the flex layout -- its children become
                direct flex items of `nav`, not a nested box. At lg
                (1024-1279px) there still isn't enough room for all 6 items
                plus the CTA without wrapping labels onto two lines, so the
                fold now extends through the whole tablet-landscape range. */}
            <div className="hidden xl:contents">{secondaryNavItems.map(renderNavItem)}</div>

            {/* md through lg (768-1279px): not enough room for the full bar
                (see the comment above), so these three fold into one "More". */}
            {secondaryNavItems.length > 0 && (
              <div className="xl:hidden">
                <NavPanelTrigger label="More">
                  {(close) => (
                    <div className="absolute top-full left-0 pt-3 z-50">
                      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(16,152,240,0.15)] border border-border/40 p-2 w-56 flex flex-col gap-0.5 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                        {secondaryNavItems.map((item) =>
                          item.label === "Short Term" ? (
                            <Suspense key={item.label} fallback={null}>
                              <ShortTermMoreLink onNavigate={close} />
                            </Suspense>
                          ) : (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={close}
                              className="px-4 py-2.5 rounded-xl text-sm text-foreground/80 hover:bg-brand-blue-muted hover:text-brand-blue transition-all"
                            >
                              {item.label}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </NavPanelTrigger>
              </div>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2 xl:gap-4">
            {user ? (
              <>
                {/* A logged-in employer (or staff -- same "who can post"
                    rule DashboardHeader's own Post Job button already uses)
                    goes straight to the posting form instead of a generic
                    Dashboard link -- they already know what this site does,
                    no need to detour through the overview page. Candidates
                    keep the generic Dashboard link since posting isn't a
                    relevant action for them. */}
                <Link
                  href={user.role !== "candidate" ? "/dashboard/jobs/new" : "/dashboard"}
                  className="px-4 xl:px-6 py-2.5 text-sm font-black text-white bg-brand-blue hover:bg-brand-blue-medium rounded-xl transition-all shadow-lg shadow-[#1098F0]/20 active:scale-95 flex items-center gap-2 border border-white/10 whitespace-nowrap shrink-0"
                >
                  {user.role !== "candidate" ? "Post Jobs" : "Dashboard"}
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2.5 rounded-xl bg-secondary/50 hover:bg-brand-blue-muted text-foreground transition-colors shrink-0"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              // Signed-out visitors go straight to login instead of the
              // /post-job marketing page -- that page stays public and
              // reachable on its own (kept out of the SEO/first-time-visitor
              // discovery funnel this way), but someone who already clicked
              // a "Post Jobs" CTA has already decided to post and just needs
              // to sign in/register, not another pitch.
              <Link
                href="/login"
                className="px-4 xl:px-6 py-2.5 text-sm font-black text-white bg-brand-blue hover:bg-brand-blue-medium rounded-xl transition-all shadow-lg shadow-[#1098F0]/20 active:scale-95 flex items-center gap-2 border border-white/10 whitespace-nowrap shrink-0"
              >
                Post Jobs
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <MobileAppLinks />
            <button
              className="p-2.5 rounded-xl bg-secondary/50 hover:bg-brand-blue-muted text-foreground transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
