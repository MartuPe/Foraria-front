import React, { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export default function Card({ className = "", children }: CardProps) {
  return (
    <div className={`for-card ${className}`}>
      {children}
    </div>
  );
}
