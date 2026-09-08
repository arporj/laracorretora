import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = "", ...props },
  ref,
) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-ink">{label}</span>}
      <input
        ref={ref}
        id={id}
        className={`rounded-lg border border-border bg-white px-3 py-2 text-ink outline-none focus:border-orange focus:ring-1 focus:ring-orange ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, id, className = "", ...props }, ref) {
    return (
      <label className="flex flex-col gap-1 text-sm">
        {label && <span className="font-medium text-ink">{label}</span>}
        <textarea
          ref={ref}
          id={id}
          className={`rounded-lg border border-border bg-white px-3 py-2 text-ink outline-none focus:border-orange focus:ring-1 focus:ring-orange ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </label>
    );
  },
);
