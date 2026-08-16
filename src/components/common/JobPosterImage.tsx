import { resolveImageUrl } from "@/lib/api";

function initials(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

// Job posters are dynamic/user-uploaded and served from the backend's own
// origin — plain <img> avoids configuring next/image remotePatterns for a
// host that varies per environment (matches the existing pattern used for
// the logo elsewhere in this app).
export default function JobPosterImage({
  image,
  title,
  company,
  className = "",
  fit = "cover",
  placeholderClassName,
}: {
  image: string | null;
  title: string;
  company: string;
  className?: string;
  // "cover" crops to fill a fixed-size box — fine for small/square
  // thumbnails. "natural" fills the full width and lets height follow the
  // image's own aspect ratio — no cropping, no letterbox bars, since the
  // box itself sizes to the image rather than the other way around. Capped
  // at a max height so a pathologically tall/narrow poster can't blow the
  // whole card out — past that cap it falls back to object-contain
  // (shrinks to fit, still uncropped, just no longer full-width). Requires
  // the caller's grid to not force items to a shared row height (e.g.
  // `items-start` on the grid container).
  fit?: "cover" | "natural";
  // Only used for the no-image placeholder in "natural" mode, since there's
  // no intrinsic image size to size the box from. Defaults to className.
  placeholderClassName?: string;
}) {
  if (image) {
    const src = resolveImageUrl(image);
    const alt = `${title} at ${company}`;

    if (fit === "natural") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={`w-full h-auto max-h-[420px] object-contain mx-auto ${className}`} />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`object-cover ${className}`} />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${title} at ${company}`}
      className={`flex flex-col items-center justify-center gap-1 bg-brand-blue/5 text-brand-blue ${
        fit === "natural" ? placeholderClassName ?? className : className
      }`}
    >
      <span className="text-2xl font-black">{initials(company) || initials(title)}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 text-center line-clamp-2">
        {title}
      </span>
    </div>
  );
}
