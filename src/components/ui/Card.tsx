import * as React from "react";
interface CardProps extends React.ComponentProps<"div"> {}
interface CardSubProps extends React.ComponentProps<"div"> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardSubProps) {
  return (
    <div
      data-slot="card-header"
      
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: CardSubProps) {
  return (
    <h4
      data-slot="card-title"
      {...props}
    >
      {props.children || "Card Title"}
    </h4>
  );
}

export function CardDescription({ className, ...props }: CardSubProps) {
  return (
    <p
      data-slot="card-description"
      {...props}
    />
  );
}

export function CardAction({ className, ...props }: CardSubProps) {
  return (
    <div
      data-slot="card-action"
     
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardSubProps) {
  return (
    <div
      data-slot="card-content"
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: CardSubProps) {
  return (
    <div
      data-slot="card-footer"
      {...props}
    />
  );
}

