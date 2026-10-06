"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "default" | "primary" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  default: "",
  primary: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-destructive",
};

export interface RowAction {
  label: string;
  icon: LucideIcon;
  tone?: Tone;
  /** Either a click handler or a link. */
  onClick?: () => void;
  href?: string;
  /** Not rendered at all, e.g. for a missing permission. */
  hidden?: boolean;
  disabled?: boolean;
}

/**
 * Right-aligned icon buttons for a table row. Callers list them in the
 * standard order: status toggle, edit, secondary (permissions / re-crawl), delete.
 */
export function RowActions({ actions, subject }: { actions: RowAction[]; subject: string }) {
  const visible = actions.filter((action) => !action.hidden);

  return (
    <div className="flex items-center justify-end gap-1">
      {visible.map(({ label, icon: Icon, tone = "default", onClick, href, disabled }) => {
        const common = { "aria-label": `${label} ${subject}`, title: label };
        const className = TONES[tone];
        return href && !disabled ? (
          <Link key={label} href={href} {...common} className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), className)}>
            <Icon />
          </Link>
        ) : (
          <Button key={label} variant="ghost" size="icon-sm" className={className} disabled={disabled} onClick={onClick} {...common}>
            <Icon />
          </Button>
        );
      })}
    </div>
  );
}
