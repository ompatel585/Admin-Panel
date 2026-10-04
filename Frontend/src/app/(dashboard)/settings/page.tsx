import type { Metadata } from "next";
import { SettingsView } from "@/views/SettingsView";

export const metadata: Metadata = { title: "Settings · RAG Console" };

export default function Page() {
  return <SettingsView />;
}
