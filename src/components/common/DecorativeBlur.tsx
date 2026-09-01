// Every marketing page/section decorates its background with a large,
// absolutely-positioned, blurred circle -- previously each file hardcoded
// its own w-[Npx] h-[Npx] pair (500px, 600px, 96, 80...) with no responsive
// variant at all. Centralizing the size scale here means changing a size
// (or making it responsive) is a one-place edit instead of hunting down
// ~20 duplicated divs. Position and color are inherently page-specific, so
// those stay caller-supplied via `className` rather than baked into a rigid
// enum.
const SIZE_CLASSES = {
  sm: "w-40 h-40 sm:w-48 sm:h-48",
  md: "w-56 h-56 sm:w-64 sm:h-64",
  lg: "w-64 h-64 sm:w-80 sm:h-80",
  xl: "w-72 h-72 sm:w-96 sm:h-96",
  "2xl": "w-80 h-80 sm:w-[500px] sm:h-[500px]",
  "3xl": "w-96 h-96 sm:w-[600px] sm:h-[600px]",
} as const;

const BLUR_CLASSES = {
  xl: "blur-xl",
  "2xl": "blur-2xl",
  "3xl": "blur-3xl",
  strong: "blur-[120px]",
} as const;

export default function DecorativeBlur({
  size = "lg",
  blur = "3xl",
  className = "",
}: {
  size?: keyof typeof SIZE_CLASSES;
  blur?: keyof typeof BLUR_CLASSES;
  // Position (top-0 right-0, -translate-x-1/2...) and color/opacity
  // (bg-brand-blue/5, bg-white/10...) -- both inherently per-instance.
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full pointer-events-none ${SIZE_CLASSES[size]} ${BLUR_CLASSES[blur]} ${className}`}
    />
  );
}
