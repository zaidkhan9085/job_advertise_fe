import type { NextConfig } from "next";

// No images.remotePatterns needed -- next/image isn't used anywhere in this
// app (see JobPosterImage.tsx's comment: dynamic/user-uploaded images use a
// plain <img> on purpose, precisely to avoid needing this config for a host
// that varies per environment). The old thejobsadvertise.com entry here was
// dead configuration, not an active dependency.
const nextConfig: NextConfig = {};

export default nextConfig;
