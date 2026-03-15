"use client";

import Link from "next/link";
import { Search, FileText, UserPlus, Users } from "lucide-react";

export default function HomeCTASection() {
  const ctas = [
    {
      label: "Browse Jobs",
      href: "/jobs",
      icon: Search,
      className: "bg-brand-blue text-white hover:bg-brand-blue-medium shadow-glow-blue",
    },
    {
      label: "Post Resume",
      href: "/resume",
      icon: FileText,
      className: "bg-white text-brand-blue border border-brand-blue/20 hover:bg-brand-blue-muted shadow-sm",
    },
    {
      label: "Post Jobs",
      href: "/post-job",
      icon: UserPlus,
      className: "bg-brand-blue text-white hover:bg-brand-blue-medium shadow-lg border border-white/10",
    },
    {
      label: "Join WhatsApp Group",
      href: "https://chat.whatsapp.com/E73OloAiRjv8ZZYQBNqEt5",
      icon: Users,
      className: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md",
      isExternal: true,
    },
  ];

  return (
    <section className="py-10 bg-brand-blue-muted/30">
      <div className="container-site">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ctas.map((cta) => {
            const Icon = cta.icon;
            const LinkComp = cta.isExternal ? "a" : Link;
            const props = cta.isExternal 
              ? { href: cta.href, target: "_blank", rel: "noopener noreferrer" } 
              : { href: cta.href };

            return (
              <LinkComp
                key={cta.label}
                {...props}
                className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] ${cta.className}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-[15px]">{cta.label}</span>
              </LinkComp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
