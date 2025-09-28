interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, ...props }: LabelProps) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1" {...props}>
      {children}
    </label>
  );
}