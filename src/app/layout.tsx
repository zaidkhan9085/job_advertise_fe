import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: "thejobs4u – Find Jobs in Gulf, India & Worldwide",
    template: "%s | thejobs4u",
  },
  description:
    "thejobs4u connects qualified professionals with top employers across Oil & Gas, Construction, IT, Healthcare and more. Find jobs in GCC, India, Europe, and beyond.",
  keywords: [
    "gulf jobs",
    "oil gas jobs",
    "construction jobs",
    "jobs in UAE",
    "jobs in Saudi Arabia",
    "engineering jobs",
    "recruitment India",
    "international jobs",
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "thejobs4u",
    locale: "en_US",
  },
  icons: {
    icon: "/favicon-pin.png",
    shortcut: "/favicon-pin.png",
    apple: "/favicon-pin.png",
  },
};

// Was missing entirely -- without it, mobile browsers render at a desktop-
// width viewport (~980px) and scale the page down, which is a real cause of
// "everything looks off on mobile," not just a styling issue. Zoom is left
// enabled on purpose (no userScalable/maximumScale) -- denser controls were
// asked for, disabling pinch-zoom on a job-listing site was not, and it's a
// real accessibility regression nobody requested. themeColor matches the
// brand's dominant coral so the Android status bar is on-brand once this is
// wrapped in a Capacitor WebView.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C8422C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
