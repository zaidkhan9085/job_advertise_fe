import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, MapPin, Phone, ArrowRight, MessageCircle, Send } from "lucide-react";
import { socialLinks, contactLinks } from "@/data/socialLinks";
import { siteConfig } from "@/data/branding";
import { Globe } from "lucide-react";

const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Latest Jobs", href: "/jobs" },
      { label: "Nearby Jobs", href: "/jobs?type=nearby" },
      { label: "Job Alerts", href: "/dashboard/alerts" },
    ]
  },
  {
    title: "Employers",
    links: [
      { label: "Post a Job", href: "/post-job" },
      { label: "Search CV", href: "/dashboard/candidates" },
      { label: "Employer Dashboard", href: "/dashboard" },
      { label: "Pricing Plans", href: "/pricing" },
      { label: "Recruitment Solutions", href: "/solutions" },
    ]
  },
  {
    title: "For Candidates",
    links: [
      { label: "Post Resume", href: "/resume" },
      { label: "Career Guide", href: "/blog" },
      { label: "Salary Guide", href: "/salary-guide" },
      { label: "Mobile App", href: "/app" },
      { label: "Success Stories", href: "/case-studies" },
    ]
  },
  {
    title: "Legal & Support",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Legal Notice", href: "/legal/notice" },
      { label: "Disclaimer", href: "/legal/disclaimer" },
      { label: "FAQ / Help", href: "/help" },
    ]
  }
];

const iconMap: Record<string, React.FC<any>> = {
  Facebook,
  Twitter,
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube,
};

export default function Footer() {
  return (
    <footer className="bg-brand-blue text-white overflow-hidden selection:bg-brand-blue-light selection:text-white">
      {/* Community / WhatsApp Highlight Section */}
      <div className="bg-brand-blue-medium py-10 border-b border-white/5">
        <div className="container-site flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6 max-w-2xl">
            <div className="w-16 h-16 rounded-3xl bg-[#25D366] flex items-center justify-center shadow-2xl shadow-emerald-500/20 animate-bounce-slow">
              <MessageCircle className="w-8 h-8 text-white fill-white/20" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-black tracking-tight mb-1">Join our WhatsApp Community</h4>
              <p className="text-white/60 text-sm sm:text-base font-medium">Get instant job alerts and global recruitment updates directly on your mobile.</p>
            </div>
          </div>
          <a 
            href="https://chat.whatsapp.com/E73OloAiRjv8ZZYQBNqEt5"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-10 py-4 bg-[#25D366] hover:bg-white hover:text-[#25D366] text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/10 flex items-center gap-3 active:scale-95"
          >
            Join Group <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>
      </div>

      <div className="container-site pt-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12 items-start">
          {/* Brand & Info */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-blue shadow-xl transition-transform group-active:scale-95">
                <Globe className="w-7 h-7" />
              </div>
              <div className="flex flex-col leading-none text-white">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tighter">GULF</span>
                  <span className="text-2xl font-black text-brand-blue-light tracking-tighter">JOBS</span>
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 mt-1">Advertise</span>
              </div>
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
                <div className="flex items-center gap-3 text-brand-blue-light group cursor-pointer">
                  <Mail className="w-5 h-5" />
                  <span className="text-[15px] font-black tracking-tight text-white/90 group-hover:text-white transition-colors">support@thejobsadvertise.com</span>
                </div>
                <div className="flex items-center gap-3 text-white/40">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Mumbai — Global Recruitment HQ</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-12 bg-white/5" />

              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map(({ label, href }) => {
                  const Icon = iconMap[label];
                  if (!Icon) return null;
                  return (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-brand-blue-light hover:text-brand-blue text-white/80 flex items-center justify-center transition-all hover:-translate-y-2 border border-white/5 shadow-inner group"
                      title={label}
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Copyright & Legal */}
            <div className="flex flex-col items-center lg:items-end gap-4">
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-white/30 hover:text-brand-blue-light text-[10px] font-black uppercase tracking-widest transition-colors">Privacy</Link>
                <Link href="/terms" className="text-white/30 hover:text-brand-blue-light text-[10px] font-black uppercase tracking-widest transition-colors">Terms</Link>
                <Link href="/legal/disclaimer" className="text-white/30 hover:text-brand-blue-light text-[10px] font-black uppercase tracking-widest transition-colors">Safety</Link>
              </div>
              <p className="text-white/20 text-[10px] font-black tracking-[0.2em] uppercase">
                © {new Date().getFullYear()} GULF JOBS ADVERTISE — <span className="text-brand-blue-light italic">World's #1 Jobs Portal</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
