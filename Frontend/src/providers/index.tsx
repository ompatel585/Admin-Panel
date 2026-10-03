import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { ToastProvider } from "./ToastProvider";

// Compose every global provider here; the root layout only needs this one.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      {children}
      <ToastProvider />
    </StoreProvider>
  );
}
