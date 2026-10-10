"use client";

import { useField } from "formik";
import { Input } from "@/components/ui/input";
import { FieldShell } from "./field-shell";

interface ColorFieldProps {
  name: string;
  label: string;
  hint?: string;
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#abc` -> `#aabbcc`; the native picker only understands six digits. */
const toSixDigits = (value: string): string => {
  const short = /^#([0-9a-f]{3})$/i.exec(value);
  return short ? `#${[...short[1]].map((c) => c + c).join("")}` : value;
};

/** A swatch that opens the browser's color picker, beside an editable hex code. */
export function ColorField({ name, label, hint }: ColorFieldProps) {
  const [field, meta, helpers] = useField<string>(name);
  const id = `field-${name}`;
  const error = meta.touched ? meta.error : undefined;

  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={HEX.test(field.value) ? toSixDigits(field.value) : "#000000"}
          onChange={(event) => helpers.setValue(event.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
        />
        <Input
          id={id}
          aria-invalid={Boolean(error)}
          spellCheck={false}
          maxLength={7}
          className="font-mono"
          {...field}
        />
      </div>
    </FieldShell>
  );
}
