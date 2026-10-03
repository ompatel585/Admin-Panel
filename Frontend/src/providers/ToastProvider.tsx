"use client";

import { Toaster } from "sonner";
import { TOAST } from "@/constants/ui";

export function ToastProvider() {
  return <Toaster position={TOAST.position} richColors closeButton theme="system" />;
}
