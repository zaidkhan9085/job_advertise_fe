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
// the logo elsewhere in this app). Always crops to fill a fixed-size box
// (set via `className`, e.g. an aspect-ratio wrapper) — confirmed as the
// deliberate choice over letterboxing/natural sizing so every card in a
// grid lines up at the same height, matching Naukri/Indeed/LinkedIn
// convention. object-cover centers by default, so the middle of a poster
// (where the key text usually sits) survives the crop.
export default function JobPosterImage({
  image,
  title,
  company,
  className = "",
}: {
  image: string | null;
  title: string;
  company: string;
  className?: string;
}) {
  if (image) {
    const src = resolveImageUrl(image);
    const alt = `${title} at ${company}`;

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
