import Link from "next/link";
import Logo from "@/components/common/Logo";

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
          <Logo size="xl" />
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
        <p>© {new Date().getFullYear()} thejobs4u. All rights reserved.</p>
      </footer>
    </div>
  );
}
