"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock submit
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to manage jobs and applications.
          </p>
        </div>

        {/* Mock Alert */}
        <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 mb-6 flex items-start gap-2">
          <span className="font-bold shrink-0">Note:</span>
          <span>Authentication is currently a mock. Any email/password will work and redirect to the dashboard.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
              <input 
                type="email" 
                placeholder="you@example.com"
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
                type="password" 
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                required
              />
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
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/register" className="font-semibold text-[oklch(0.47_0.20_250)] hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
