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
}: {
  image: string | null;
  title: string;
  company: string;
  className?: string;
  // "cover" crops to fill — fine for small/square thumbnails. "contain"
  // guarantees the full poster is always visible (employer posters vary
  // wildly in aspect ratio, many are tall flyers that "cover" would crop
  // into) by letterboxing over a blurred copy of the same image instead of
  // leaving bare background.
  fit?: "cover" | "contain";
}) {
  if (image) {
    const src = resolveImageUrl(image);
    const alt = `${title} at ${company}`;

    if (fit === "contain") {
      return (
        <div className={`relative overflow-hidden ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="relative w-full h-full object-contain" />
        </div>
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
      className={`flex flex-col items-center justify-center gap-1 bg-brand-blue/5 text-brand-blue ${className}`}
    >
      <span className="text-2xl font-black">{initials(company) || initials(title)}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 text-center line-clamp-2">
        {title}
      </span>
    </div>
  );
}
