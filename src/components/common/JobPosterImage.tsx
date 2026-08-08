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
}: {
  image: string | null;
  title: string;
  company: string;
  className?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolveImageUrl(image)}
        alt={`${title} at ${company}`}
        className={`object-cover ${className}`}
      />
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
