import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

/** Shared frame for every sign-in / sign-up / password-reset screen. */
export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <main className={styles.shell}>
      <Card className={styles.card}>
        <div className={styles.brand}>Admin Panel</div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </Card>
    </main>
  );
}
