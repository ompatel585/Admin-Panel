"use client";

import { useField } from "formik";
import { Textarea } from "@/components/ui/textarea";
import { FieldShell } from "./field-shell";

interface ListFieldProps {
  name: string;
  label: string;
  hint?: string;
  placeholder?: string;
}

/** One value per line, stored as `string[]` (include/exclude paths, allowed domains). */
export function ListField({ name, label, hint, placeholder }: ListFieldProps) {
  const [field, meta, helpers] = useField<string[]>(name);
  const id = `field-${name}`;
  const error = meta.touched && typeof meta.error === "string" ? meta.error : undefined;

  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <Textarea
        id={id}
        rows={3}
        placeholder={placeholder}
        value={field.value.join("\n")}
        onChange={(event) => helpers.setValue(event.target.value.split("\n"))}
        onBlur={() => helpers.setValue(field.value.map((line) => line.trim()).filter(Boolean))}
      />
    </FieldShell>
  );
}
