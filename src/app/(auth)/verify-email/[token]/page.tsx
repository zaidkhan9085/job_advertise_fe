"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyEmailRequest, resendVerificationRequest, ApiError } from "@/lib/api";

type Status = "checking" | "success" | "error";

// Mirrors /reset-password/[token]'s self-contained pattern -- the link
// itself does the work (a GET the moment this page loads), no form to
// submit, so the only states are "checking" / "success" / "error".
export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    verifyEmailRequest(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/login"), 2500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      });
    // Runs once for the token this page loaded with -- re-running on
    // `router` identity changes would re-fire the same GET for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setIsResending(true);
    setResendMessage(null);
    try {
      const result = await resendVerificationRequest(resendEmail);
      setResendMessage(result.message);
    } catch (err) {
      setResendMessage(err instanceof ApiError ? err.message : "Failed to resend the verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 overflow-hidden">
      <div className="p-8">
        {status === "checking" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verifying your email...</h1>
            <p className="text-sm text-muted-foreground">This will just take a moment.</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Email verified</h1>
            <p className="text-sm text-muted-foreground">Redirecting you to sign in...</p>
          </div>
        )}

        {status === "error" && (
          <>
            <div className="text-center py-4 mb-2">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Link didn&apos;t work</h1>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            <form onSubmit={handleResend} className="space-y-3 pt-2">
              <p className="text-sm font-semibold text-foreground text-center">Get a new link</p>
              <input
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm"
                required
              />
              <button
                type="submit"
                disabled={isResending}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-blue-medium py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-70"
              >
                {isResending ? "Sending..." : (
                  <>
                    Resend Verification Link <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {resendMessage && (
                <p className="text-sm text-center text-muted-foreground">{resendMessage}</p>
              )}
            </form>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-border/60 text-center">
          <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
