import { Bot } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthShellProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

/** Shared frame for every sign-in / sign-up / password-reset screen. */
export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center justify-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </span>
          RAG Console
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent className="grid gap-4">{children}</CardContent>
        </Card>
        {footer && <div className="text-center text-sm text-muted-foreground [&_a]:font-medium [&_a]:text-primary">{footer}</div>}
      </div>
    </main>
  );
}
