import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

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
  metadataBase: new URL("https://thejobs4u.com"),
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
