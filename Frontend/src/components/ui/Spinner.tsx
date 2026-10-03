import styles from "./ui.module.css";

export function Spinner({ large }: { large?: boolean }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`${styles.spinner} ${large ? styles.spinnerLg : ""}`}
    />
  );
}

export function PageSpinner() {
  return (
    <div className={styles.center}>
      <Spinner large />
    </div>
  );
}
