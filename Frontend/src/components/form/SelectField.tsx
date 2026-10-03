"use client";

import { useField } from "formik";
import type { SelectHTMLAttributes } from "react";
import styles from "./form.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField({ name, label, options, placeholder, id, ...rest }: SelectFieldProps) {
  const [field, meta] = useField(name);
  const inputId = id ?? `field-${name}`;
  const showError = meta.touched && meta.error;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <select
        id={inputId}
        className={`${styles.input} ${showError ? styles.invalid : ""}`}
        aria-invalid={Boolean(showError)}
        {...field}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showError && <span className={styles.error}>{meta.error}</span>}
    </div>
  );
}
