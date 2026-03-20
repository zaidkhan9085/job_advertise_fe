"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mainNavItems, type NavItem, type NavDropdownItem } from "@/data/navigation";
import { siteConfig } from "@/data/branding";
import { X, ChevronDown, ChevronRight, Mail, MapPin, Send, MessageCircle, Globe } from "lucide-react";

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

function MobileNavSection({ item, onClose }: { item: NavItem, onClose: () => void }) {
  const [open, setOpen] = useState(false);

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

export default function MobileNav({ open, onClose }: MobileNavProps) {
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
            <img 
              src={siteConfig.logo.url} 
              alt={siteConfig.logo.alt} 
              className="h-12 w-auto"
            />
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
          {mainNavItems.map((item) => (
            <MobileNavSection key={item.label} item={item} onClose={onClose} />
          ))}
          
          {/* Quick Support Card */}
          <div className="m-5 p-6 rounded-3xl bg-brand-blue-muted/30 border border-brand-blue/5">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue/50 mb-5">Support Center</h5>
            <div className="space-y-5">
              <a href={`mailto:support@thejobsadvertise.com`} className="flex items-center gap-4 text-sm font-bold text-brand-blue/80 hover:text-brand-blue transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-border/40">
                  <Mail className="w-5 h-5 text-brand-blue" />
                </div>
                Email Support
              </a>
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
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center py-4 px-4 text-sm font-black text-brand-blue bg-brand-blue-muted/50 rounded-2xl hover:bg-brand-blue-muted transition-all active:scale-95"
            >
              Sign In
            </Link>
            <Link
              href="/post-job"
              onClick={onClose}
              className="flex items-center justify-center py-4 px-4 text-sm font-black text-white bg-brand-blue rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 text-center border border-white/10"
            >
              Post Job
            </Link>
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
