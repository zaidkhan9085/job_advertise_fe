"use client";

import { useState } from "react";
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
  // When set, the confirm button stays disabled until the admin types this
  // exact word -- an extra safety net for actions that can affect many
  // accounts from one click (bulk delete), on top of the warning message
  // itself. Every other caller leaves this unset and behaves exactly as
  // before.
  requireTypedConfirmation?: string;
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
  requireTypedConfirmation,
}: ConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState("");

  // Resets whenever the dialog (re)opens -- this component stays mounted
  // with isOpen toggling rather than unmounting, so state would otherwise
  // carry over from the last time it was used. Adjusted during render
  // (React's recommended pattern) instead of in an effect, to avoid an
  // extra cascading render on open.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setTypedValue("");
  }

  if (!isOpen) return null;

  const isConfirmDisabled = isConfirming || (!!requireTypedConfirmation && typedValue !== requireTypedConfirmation);

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
        {requireTypedConfirmation && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">
              Type <span className="font-mono text-foreground">{requireTypedConfirmation}</span> to confirm
            </label>
            <input
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
              autoFocus
            />
          </div>
        )}
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
            disabled={isConfirmDisabled}
            className={`flex-1 py-3 rounded-xl text-white font-bold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
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
