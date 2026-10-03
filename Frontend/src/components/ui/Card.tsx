import type { HTMLAttributes } from "react";
import styles from "./ui.module.css";

export function Card({
  padded = true,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  const classes = [styles.card, padded && styles.cardPad, className].filter(Boolean).join(" ");
  return <div className={classes} {...rest} />;
}
