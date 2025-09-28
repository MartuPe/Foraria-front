interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Checkbox(props: CheckboxProps) {
  return <input type="checkbox" className="mr-2" {...props} />;
}