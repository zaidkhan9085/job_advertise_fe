// LinkedIn/YouTube (and Instagram's "jobs_advertise" handle) still point at
// the old brand's external social accounts on purpose -- unlike the email/
// domain below, these are actual third-party account handles this repo
// doesn't control, and pointing them at "thejobs4u" would break the links
// entirely unless those accounts are actually renamed first. Update once
// confirmed renamed on each platform.
export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/share/18RHi2hfFk/?mibextid=wwXIfr" },
  { label: "Instagram", href: "https://www.instagram.com/jobs_advertise/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/thejobsadvertise/?viewAsMember=true" },
  { label: "YouTube", href: "https://www.youtube.com/@thejobsadvertise" },
];

// The one address used for every job-support / contact / outgoing-mail
// reference on the site (the backend mailer sends from it too).
export const SUPPORT_EMAIL = "support@thejobsadvertise.com";

export const contactLinks = {
  email: `mailto:${SUPPORT_EMAIL}`,
  whatsappChannel: "https://whatsapp.com/channel/0029VaAXD6dL7UVQmJNt5X0E",
  whatsappGroup: "https://chat.whatsapp.com/HGSAQokMgiqBEZJL5S67LD",
  androidApp: "https://play.google.com/store/apps/details?id=co.median.android.lpmaorp",
};
