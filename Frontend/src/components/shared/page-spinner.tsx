import { Loader2 } from "lucide-react";

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground" role="status" aria-label="Loading">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}
