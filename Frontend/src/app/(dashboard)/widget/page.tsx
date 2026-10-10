import type { Metadata } from "next";
import { WidgetView } from "@/views/WidgetView";

export const metadata: Metadata = { title: "Widget · RAG Console" };

export default function Page() {
  return <WidgetView />;
}
