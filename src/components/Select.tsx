import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, id, className = "", children, ...props }, ref) {
    return (
      <label className="flex flex-col gap-1 text-sm">
        {label && <span className="font-medium text-ink">{label}</span>}
        <select
          ref={ref}
          id={id}
          className={`rounded-lg border border-border bg-white px-3 py-2 text-ink outline-none focus:border-orange focus:ring-1 focus:ring-orange ${className}`}
          {...props}
        >
          {children}
        </select>
      </label>
    );
  },
);
