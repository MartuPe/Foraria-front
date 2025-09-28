import { cn } from "../../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}