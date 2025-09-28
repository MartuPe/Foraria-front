import * as React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "foraria-input w-full rounded-md px-4 py-3 border border-input shadow-sm text-base font-montserrat",
        "focus:border-accent focus:ring focus:ring-accent/30 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
