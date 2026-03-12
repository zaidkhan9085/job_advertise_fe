import Link from "next/link";
import { Briefcase, Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, MapPin } from "lucide-react";
import { socialLinks, contactLinks } from "@/data/socialLinks";
import { siteConfig } from "@/data/branding";

const footerLinks = {
  "Company": [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  "Legal": [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Disclaimer", href: "/legal/disclaimer" },
    { label: "Legal Notice", href: "/legal/notice" },
  ],
  "Quick Links": [
    { label: "Login / Register", href: "/login" },
    { label: "Post Your Resume", href: "/resume" },
    { label: "Listing Packages", href: "/pricing" },
  ]
};

const iconMap: Record<string, React.FC<any>> = {
  Facebook,
  Twitter,
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube,
};

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.12_0.02_260)] text-white/70">
      {/* Main footer */}
      <div className="container-site py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-3 pr-4">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-16 rounded-lg flex items-center justify-center bg-white p-1">
                <img src={siteConfig.logo.url} alt={siteConfig.logo.alt} />
              </div>
            </Link>
            
            <p className="text-sm leading-relaxed mb-4 max-w-sm">
              The Best Gulf Jobs Advertise platform for Indian job seekers looking to work in the Middle East. Explore verified job vacancies in UAE, Saudi Arabia, Qatar, Oman, Bahrain, and Kuwait.
            </p>
            
            <p className="text-sm leading-relaxed mb-6 max-w-sm">
              We connect skilled and unskilled workers from India with top Gulf employers across industries like construction, oil & gas, healthcare, and hospitality.
            </p>

            {/* Contact */}
            <div className="space-y-2 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[oklch(0.68_0.21_45)]" />
                <a href={contactLinks.email} className="hover:text-white transition-colors">
                  support@thejobsadvertise.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[oklch(0.68_0.21_45)]" />
                <span>Mumbai — Overseas Recruitment Operations</span>
              </div>
            </div>

            {/* Social */}
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
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[oklch(0.68_0.21_45)] flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold text-sm mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  const LinkComponent = isExternal ? "a" : Link;
                  const linkProps = isExternal ? { href: link.href, target: "_blank", rel: "noopener noreferrer" } : { href: link.href };
                  
                  return (
                    <li key={link.href}>
                      <LinkComponent
                        {...linkProps}
                        className="text-sm hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                      >
                        {link.label}
                      </LinkComponent>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col sm:flex-row items-center justify-between py-5 gap-3">
          <p className="text-xs text-white/40">
            © 2025 All Rights Reserved. The Jobs Advertise
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            <Link href="/legal/disclaimer" className="hover:text-white/70 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
