"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, ArrowRight, ChevronRight } from "lucide-react";
import { mainNavItems, type NavItem, type NavDropdownItem } from "@/data/navigation";
import { siteConfig } from "@/data/branding";
import { Globe } from "lucide-react";
import MobileNav from "./MobileNav";

function Submenu({ items, active }: { items: NavDropdownItem[], active: boolean }) {
  if (!active) return null;
  
  return (
    <div className="absolute top-0 left-full ml-1 w-64 bg-white rounded-2xl shadow-[10px_10px_40px_rgba(30,58,138,0.1)] border border-border/40 p-2 z-[60] animate-in fade-in-0 slide-in-from-left-2 duration-200">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/70 hover:text-brand-blue hover:bg-brand-blue-muted rounded-xl transition-all group/sub"
        >
          <span className="w-1 h-1 rounded-full bg-border group-hover/sub:bg-brand-blue transition-colors" />
          {item.label}
        </Link>
      ))}
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
        } ${hasSubItems ? 'font-bold' : ''}`}
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
      <div className={`bg-white rounded-2xl shadow-[0_20px_50px_rgba(30,58,138,0.15)] border border-border/40 p-2 animate-in fade-in-0 slide-in-from-top-2 duration-200 ${
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
        className="px-4 py-2 text-[15px] font-bold text-foreground/70 hover:text-brand-blue rounded-xl hover:bg-brand-blue-muted transition-all"
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
        className={`flex items-center gap-1.5 px-4 py-2 text-[15px] font-bold transition-all rounded-xl ${
          open ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/20' : 'text-foreground/70 hover:text-brand-blue hover:bg-brand-blue-muted'
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-lg shadow-[0_8px_30px_rgb(30,58,138,0.06)] py-1.5" : "bg-white border-b border-border/40 py-3"
        }`}
      >
        <div className="container-site flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform shrink-0">
              <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-sm">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black text-brand-blue tracking-tighter">GULF</span>
                  <span className="text-xl font-black text-brand-blue-light tracking-tighter">JOBS</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue/40 mt-0.5">Advertise</span>
              </div>
            </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {mainNavItems.map((item) => (
              <NavItemComponent key={item.label} item={item} />
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-foreground/60 hover:text-brand-blue transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/post-job"
              className="px-6 py-2.5 text-sm font-black text-white bg-brand-blue hover:bg-brand-blue-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2 border border-white/10"
            >
              Post Jobs
            </Link>
          </div>

          <button
            className="lg:hidden p-2.5 rounded-xl bg-secondary/50 hover:bg-brand-blue-muted text-foreground transition-colors"
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
