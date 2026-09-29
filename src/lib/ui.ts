import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Retrofit helpers, not components -- 263+ raw <button> and 114+ raw
// <input> already exist across ~90 hand-rolled files (icon-prefixed inputs,
// bespoke layouts) that a rigid shared component would fight rather than
// simplify. These let any existing element be retrofitted one at a time:
// swap a hardcoded className string for buttonClass({...})/inputClass({...})
// -- same density convention documented next to --radius-control in
// globals.css (default h-10/40px, compact h-9/36px, hero-cap h-11/44px).
// Pass extra classes as the second cn() argument at the call site; twMerge
// (inside cn) resolves any conflicting utility in the caller's favor.

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-control font-bold text-sm whitespace-nowrap transition-colors active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-brand-blue text-white hover:bg-brand-blue-medium",
        secondary: "bg-secondary text-foreground hover:bg-secondary/70",
        outline: "border border-border/60 bg-white text-foreground hover:bg-secondary/60",
        ghost: "text-foreground hover:bg-secondary/60",
        danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
      },
      size: {
        // Compact: dense admin tables, filter chips, secondary actions.
        compact: "h-9 px-3.5 text-[13px]",
        // Default: the size almost every button should be.
        default: "h-10 px-5",
        // Hero: homepage hero search, primary form submits ONLY -- never
        // go bigger than this anywhere in the app.
        hero: "h-11 px-6",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export type ButtonClassOptions = VariantProps<typeof buttonVariants>;

export function buttonClass(options: ButtonClassOptions = {}, className?: string) {
  return cn(buttonVariants(options), className);
}

const inputVariants = cva(
  "w-full rounded-control text-[13px] font-medium text-foreground outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-muted-foreground placeholder:font-normal",
  {
    variants: {
      variant: {
        // Bordered on a white/plain background -- forms, table search bars.
        outline: "border border-border/60 bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20",
        // Filled, border only appears on focus -- Post Job-style forms.
        filled: "bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white",
        // No border/background of its own -- sits inside an already-bordered
        // wrapper (e.g. the homepage hero search bar).
        borderless: "border-none bg-transparent",
      },
      size: {
        compact: "h-9 px-3",
        default: "h-10 px-3.5",
        hero: "h-11 px-4",
      },
      withLeftIcon: {
        true: "",
      },
    },
    compoundVariants: [
      { withLeftIcon: true, size: "compact", class: "pl-9" },
      { withLeftIcon: true, size: "default", class: "pl-10" },
      { withLeftIcon: true, size: "hero", class: "pl-11" },
    ],
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
);

export type InputClassOptions = VariantProps<typeof inputVariants>;

export function inputClass(options: InputClassOptions = {}, className?: string) {
  return cn(inputVariants(options), className);
}
