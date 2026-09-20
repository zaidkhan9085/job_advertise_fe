// Canonical public origin used to build links that leave the site (shared
// job links, pre-filled WhatsApp/email messages). Env-overridable, and
// defaults to localhost while developing so links produced on a dev machine
// actually open the local job instead of a 404 on the live site.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://thejobs4u.com")
).replace(/\/+$/, "");

// The domain as it should read in a "Ref By ..." line -- shown even when
// SITE_URL is localhost, since it's branding, not a link.
export const SITE_REF = "www.thejobs4u.com";
