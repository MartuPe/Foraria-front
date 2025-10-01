// Componente desactivado temporalmente - usar Material-UI Button en su lugar
// import * as React from "react";
// import { Slot } from "@radix-ui/react-slot";
// import { cva, type VariantProps } from "class-variance-authority";
// import { cn } from "../../utils/cn";

// const buttonVariants = cva(
//   "inline-flex items-center justify-center gap-2 rounded-md font-montserrat text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
//   {
//     variants: {
//       variant: {
//         default: "bg-primary text-primary-foreground hover:bg-primary/90",
//         foraria: "foraria-gradient-button font-medium",
//         destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
//         outline: "border border-primary/20 bg-background text-primary hover:bg-primary/5",
//         ghost: "hover:bg-primary/5 hover:text-primary",
//         link: "text-primary underline-offset-4 hover:underline",
//       },
//       size: {
//         default: "h-12 px-4 py-3",
//         sm: "h-10 px-3 text-sm",
//         lg: "h-14 px-6 text-lg",
//         icon: "h-12 w-12",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// );

// export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
//   asChild?: boolean;
// }

// export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
//   const Comp = asChild ? Slot : "button";
//   return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;

// }

// Exportar vacío para evitar errores de importación
export function Button() {
  return null;
}
