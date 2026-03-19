import Link from "next/link";
import { siteConfig } from "@/data/branding";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Simple Auth Header */}
      <header className="h-20 flex items-center justify-center border-b border-border/60 bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-48 flex items-center justify-center py-4">
            <img src={siteConfig.logo.url} alt={siteConfig.logo.alt} className="w-full h-auto object-contain" />
          </div>
        </Link>
      </header>
      
      {/* Main Content Centered */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </main>

      {/* Simple Auth Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 The Jobs Advertise. All rights reserved.</p>
      </footer>
    </div>
  );
}
