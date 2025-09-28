import * as React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-montserrat shadow-sm",
        "focus:border-blue-500 focus:ring focus:ring-blue-200 disabled:opacity-50",
        "file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}