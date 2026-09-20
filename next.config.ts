import type { NextConfig } from "next";

// No images.remotePatterns needed -- next/image isn't used anywhere in this
// app (see JobPosterImage.tsx's comment: dynamic/user-uploaded images use a
// plain <img> on purpose, precisely to avoid needing this config for a host
// that varies per environment). The old thejobsadvertise.com entry here was
// dead configuration, not an active dependency.
const nextConfig: NextConfig = {
  // Job pages build their Open Graph tags in generateMetadata (a data
  // fetch), and Next.js only writes that metadata into <head> for user
  // agents on its built-in bot list -- everyone else gets it streamed into
  // the <body> ~65KB down the page. Chat apps' link-preview fetchers (the
  // WhatsApp app on a phone, unknown/rebranded crawlers) often identify as
  // an ordinary browser and only read <head>, so they saw no tags and drew a
  // bare "domain + URL" card. Matching every user agent makes the tags
  // always land in <head>; the fetch is cached and time-limited (see
  // jobs/[id]/layout.tsx), so the wait is negligible.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
