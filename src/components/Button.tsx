import { forwardRef } from "react";
import { cx } from "../utils";

export const Button = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }) => {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500",
        "disabled:opacity-50",
        className
      )}
    >
      {props.children}
    </button>
  );
});
