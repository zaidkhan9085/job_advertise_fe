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

// Buttons round to a full pill, not --radius-control -- that token stays
// right for inputs (a modest, form-appropriate curve), but on a button
// it reads as almost-square next to the fully-round status pills/badges/
// icon buttons already used everywhere else (filter pills, table action
// icons, the search bar's own outer shape) -- confirmed live, repeatedly,
// across several separately-reported "square button" spots. One shared
// base class means every buttonClass() consumer gets this automatically.
const buttonVariants = cva(
  // "ui-button" carries no styles of its own -- it's a plain CSS hook
  // (globals.css) for the hover lift + shadow. Tailwind's own hover:/
  // active: utility variants for transform/box-shadow turned out not to
  // win the cascade reliably here (this project's custom CSS lives
  // outside any @layer, which beats Tailwind's layered utilities
  // regardless of specificity -- fine for overriding a utility directly,
  // but a hover:-translate-y-0.5 utility competing against another
  // same-layer utility like shadow-sm didn't resolve the way plain CSS
  // specificity would predict, confirmed by inspecting computed styles
  // live rather than assuming the classes "should" work). Hand-written
  // CSS sidesteps that entirely. bg-brand-blue's own hover/active
  // brightness shift (also globals.css) still layers on top for primary.
  "ui-button inline-flex items-center justify-center gap-2 rounded-full font-bold text-sm whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        // hover:bg-brand-blue-medium removed -- bg-brand-blue is a gradient
        // fill now (globals.css), so a flat hover background-color would
        // never actually show (background-image always paints over it);
        // the hover brightness shift there is this variant's real hover
        // feedback now.
        primary: "bg-brand-blue text-white shadow-sm",
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
