import { cn } from "@/lib/cn";
import { forwardRef } from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string };

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, className, children, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>}
      <select
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
});
