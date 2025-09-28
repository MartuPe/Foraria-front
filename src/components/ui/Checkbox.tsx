import * as React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Checkbox(props: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className="mr-2 h-4 w-4 rounded border border-gray-300 text-foraria-primary focus:ring-foraria-accent"
      {...props}
    />
  );
}