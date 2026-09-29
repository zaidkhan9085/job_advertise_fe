import { type SVGProps } from "react";

// Same Google Play mark the sister site ("THE JOBS ADVERTISE") uses in its
// own AppStoreBadges.tsx -- the real official 4-color Play Store triangle,
// not a generic phone/robot glyph, so it's recognizable as "get the Android
// app" the same way it is everywhere else. Unlike WhatsAppIcon/AppleIcon,
// each path below carries its own fixed brand color instead of
// currentColor -- that's how the source renders it too.
export default function AndroidIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <path fill="#00D4FF" d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.6 2.3z" />
      <path fill="#FFCE00" d="M16.1 15.6l-3.1-3.1v-.2l3.1-3.1.1.1 3.7 2.1c1 .6 1 1.6 0 2.2l-3.7 2.1-.1-.1z" />
      <path fill="#00F076" d="M16.2 15.5L13 12.4 3.6 21.7c.4.3 1 .4 1.6.1l11-6.3z" />
      <path fill="#FF3A44" d="M16.2 8.5l-11-6.3c-.6-.3-1.2-.3-1.6.1L13 11.6l3.2-3.1z" />
    </svg>
  );
}
