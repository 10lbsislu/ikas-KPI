import { cn } from "@/lib/cn";
import { forwardRef } from "react";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  unit?: string;
  error?: string;
  hint?: string;
};

/** Etiketli, birimli (TL/%/Adet) form girişi. Türkçe sayı girdisini olduğu gibi alır. */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, unit, error, hint, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition tabular",
            "placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
            unit && "pr-12",
            error ? "border-rose-300" : "border-slate-200",
            className,
          )}
          {...rest}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
            {unit}
          </span>
        )}
      </div>
      {error ? (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
});

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition",
          "placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
          error ? "border-rose-300" : "border-slate-200",
          className,
        )}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
});
