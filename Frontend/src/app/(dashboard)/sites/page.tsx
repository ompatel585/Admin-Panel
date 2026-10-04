import type { Metadata } from "next";
import { SitesView } from "@/views/SitesView";

export const metadata: Metadata = { title: "Websites · RAG Console" };

export default function Page() {
  return <SitesView />;
}
