"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Facebook, Linkedin, Instagram, Youtube, Mail, MapPin, ArrowRight, Briefcase } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { socialLinks as staticSocialLinks, contactLinks, SUPPORT_EMAIL } from "@/data/socialLinks";
import { SHORT_TERM_JOBS_HREF } from "@/data/navigation";
import { getSocialLinks, type SocialLinks } from "@/lib/api";
import Logo from "@/components/common/Logo";

// A client-side fetch (same pattern every other dynamic value on this site
// already uses, e.g. the /pricing page) rather than fetching inside the
// Server Component -- Footer sits in the shared marketing layout, so a
// server-side fetch runs during Vercel's static build for every single
// marketing page. That's exactly what broke a deploy: when the build
// couldn't reach the API quickly enough, each page's generation hung until
// Vercel's 60s-per-page timeout, and the whole build failed. A client fetch
// can never block a build, at the cost of a one-time flash from these
// static fallbacks (the same values src/data/socialLinks.ts already ships)
// to the admin-configured ones once they load.
//
// IMPORTANT: this file was previously reverted back to an async Server
// Component with a build-time fetch (see git history), which silently broke
// every single deploy since -- there is no local build failure to catch
// this, because the fetch only hangs specifically inside Vercel's build
// sandbox. Do not change this back without solving that constraint first.
const INITIAL_SOCIAL_LINKS: SocialLinks = {
  facebook: staticSocialLinks.find((s) => s.label === "Facebook")?.href ?? "",
  instagram: staticSocialLinks.find((s) => s.label === "Instagram")?.href ?? "",
  linkedin: staticSocialLinks.find((s) => s.label === "LinkedIn")?.href ?? "",
  youtube: staticSocialLinks.find((s) => s.label === "YouTube")?.href ?? "",
  whatsapp: contactLinks.whatsapp,
};

// Every href below is a real, working route -- the previous version linked
// to dashboard-only pages (Employer Dashboard, Search CV) that redirected a
// signed-out visitor somewhere confusing, and several pages that never
// existed at all (Job Alerts, Mobile App, Legal Notice, Disclaimer, FAQ).
// Legal & Trust's Refund/Disclaimer/Legal Notice pages are new; see their
// own files under src/app/(marketing)/.
const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Latest Jobs", href: "/jobs" },
      { label: "Post a Job", href: "/post-job" },
    ],
  },
  {
    title: "For Employers",
    links: [
      { label: "Post a Job", href: "/post-job" },
      { label: "Pricing Plans", href: "/pricing" },
      { label: "Recruitment Solutions", href: "/solutions" },
    ],
  },
  {
    title: "For Candidates",
    links: [
      { label: "Post Resume", href: "/resume" },
      { label: "Resume Builder", href: "/resume-builder" },
      { label: "Career Guide", href: "/blog" },
      { label: "Salary Guide", href: "/salary-guide" },
      { label: "Success Stories", href: "/case-studies" },
    ],
  },
  {
    title: "Legal & Trust",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Legal Notice", href: "/legal-notice" },
    ],
  },
];

// Brand-colored circular buttons per platform, same treatment the sister
// site's footer uses -- built from the admin-configurable links (see
// utils/socialLinks.js on the backend) rather than a hardcoded list, so an
// admin can change any of these any time without a code change.
function buildSocialIcons(links: SocialLinks) {
  return [
    { label: "Facebook", href: links.facebook, Icon: Facebook, bg: "bg-[#1877F2]", shadow: "shadow-[#1877F2]/30" },
    { label: "Instagram", href: links.instagram, Icon: Instagram, bg: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]", shadow: "shadow-[#ee2a7b]/30" },
    { label: "LinkedIn", href: links.linkedin, Icon: Linkedin, bg: "bg-[#0A66C2]", shadow: "shadow-[#0A66C2]/30" },
    { label: "YouTube", href: links.youtube, Icon: Youtube, bg: "bg-[#FF0000]", shadow: "shadow-[#FF0000]/30" },
    { label: "WhatsApp", href: links.whatsapp, Icon: WhatsAppIcon, bg: "bg-[#25D366]", shadow: "shadow-[#25D366]/30" },
  ].filter((s) => s.href);
}

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(INITIAL_SOCIAL_LINKS);

  useEffect(() => {
    getSocialLinks()
      .then(setSocialLinks)
      .catch(() => {}); // keep the static fallback if the API call fails
  }, []);

  const socialIcons = buildSocialIcons(socialLinks);

  return (
    <footer className="bg-brand-ink text-white overflow-hidden selection:bg-brand-blue-light selection:text-white">
      {/* Specialized Content Section */}
      <div className="bg-brand-blue-medium py-10 border-b border-white/5">
        <div className="container-site flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6 max-w-2xl">
            <div className="w-16 h-16 rounded-3xl bg-brand-blue-light/20 flex items-center justify-center shadow-2xl animate-bounce-slow">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-black tracking-tight mb-1">Explore Specialized Jobs</h4>
              <p className="text-white/60 text-sm sm:text-base font-medium">Find verified vacancies and high-priority short-term opportunities across the globe.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <Link
              href="/jobs"
              className="w-full sm:w-auto px-8 py-4 bg-white text-brand-blue font-black rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-center"
            >
              Browse Jobs
            </Link>
            <Link
              href={SHORT_TERM_JOBS_HREF}
              className="w-full sm:w-auto px-8 py-4 bg-brand-blue-light text-white font-black rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-center border border-white/10"
            >
              Short Term Jobs
            </Link>
          </div>
        </div>
      </div>

      <div className="container-site pt-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12 items-start">
          {/* Brand & Info */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <Logo size="xl" variant="white" />
            </Link>
            <p className="text-white/70 text-[15px] leading-relaxed max-w-sm font-medium">
              The premier platform for international career opportunities. We connect skilled professionals with verified employers across the Gulf, Europe, and Asia.
            </p>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-8">
                <h5 className="font-black text-[11px] uppercase tracking-[0.2em] text-white/40 border-l-2 border-brand-blue-light pl-3">{section.title}</h5>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-white/60 hover:text-white text-[14px] font-bold transition-all flex items-center gap-2 group"
                      >
                        <ArrowRight className="w-0 h-3 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all text-brand-blue-light" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Footer Strip */}
      <div className="border-t border-white/5 py-16 bg-black/10">
        <div className="container-site">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Contact & Location Info */}
            <div className="flex flex-col sm:flex-row items-center gap-10">
              <div className="flex flex-col items-center sm:items-start gap-2">
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 text-brand-blue-light group cursor-pointer">
                  <Mail className="w-5 h-5" />
                  <span className="text-[15px] font-black tracking-tight text-white/90 group-hover:text-white transition-colors">{SUPPORT_EMAIL}</span>
                </a>
                <div className="flex items-center gap-3 text-white/40">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Mumbai — Global Recruitment HQ</span>
                </div>
              </div>

              {socialIcons.length > 0 && (
                <>
                  <div className="hidden sm:block w-px h-12 bg-white/5" />
                  <div className="flex flex-wrap gap-3">
                    {socialIcons.map(({ label, href, Icon, bg, shadow }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:-translate-y-1 shadow-lg ${bg} ${shadow} group`}
                        title={label}
                      >
                        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Copyright & Legal */}
            <div className="flex flex-col items-center lg:items-end gap-4">
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-white/30 hover:text-brand-blue-light text-[10px] font-black uppercase tracking-widest transition-colors">Privacy</Link>
                <Link href="/terms" className="text-white/30 hover:text-brand-blue-light text-[10px] font-black uppercase tracking-widest transition-colors">Terms</Link>
                <Link href="/refund" className="text-white/30 hover:text-brand-blue-light text-[10px] font-black uppercase tracking-widest transition-colors">Refund</Link>
                <Link href="/disclaimer" className="text-white/30 hover:text-brand-blue-light text-[10px] font-black uppercase tracking-widest transition-colors">Disclaimer</Link>
              </div>
              <p className="text-white/20 text-[10px] font-black tracking-[0.2em] uppercase">
                © {new Date().getFullYear()} THEJOBS4U
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
