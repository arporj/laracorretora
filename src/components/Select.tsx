import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, id, className = "", children, ...props }, ref) {
    return (
      <label className={`flex flex-col gap-1 text-sm ${className}`}>
        {label && <span className="font-medium text-ink">{label}</span>}
        <select
          ref={ref}
          id={id}
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-ink outline-none transition-shadow focus:border-orange focus:ring-2 focus:ring-orange/20"
          {...props}
        >
          {children}
        </select>
      </label>
    );
  },
);
