import Link from "next/link";
import type { LucideIcon } from "lucide-react";

// Consolidates the icon-badge stat-tile style already proven across the old
// per-role Overview page (Admin/Recruiter/Candidate). When `href` is given,
// the whole card is a link with a hover highlight so it reads as clickable --
// search-candidates/page.tsx has its own separate, simpler StatCard; this one
// is specifically for the dashboard Overview grid.
export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-3xl font-bold text-foreground mt-2">{value}</h3>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );

  const className =
    "bg-white rounded-2xl p-5 border border-border/60 shadow-sm transition-all" +
    (href ? " hover:border-brand-blue/40 hover:shadow-md cursor-pointer" : "");

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
