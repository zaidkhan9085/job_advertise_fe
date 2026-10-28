import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /dashboard/* is this app's private area (candidate/employer/admin), not
// /admin or /employer like the sister site -- matches this app's own
// routing convention.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/dashboard/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
