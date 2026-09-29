import { type SVGProps } from "react";

// Same Apple mark the sister site ("THE JOBS ADVERTISE") uses in its own
// AppStoreBadges.tsx -- lucide-react's "Apple" glyph is thin 2px line art
// that reads as a generic fruit rather than a recognizable brand mark, so
// this real solid silhouette replaces it (fill: currentColor, same
// inline-SVG approach as WhatsAppIcon.tsx).
export default function AppleIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
      <path d="M16.36 12.78c.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.7-3.19-1.72-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.87-.76-1.48.02-2.84.86-3.6 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.25 2.75 2.2 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.71.71 2.87.69 1.19-.02 1.94-1.08 2.66-2.14.84-1.23 1.19-2.42 1.2-2.48-.03-.01-2.3-.88-2.32-3.51zM14.2 6.2c.6-.74 1.01-1.76.9-2.78-.87.04-1.93.58-2.56 1.31-.56.65-1.05 1.7-.92 2.7.97.08 1.96-.49 2.58-1.23z" />
    </svg>
  );
}
