"use client";

import { useField } from "formik";
import type { ComponentProps } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FieldShell } from "./field-shell";

interface TextAreaFieldProps extends Omit<ComponentProps<"textarea">, "name"> {
  name: string;
  label: string;
  hint?: string;
}

export function TextAreaField({ name, label, hint, id, ...rest }: TextAreaFieldProps) {
  const [field, meta] = useField(name);
  const inputId = id ?? `field-${name}`;
  const error = meta.touched ? meta.error : undefined;

  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint}>
      <Textarea id={inputId} aria-invalid={Boolean(error)} {...field} {...rest} />
    </FieldShell>
  );
}
