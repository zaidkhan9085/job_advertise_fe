"use client";

import Link from "next/link";
import { Search, FileText, UserPlus, Briefcase } from "lucide-react";

export default function HomeCTASection() {
  const ctas = [
    {
      label: "Browse Jobs",
      href: "/jobs",
      icon: Search,
      className: "bg-brand-blue text-white hover:bg-brand-blue-medium",
    },
    {
      label: "Post Resume",
      href: "/resume",
      icon: FileText,
      className: "bg-brand-blue text-white hover:bg-brand-blue-medium",
    },
    {
      label: "Post Jobs",
      href: "/post-job",
      icon: UserPlus,
      className: "bg-brand-blue text-white hover:bg-brand-blue-medium",
    },
    {
      label: "Recruitment Jobs",
      href: "/jobs?type=free-recruitment",
      icon: Briefcase,
      className: "bg-brand-blue text-white hover:bg-brand-blue-medium",
    },
    {
      label: "Shutdown Jobs",
      href: "/jobs?type=shutdown",
      icon: Briefcase,
      className: "bg-brand-blue text-white hover:bg-brand-blue-medium",
    },
  ];

  return (
    <section className="py-10 bg-brand-blue-muted/30">
      <div className="container-site">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ctas.map((cta) => {
            const Icon = cta.icon;
            
            return (
              <Link
                key={cta.label}
                href={cta.href}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] ${cta.className} whitespace-nowrap`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[13px] md:text-sm">{cta.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
