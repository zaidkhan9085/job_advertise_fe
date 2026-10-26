import Link from "next/link";
import { Megaphone } from "lucide-react";

export interface AnnouncementContentProps {
  title: string;
  message: string;
  buttonText?: string | null;
  buttonLink?: string | null;
}

// Shared title/message/CTA layout -- used both by AnnouncementBell's dropdown
// (the real thing a signed-in user sees) and the admin compose form's live
// preview, so what the admin previews is pixel-identical to what ships.
export default function AnnouncementContent({ title, message, buttonText, buttonLink }: AnnouncementContentProps) {
  const cta = buttonText?.trim() && buttonLink?.trim() ? (
    buttonLink.startsWith("http") ? (
      <a
        href={buttonLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline mt-1.5"
      >
        {buttonText}
      </a>
    ) : (
      <Link href={buttonLink} className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline mt-1.5">
        {buttonText}
      </Link>
    )
  ) : null;

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-brand-blue-muted flex items-center justify-center shrink-0">
        <Megaphone className="w-4 h-4 text-brand-blue" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground break-words">{title || "Announcement title"}</p>
        <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap break-words">
          {message || "Your dashboard message will appear here."}
        </p>
        {cta}
      </div>
    </div>
  );
}
