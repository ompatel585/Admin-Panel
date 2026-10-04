"use client";

import { useField } from "formik";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldShell } from "./field-shell";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}

export function SelectField({ name, label, options, placeholder = "Select…", hint, disabled }: SelectFieldProps) {
  const [field, meta, helpers] = useField<string>(name);
  const id = `field-${name}`;
  const error = meta.touched ? meta.error : undefined;

  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <Select
        items={options}
        value={field.value || null}
        onValueChange={(value) => helpers.setValue((value as string) ?? "")}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}
