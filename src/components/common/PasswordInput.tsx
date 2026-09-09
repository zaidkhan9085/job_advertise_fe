"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

// "bordered" matches Login/Register/Reset-Password's shared convention
// (relative wrapper + left Lock icon + border-input/bg-background input).
// "compact" matches the admin modals' convention (bg-secondary/30, no
// icon, same as every other field in those same modals) -- adding a Lock
// icon there would look inconsistent next to its sibling inputs.
const VARIANT_INPUT_CLASSES: Record<"bordered" | "compact", string> = {
  bordered:
    "w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all",
  compact:
    "w-full px-4 py-3 pr-10 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm",
};

export default function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  required,
  minLength,
  variant = "bordered",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  variant?: "bordered" | "compact";
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {variant === "bordered" && (
        <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
      )}
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className={VARIANT_INPUT_CLASSES[variant]}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
