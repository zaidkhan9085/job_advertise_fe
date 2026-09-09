"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { resetPasswordRequest, ApiError } from "@/lib/api";
import PasswordInput from "@/components/common/PasswordInput";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await resetPasswordRequest(token, password);
      setIsDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 overflow-hidden">
      <div className="p-8">
        {isDone ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Password reset</h1>
            <p className="text-sm text-muted-foreground">Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Set a new password</h1>
              <p className="text-sm text-muted-foreground">
                Choose a new password for your account.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-800 text-sm p-3 rounded-lg border border-red-100 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">New Password</label>
                <PasswordInput value={password} onChange={setPassword} required minLength={6} />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-blue-medium py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-70 mt-2"
              >
                {isLoading ? "Resetting..." : (
                  <>
                    Reset Password <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
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
