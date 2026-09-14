"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { changePassword, ApiError } from "@/lib/api";

const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

interface FieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

function PasswordField({
  label,
  value,
  onChange,
  error,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm font-medium ${
            error ? "border-rose-300 focus:border-rose-400" : "border-border/60 focus:border-brand-blue"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

export default function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Same body-scroll-lock pattern as ApplyDialog/MobileNav -- otherwise the
  // page behind this fixed-position overlay keeps scrolling with it.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!currentPassword) {
      next.currentPassword = "Current password is required.";
    }
    if (!newPassword) {
      next.newPassword = "New password is required.";
    } else if (!PASSWORD_POLICY.test(newPassword)) {
      next.newPassword = "Must be at least 8 characters and include both letters and numbers.";
    } else if (currentPassword && newPassword === currentPassword) {
      next.newPassword = "New password must be different from your current password.";
    }
    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your new password.";
    } else if (newPassword && confirmPassword !== newPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      toast.success(result.message);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.message === "Current password is incorrect") {
        setErrors({ currentPassword: err.message });
      } else if (err instanceof ApiError && /different from your current/.test(err.message)) {
        setErrors({ newPassword: err.message });
      } else {
        toast.error(err instanceof ApiError ? err.message : "Failed to change password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border/60">
          <div>
            <h2 className="font-black text-lg text-foreground">Change Password</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Choose a strong password you don&apos;t use elsewhere.</p>
          </div>
          <button onClick={onClose} className="p-1.5 -m-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            error={errors.currentPassword}
            autoFocus
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            error={errors.newPassword}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl border border-border/60 text-foreground font-bold hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-blue/90 py-3 rounded-xl font-bold transition-colors disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
