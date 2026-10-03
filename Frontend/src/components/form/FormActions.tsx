import type { ReactNode } from "react";
import styles from "./form.module.css";

/** Right-aligned button row at the bottom of a form (cancel + submit). */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}
