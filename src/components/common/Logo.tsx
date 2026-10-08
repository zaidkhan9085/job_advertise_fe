// The brand mark is icon image + coded text, not one flattened raster
// wordmark -- the icon is meant to sit at a range of compact heights (nav
// bars, sidebars, favicon), and rendering "TheJobs4U" as real text means it
// never needs a separate asset per size/weight, and lets the sidebar's
// collapsed state just omit the text instead of CSS-clipping a wide image
// (see DashboardSidebar.tsx).
// Icon shrunk relative to the wordmark per direct request -- it was sized
// to roughly match the text's line-height, which made the mark read as
// oversized next to "TheJobs4U" at every size step. TEXT_SIZE is untouched.
const ICON_HEIGHT = {
  sm: "h-6",
  md: "h-7",
  lg: "h-8",
  xl: "h-9",
};

const TEXT_SIZE = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

export interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  // "white" is for dark backgrounds (the footer's bg-brand-ink) -- the icon
  // is a single flat color, so a plain CSS filter is enough to make it read
  // white there, same trick the site always used for its logo.
  variant?: "default" | "white";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", variant = "default", showText = true, className = "" }: LogoProps) {
  // Matches the supplied artwork's wordmark, which is one continuous
  // Navy->Signal gradient left to right, not two flat colors -- on "white"
  // variant (dark backgrounds, e.g. the dashboard header/footer) it's a
  // plain solid white instead, same as the reversed lockup in the brand kit.
  const textClass =
    variant === "white"
      ? "text-white"
      : "bg-gradient-to-r from-brand-blue-dark to-brand-blue bg-clip-text text-transparent";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/logo-icon.png"
        alt="thejobs4u"
        className={`${ICON_HEIGHT[size]} w-auto shrink-0 ${variant === "white" ? "brightness-0 invert" : ""}`}
      />
      {showText && (
        <span className={`font-display font-black leading-none tracking-tight whitespace-nowrap ${TEXT_SIZE[size]} ${textClass}`}>
          TheJobs4U
        </span>
      )}
    </span>
  );
}
