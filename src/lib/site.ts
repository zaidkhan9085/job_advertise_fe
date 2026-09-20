// Canonical public origin used to build links that leave the site (shared
// job links, pre-filled WhatsApp/email messages) and the og:url/canonical
// tags. Env-overridable, and defaults to localhost while developing so
// links produced on a dev machine actually open the local job.
//
// Production MUST be the host the site is really served from: the apex
// (thejobs4u.com) 308-redirects to www, and a page whose og:url points at a
// URL that redirects elsewhere makes WhatsApp/Facebook drop the whole
// preview (bare domain card, no title or thumbnail).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://www.thejobs4u.com")
).replace(/\/+$/, "");

// The domain as it should read in a "Ref By ..." line -- shown even when
// SITE_URL is localhost, since it's branding, not a link.
export const SITE_REF = "www.thejobs4u.com";
