import type { ReactNode } from "react";
import styles from "./ui.module.css";

type Tone = "neutral" | "success" | "danger" | "primary" | "warning";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "",
  success: styles.badgeSuccess,
  danger: styles.badgeDanger,
  primary: styles.badgePrimary,
  warning: styles.badgeWarning,
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`${styles.badge} ${TONE_CLASS[tone]}`}>{children}</span>;
}

export function StatusBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "success" : "danger"}>{active ? "Active" : "Inactive"}</Badge>;
}
