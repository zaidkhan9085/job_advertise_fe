"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { resetCandidatePassword, ApiError } from "@/lib/api";
import PasswordInput from "@/components/common/PasswordInput";

// Shared between Admin > Employers (resetting an employer-owner's password)
// and Search Candidates (admin/sub_admin view) -- both are just User rows
// reached via the same endpoint, only the confirmation copy differs by
// which name/email is passed in.
export default function ResetPasswordModal({
  targetLabel,
  userId,
  onClose,
}: {
  targetLabel: string;
  userId: number;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsSaving(true);
    try {
      await resetCandidatePassword(userId, password);
      toast.success("Password updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Change Password</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">Set a new password for {targetLabel}.</p>
        <PasswordInput value={password} onChange={setPassword} placeholder="New password" variant="compact" />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-colors disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}
