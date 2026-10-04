"use client";

import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SwitchFieldProps {
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function SwitchField({ name, label, description, disabled }: SwitchFieldProps) {
  const [field, , helpers] = useField<boolean>(name);
  const id = `field-${name}`;

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <div className="grid gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={id} checked={field.value} onCheckedChange={(checked) => helpers.setValue(checked)} disabled={disabled} />
    </div>
  );
}
