// The brand mark is icon image + coded text, not one flattened raster wordmark
// -- the source artwork (public/app_icon.jpeg) is a square icon+wordmark+
// tagline lockup that goes illegible if squeezed into the compact heights
// nav bars/sidebars render logos at. Rendering "thejobs4u" as real text also
// means it never needs a separate asset per size/weight, and lets the
// sidebar's collapsed state just omit the text instead of CSS-clipping a
// wide image (see DashboardSidebar.tsx).
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
  // "white" is for dark backgrounds (the footer's bg-brand-blue) -- a plain
  // CSS invert filter can't be used here like the old mono-navy logo did,
  // since it would also turn the orange white; logo-icon-white.png is a
  // real navy->white recolor that keeps the orange.
  variant?: "default" | "white";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", variant = "default", showText = true, className = "" }: LogoProps) {
  const iconSrc = variant === "white" ? "/logo-icon-white.png" : "/logo-icon.png";
  const textColorClass = variant === "white" ? "text-white" : "text-brand-blue";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src={iconSrc} alt="thejobs4u" className={`${ICON_HEIGHT[size]} w-auto shrink-0`} />
      {showText && (
        <span className={`font-black leading-none whitespace-nowrap ${TEXT_SIZE[size]} ${textColorClass}`}>
          thejobs<span className="text-brand-cyan">4u</span>
        </span>
      )}
    </span>
  );
}
