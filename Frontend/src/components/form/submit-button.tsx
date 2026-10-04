"use client";

import { useFormikContext } from "formik";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

/** Submit button that disables itself while the Formik form is submitting. */
export function SubmitButton({ children, ...rest }: Omit<ComponentProps<typeof Button>, "type">) {
  const { isSubmitting } = useFormikContext();
  return (
    <Button type="submit" disabled={isSubmitting} {...rest}>
      {isSubmitting ? "Working…" : children}
    </Button>
  );
}
