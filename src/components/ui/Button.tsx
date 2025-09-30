import React from "react";

type Variant = "primary" | "outline" | "danger";

export default function Button({
  children,
  variant = "primary",
  iconLeft,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  iconLeft?: React.ReactNode;
}) {
  return (
    <button className={`btn btn--${variant} ${className}`} {...rest}>
      {iconLeft ? <span className="btn__icon">{iconLeft}</span> : null}
      <span>{children}</span>
    </button>
  );
}
