"use client";

import { X, Loader2 } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// One reusable confirmation dialog for destructive/strict actions, replacing
// native confirm()/alert() calls across the admin pages. Configure via props
// rather than building a page-specific variant.
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{message}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="flex-1 py-3 rounded-xl border border-border/60 text-foreground font-bold hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className={`flex-1 py-3 rounded-xl text-white font-bold transition-colors disabled:opacity-70 inline-flex items-center justify-center gap-2 ${
              variant === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-brand-blue hover:bg-brand-blue/90"
            }`}
          >
            {isConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
