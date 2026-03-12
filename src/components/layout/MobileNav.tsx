"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X, ChevronDown, Briefcase } from "lucide-react";
import { mainNavItems, type NavItem } from "@/data/navigation";
import { siteConfig } from "@/data/branding";

function MobileNavSection({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);

  if (!item.dropdownItems) {
    const isExternal = item.href.startsWith("http");
    const LinkComponent = isExternal ? "a" : Link;
    const props = isExternal ? { href: item.href, target: "_blank", rel: "noopener noreferrer" } : { href: item.href };

    return (
      <LinkComponent
        {...props}
        className="block px-4 py-3 text-sm font-medium text-foreground border-b border-border/40 hover:bg-secondary transition-colors"
      >
        {item.label}
      </LinkComponent>
    );
  }

  return (
    <div className="border-b border-border/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        {item.label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="bg-secondary/50 pb-1">
          {item.dropdownItems.map((sub) => {
            const isExternal = sub.href.startsWith("http");
            const LinkComponent = isExternal ? "a" : Link;
            const props = isExternal ? { href: sub.href, target: "_blank", rel: "noopener noreferrer" } : { href: sub.href };

            return (
              <LinkComponent
                key={sub.href}
                {...props}
                className="block px-6 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
              >
                {sub.label}
              </LinkComponent>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  // Prevent body scroll when drawer is open
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/60">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <div className="w-16 rounded-lg flex items-center justify-center">
              <img src={siteConfig.logo.url} alt={siteConfig.logo.alt} />
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto">
          {mainNavItems.map((item) => (
            <MobileNavSection key={item.label} item={item} />
          ))}
        </nav>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-border/60 flex flex-col gap-2">
          <Link
            href="/login"
            onClick={onClose}
            className="w-full py-3 px-4 text-sm font-semibold text-center text-[oklch(0.47_0.20_250)] border-2 border-[oklch(0.47_0.20_250)] rounded-lg hover:bg-secondary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/post-job"
            onClick={onClose}
            className="w-full py-3 px-4 text-sm font-semibold text-center text-white bg-[oklch(0.68_0.21_45)] hover:bg-[oklch(0.55_0.22_45)] rounded-lg transition-colors"
          >
            Post Jobs
          </Link>
        </div>
      </div>
    </>
  );
}
