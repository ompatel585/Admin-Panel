"use client";

import { useField } from "formik";
import type { InputHTMLAttributes } from "react";
import styles from "./form.module.css";

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
  name: string;
  label: string;
  description?: string;
}

export function CheckboxField({ name, label, description, ...rest }: CheckboxFieldProps) {
  const [field] = useField({ name, type: "checkbox" });

  return (
    <label className={styles.checkbox}>
      <input type="checkbox" {...field} {...rest} />
      <span className={styles.checkboxText}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.hint}>{description}</span>}
      </span>
    </label>
  );
}
