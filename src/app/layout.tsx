import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "The Jobs Advertise – Find Jobs in Gulf, India & Worldwide",
    template: "%s | The Jobs Advertise",
  },
  description:
    "The Jobs Advertise connects qualified professionals with top employers across Oil & Gas, Construction, IT, Healthcare and more. Find jobs in GCC, India, Europe, and beyond.",
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
  metadataBase: new URL("https://thejobsadvertise.com"),
  openGraph: {
    type: "website",
    siteName: "The Jobs Advertise",
    locale: "en_US",
  },
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
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
