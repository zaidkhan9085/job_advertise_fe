// The brand mark is icon image + coded text, not one flattened raster
// wordmark -- the icon is meant to sit at a range of compact heights (nav
// bars, sidebars, favicon), and rendering "TheJobs4U" as real text means it
// never needs a separate asset per size/weight, and lets the sidebar's
// collapsed state just omit the text instead of CSS-clipping a wide image
// (see DashboardSidebar.tsx).
// Stacked lockup (icon on top, wordmark below) per the client's reference
// mark, replacing the old side-by-side layout everywhere. Icon is kept
// visually the same size as the wordmark under it -- just ~2px taller, per
// direct client feedback that a noticeably bigger icon looked wrong -- same
// "equal size" rule the old side-by-side layout used.
const SIZES = {
  sm: { icon: "h-[18px]", text: "text-base", gap: "gap-0.5" },
  md: { icon: "h-5", text: "text-base", gap: "gap-0.5" },
  lg: { icon: "h-[25px]", text: "text-base", gap: "gap-1" },
  xl: { icon: "h-[26px]", text: "text-2xl", gap: "gap-1" },
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

export default function Logo({
  size = "md",
  variant = "default",
  showText = true,
  className = "",
}: LogoProps) {
  // Matches the supplied artwork's wordmark, which is one continuous
  // Navy->Signal gradient left to right, not two flat colors -- on "white"
  // variant (dark backgrounds, e.g. the dashboard header/footer) it's a
  // plain solid white instead, same as the reversed lockup in the brand kit.
  const textClass =
    variant === "white"
      ? "text-white"
      : "bg-gradient-to-r from-brand-blue-dark to-brand-blue bg-clip-text text-transparent";

  const { icon, text, gap } = SIZES[size];

  return (
    <span className={`inline-flex flex-col items-center ${gap} ${className}`}>
      <img
        src="/logo-icon.png"
        alt="thejobs4u"
        className={`${icon} w-auto shrink-0 ${variant === "white" ? "brightness-0 invert" : ""}`}
      />
      {showText && (
        <span
          className={`font-display font-black leading-none tracking-tight whitespace-nowrap ${text} ${textClass}`}
        >
          TheJobs4U
        </span>
      )}
    </span>
  );
}
