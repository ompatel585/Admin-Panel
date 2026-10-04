import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./ToastProvider";

// Compose every global provider here; the root layout only needs this one.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>
        {children}
        <ToastProvider />
      </StoreProvider>
    </ThemeProvider>
  );
}
