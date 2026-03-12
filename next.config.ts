import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thejobsadvertise.com",
      },
    ],
  },
};


export default nextConfig;
