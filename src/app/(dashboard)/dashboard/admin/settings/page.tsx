"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ChangePasswordDialog from "@/components/common/ChangePasswordDialog";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your own account.</p>
      </div>

      {isChangePasswordOpen && <ChangePasswordDialog onClose={() => setIsChangePasswordOpen(false)} />}

      <div className="bg-white rounded-3xl border border-border/60 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-black text-foreground">{user?.fullName || user?.displayRole}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{user?.displayRole}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsChangePasswordOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border/60 bg-white text-sm font-bold text-foreground hover:bg-secondary/60 transition-colors"
        >
          <KeyRound className="w-4 h-4" /> Change Password
        </button>
      </div>
    </div>
  );
}
