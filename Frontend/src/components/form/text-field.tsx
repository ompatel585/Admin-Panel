"use client";

import { useField } from "formik";
import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { FieldShell } from "./field-shell";

interface TextFieldProps extends Omit<ComponentProps<"input">, "name"> {
  name: string;
  label: string;
  hint?: string;
}

export function TextField({ name, label, hint, id, ...rest }: TextFieldProps) {
  const [field, meta] = useField(name);
  const inputId = id ?? `field-${name}`;
  const error = meta.touched ? meta.error : undefined;

  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint}>
      <Input id={inputId} aria-invalid={Boolean(error)} {...field} {...rest} />
    </FieldShell>
  );
}
