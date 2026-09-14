"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

// proxy.ts sends here with ?redirect=<original path> when it bounces an
// unauthenticated /dashboard/* request -- only ever a same-app dashboard
// path, but validated anyway so a malformed/foreign value can't be handed
// straight to the router.
function resolveRedirectTarget(searchParams: URLSearchParams): string {
  const redirect = searchParams.get("redirect");
  return redirect && redirect.startsWith("/dashboard") ? redirect : "/dashboard";
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(resolveRedirectTarget(searchParams));
    }
  }, [authLoading, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push(resolveRedirectTarget(searchParams));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || user) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to manage jobs and applications.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-sm p-3 rounded-lg border border-red-100 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-[oklch(0.47_0.20_250)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3 text-muted-foreground/60 hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-blue-medium py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-70 mt-2"
          >
            {isLoading ? "Signing in..." : (
              <>
                Sign In <ArrowRight className="w-4 h-4 hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/register" className="font-semibold text-[oklch(0.47_0.20_250)] hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
