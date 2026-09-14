// The brand mark is icon image + coded text, not one flattened raster wordmark
// -- the source artwork (the pin+briefcase icon) is meant to sit at a range
// of compact heights (nav bars, sidebars, favicon), and rendering "thejobs4u"
// as real text means it never needs a separate asset per size/weight, and
// lets the sidebar's collapsed state just omit the text instead of
// CSS-clipping a wide image (see DashboardSidebar.tsx).
const ICON_HEIGHT = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  xl: "h-14",
};

const TEXT_SIZE = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

export interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  // "white" is for dark backgrounds (the footer's bg-brand-blue) -- the icon
  // is a single flat navy color, so a plain CSS filter is enough to make it
  // read white there, same trick the site always used for its logo.
  variant?: "default" | "white";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", variant = "default", showText = true, className = "" }: LogoProps) {
  const textColorClass = variant === "white" ? "text-white" : "text-brand-blue";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/logo-icon.png"
        alt="thejobs4u"
        className={`${ICON_HEIGHT[size]} w-auto shrink-0 ${variant === "white" ? "brightness-0 invert" : ""}`}
      />
      {showText && (
        <span className={`font-black leading-none whitespace-nowrap ${TEXT_SIZE[size]} ${textColorClass}`}>
          thejobs4u
        </span>
      )}
    </span>
  );
}
