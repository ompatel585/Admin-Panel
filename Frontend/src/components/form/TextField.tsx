"use client";

import { useField } from "formik";
import type { InputHTMLAttributes } from "react";
import styles from "./form.module.css";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  label: string;
  hint?: string;
}

export function TextField({ name, label, hint, id, ...rest }: TextFieldProps) {
  const [field, meta] = useField(name);
  const inputId = id ?? `field-${name}`;
  const showError = meta.touched && meta.error;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={`${styles.input} ${showError ? styles.invalid : ""}`}
        aria-invalid={Boolean(showError)}
        {...field}
        {...rest}
      />
      {showError ? <span className={styles.error}>{meta.error}</span> : hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
