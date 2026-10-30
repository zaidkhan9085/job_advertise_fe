// LinkedIn/YouTube (and Instagram's "jobs_advertise" handle) still point at
// the old brand's external social accounts on purpose -- these are actual
// third-party account handles this repo doesn't control, and pointing them
// at "thejobs4u" would break the links entirely unless those accounts are
// actually renamed first. Update once confirmed renamed on each platform.
export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/share/18RHi2hfFk/?mibextid=wwXIfr" },
  { label: "Instagram", href: "https://www.instagram.com/jobs_advertise/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/thejobsadvertise/?viewAsMember=true" },
  { label: "YouTube", href: "https://www.youtube.com/@thejobsadvertise" },
];

// The site's own support@ email/mailto was removed site-wide in favor of
// the in-app Support inbox (see /contact and /dashboard/admin/support) --
// this doesn't touch the backend's transactional-mail sender address
// (utils/sendEmail.js), which is a separate, still-needed concern.
export const contactLinks = {
  whatsapp: "https://chat.whatsapp.com/HGSAQokMgiqBEZJL5S67LD",
  androidApp: "https://play.google.com/store/apps/details?id=co.median.android.lpmaorp",
};
