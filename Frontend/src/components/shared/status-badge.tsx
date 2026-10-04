import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "bg-red-500/10 text-red-700 dark:text-red-300",
};

/** Every status the app shows (website, crawl job, workspace, plan), mapped to one tone and label. */
const STATUS: Record<string, { tone: Tone; label: string }> = {
  pending: { tone: "neutral", label: "Pending" },
  queued: { tone: "neutral", label: "Queued" },
  crawling: { tone: "info", label: "Crawling" },
  indexing: { tone: "info", label: "Indexing" },
  running: { tone: "info", label: "Running" },
  ready: { tone: "success", label: "Ready" },
  completed: { tone: "success", label: "Completed" },
  active: { tone: "success", label: "Active" },
  failed: { tone: "danger", label: "Failed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  suspended: { tone: "warning", label: "Suspended" },
  inactive: { tone: "neutral", label: "Inactive" },
  free: { tone: "neutral", label: "Free" },
  pro: { tone: "info", label: "Pro" },
  enterprise: { tone: "success", label: "Enterprise" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { tone, label } = STATUS[status] ?? { tone: "neutral" as Tone, label: status };
  return (
    <Badge variant="secondary" className={cn("font-medium", TONES[tone], className)}>
      {label}
    </Badge>
  );
}
