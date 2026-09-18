import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-orange text-white shadow-sm hover:bg-orange-dark hover:shadow-md disabled:bg-orange-tint disabled:shadow-none",
  secondary:
    "bg-charcoal text-white hover:bg-charcoal-soft disabled:opacity-50",
  ghost:
    "bg-transparent text-ink border border-border hover:bg-white disabled:opacity-50",
  outline:
    "bg-transparent text-charcoal border border-gold hover:bg-gold hover:text-white disabled:opacity-50",
  danger:
    "bg-danger text-white hover:opacity-90 disabled:opacity-50",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
