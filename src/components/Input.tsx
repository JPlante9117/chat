import { forwardRef } from "react";
import { cx } from "../utils";

export const Input = forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cx(
        "px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-300 focus:ring-indigo-300 block w-full rounded-md focus:ring-1",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
