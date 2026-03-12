"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Briefcase, Menu } from "lucide-react";
import { mainNavItems, authNavItems, type NavItem, type NavDropdownItem } from "@/data/navigation";
import { siteConfig } from "@/data/branding";
import MobileNav from "./MobileNav";

function DropdownMenu({ items }: { items: NavDropdownItem[] }) {
  return (
    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.10)] border border-border/60 py-1.5 z-50 animate-in fade-in-0 slide-in-from-top-2 duration-150">
      {items.map((item) => {
        const isExternal = item.href.startsWith("http");
        const LinkComponent = isExternal ? "a" : Link;
        const props = isExternal ? { href: item.href, target: "_blank", rel: "noopener noreferrer" } : { href: item.href };
        
        return (
          <LinkComponent
            key={item.href}
            {...props}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/40 group-hover:bg-brand-orange transition-colors flex-shrink-0" />
            {item.label}
          </LinkComponent>
        );
      })}
    </div>
  );
}

function NavDropdownItem({ item }: { item: NavItem }) {
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
    const isExternal = item.href.startsWith("http");
    const LinkComponent = isExternal ? "a" : Link;
    const props = isExternal ? { href: item.href, target: "_blank", rel: "noopener noreferrer" } : { href: item.href };

    return (
      <LinkComponent
        {...props}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
      >
        {item.label}
      </LinkComponent>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <DropdownMenu items={item.dropdownItems} />}
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-white transition-shadow duration-200 ${
          scrolled ? "shadow-[0_2px_12px_rgb(0,0,0,0.08)]" : "border-b border-border/60"
        }`}
      >
        <div className="container-site flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-16 rounded-lg flex items-center justify-center">
                <img src={siteConfig.logo.url} alt={siteConfig.logo.alt} />
              </div>   
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => (
              <NavDropdownItem key={item.label} item={item} />
            ))}
          </nav>

          {/* Auth actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[oklch(0.47_0.20_250)] hover:bg-secondary rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/post-job"
              className="px-4 py-2 text-sm font-semibold text-white bg-[oklch(0.68_0.21_45)] hover:bg-[oklch(0.55_0.22_45)] rounded-lg transition-colors shadow-sm"
            >
              Post Jobs
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
