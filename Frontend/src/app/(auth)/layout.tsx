import type { ReactNode } from "react";
import { GuestGate } from "@/components/guards/GuestGate";

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return <GuestGate>{children}</GuestGate>;
}
