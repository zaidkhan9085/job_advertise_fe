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
//
// Uses object-contain, not object-cover -- an AI poster-scan upload is a
// dense, text-heavy flyer (salary tables, contact details right up to the
// edges), not a plain company logo, so center-cropping it to fill a fixed
// box was cutting off real readable content (confirmed directly: role
// names and figures sliced off on both sides in card thumbnails). Every
// current call site's wrapping box already has a background color, so the
// letterboxed space around a non-matching aspect ratio reads as intentional
// padding rather than an empty gap.
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
      <img src={src} alt={alt} className={`object-contain ${className}`} />
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
