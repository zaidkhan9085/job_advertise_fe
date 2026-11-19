"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff, MailCheck, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ApiError, resendVerificationRequest } from "@/lib/api";
import { buttonClass, inputClass } from "@/lib/ui";
import DecorativeBlur from "@/components/common/DecorativeBlur";

// A structured error body carries a `code` alongside the message -- used
// here to tell "wrong password" (a plain string is enough) apart from
// "you need to verify your email first" (which needs its own Resend button,
// not just a red error line).
function errorCode(err: unknown): string | undefined {
  return err instanceof ApiError && err.body && typeof err.body === "object" && "code" in err.body
    ? String((err.body as { code?: unknown }).code)
    : undefined;
}

// proxy.ts sends here with ?redirect=<original path> when it bounces an
// unauthenticated /dashboard/* request -- validated anyway so a malformed/
// foreign value can't be handed straight to the router. /resume-builder is
// also allowed -- it requires login too (see proxy.ts's matcher), and a
// signed-out visitor sent here from it should land back there, not on the
// generic dashboard.
function resolveRedirectTarget(searchParams: URLSearchParams): string {
  const redirect = searchParams.get("redirect");
  const isSafe = redirect === "/resume-builder" || (!!redirect && redirect.startsWith("/dashboard"));
  return isSafe ? redirect! : "/dashboard";
}

// Left-panel value props -- same "what makes this site trustworthy" ideas
// the homepage hero already leads with (SearchSection.tsx's TRUST_POINTS),
// just expanded with a line of copy each since there's room for it here.
// Desktop only (see the "hidden lg:flex" panel below) -- on mobile the page
// stays exactly the single centered form it always was.
const LOGIN_HIGHLIGHTS = [
  { icon: ShieldCheck, title: "Verified employers only", desc: "Every recruiter is checked before they can post a job." },
  { icon: Sparkles, title: "AI-powered resume tools", desc: "Build and polish your resume with built-in AI assistance." },
  { icon: CheckCircle2, title: "Track every application", desc: "See exactly where you stand with every job you've applied to." },
];

function LoginForm() {
  // A just-registered recruiter arrives via /login?verify=<their email> --
  // prefills the field so they don't have to retype it, and drives the
  // "check your inbox" banner below.
  const searchParams = useSearchParams();
  const justRegisteredEmail = searchParams.get("verify");

  const [email, setEmail] = useState(justRegisteredEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set only when the login attempt itself failed specifically because the
  // account isn't verified yet -- offers Resend instead of just an error line.
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { user, isLoading: authLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(resolveRedirectTarget(searchParams));
    }
  }, [authLoading, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push(resolveRedirectTarget(searchParams));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setNeedsVerification(errorCode(err) === "EMAIL_NOT_VERIFIED");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      const result = await resendVerificationRequest(email);
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to resend the verification email.");
    } finally {
      setIsResending(false);
    }
  };

  if (authLoading || user) {
    return null;
  }

  return (
    // max-w-[420px] below lg matches exactly what the shared (narrow) auth
    // layout gives every other auth page -- mobile/tablet renders this
    // identically to before. lg+ widens for the two-column split; the left
    // panel (hidden lg:flex below) only ever occupies that extra width, so
    // nothing about the form column itself changes size at any breakpoint.
    <div className="w-full max-w-[420px] lg:max-w-4xl mx-auto grid lg:grid-cols-2 bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 overflow-hidden">
      {/* Brand panel -- desktop only */}
      <div className="hidden lg:flex relative flex-col justify-center bg-hero-gradient text-white p-10 overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 right-0 bg-white/10 -translate-y-1/3 translate-x-1/4" />
        <DecorativeBlur size="xl" blur="strong" className="bottom-0 left-0 bg-brand-blue-light/20 translate-y-1/3 -translate-x-1/4" />
        <div className="relative">
          <h2 className="font-display text-3xl font-black tracking-tight mb-3 leading-tight">
            Find Verified India, Gulf &amp; Overseas Jobs Faster
          </h2>
          <p className="text-white/70 font-medium mb-8">
            Sign in to manage your jobs, applications and resume -- all in one place.
          </p>
          <div className="space-y-5">
            {LOGIN_HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="font-bold text-sm">{title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The sign-in form itself -- unchanged content/behavior, just no
          longer its own standalone bordered/shadowed card (the grid
          wrapper above owns that now, shared with the brand panel). */}
      <div className="p-8 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to manage jobs and applications.
          </p>
        </div>

        {!error && justRegisteredEmail && (
          <div className="flex items-start gap-2.5 bg-emerald-50 text-emerald-800 text-sm p-3 rounded-lg border border-emerald-100 mb-6">
            <MailCheck className="w-4.5 h-4.5 shrink-0 mt-px" />
            <span>
              We sent a verification link to <strong>{justRegisteredEmail}</strong>. Check your inbox and click it before signing in.
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-800 text-sm p-3 rounded-lg border border-red-100 mb-6">
            <p>{error}</p>
            {needsVerification && (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="mt-2 font-semibold underline hover:no-underline disabled:opacity-60"
              >
                {isResending ? "Resending..." : "Resend verification email"}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass({ variant: "outline", withLeftIcon: true })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-brand-blue hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass({ variant: "outline", withLeftIcon: true }, "pr-10")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={buttonClass({ variant: "primary", size: "hero", fullWidth: true }, "mt-2")}
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
          <Link href="/register" className="font-semibold text-brand-blue hover:underline">
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
