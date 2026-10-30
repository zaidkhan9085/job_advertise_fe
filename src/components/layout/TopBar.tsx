"use client";

import Link from "next/link";
import { LifeBuoy, Facebook, Twitter, Linkedin, Instagram, Youtube, MessageCircle, Smartphone } from "lucide-react";
import { socialLinks, contactLinks } from "@/data/socialLinks";
import { authNavItems } from "@/data/navigation";

// Map social names to their respective icons
const iconMap: Record<string, React.FC<any>> = {
  Facebook,
  Twitter,
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube,
};

export default function TopBar() {
  return (
    <div className="hidden md:block bg-brand-ink text-white/80 text-sm">
      <div className="container-site flex items-center justify-between h-9">
        {/* Left: contact info */}
        <div className="flex items-center gap-5">
          <Link
            href="/contact"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            Contact Support
          </Link>
          <a
            href={contactLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Join WhatsApp
          </a>
          <a
            href={contactLinks.androidApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#3DDC84] transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Get Android App
          </a>
        </div>

        {/* Right: social icons + auth quick links */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href }) => {
              const Icon = iconMap[label];
              if (!Icon) return null;
              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hover:text-white transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
          <div className="w-px h-4 bg-white/20" />
          {/* Auth links removed as requested */}
        </div>
      </div>
    </div>
  );
}
