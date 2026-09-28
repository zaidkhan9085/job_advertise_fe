"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { inputClass } from "@/lib/ui";

// "bordered" matches Login/Register/Reset-Password's shared convention
// (relative wrapper + left Lock icon + border-input/bg-background input).
// "compact" matches the admin modals' convention (bg-secondary/30, no
// icon, same as every other field in those same modals) -- adding a Lock
// icon there would look inconsistent next to its sibling inputs.
const VARIANT_INPUT_CLASSES: Record<"bordered" | "compact", string> = {
  bordered: inputClass({ variant: "outline", withLeftIcon: true }, "pr-10"),
  compact: inputClass({ variant: "filled" }, "pr-10"),
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
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
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
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
