"use client";

import { useFormikContext } from "formik";
import { Button, type ButtonProps } from "@/components/ui/Button";

/** Submit button that shows its own spinner while the Formik form is submitting. */
export function SubmitButton({ children, ...rest }: Omit<ButtonProps, "type" | "loading">) {
  const { isSubmitting } = useFormikContext();
  return (
    <Button type="submit" loading={isSubmitting} {...rest}>
      {children}
    </Button>
  );
}
