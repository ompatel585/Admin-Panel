"use client";

import { useField } from "formik";
import type { TextareaHTMLAttributes } from "react";
import styles from "./form.module.css";

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> {
  name: string;
  label: string;
}

export function TextAreaField({ name, label, id, ...rest }: TextAreaFieldProps) {
  const [field, meta] = useField(name);
  const inputId = id ?? `field-${name}`;
  const showError = meta.touched && meta.error;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <textarea
        id={inputId}
        rows={3}
        className={`${styles.input} ${styles.textarea} ${showError ? styles.invalid : ""}`}
        aria-invalid={Boolean(showError)}
        {...field}
        {...rest}
      />
      {showError && <span className={styles.error}>{meta.error}</span>}
    </div>
  );
}
