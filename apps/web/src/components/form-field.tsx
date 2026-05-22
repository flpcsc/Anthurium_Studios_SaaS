import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface FormFieldProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
}

export function FormField({ label, id, ...props }: FormFieldProps): ReactNode {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...props} />
    </label>
  );
}
