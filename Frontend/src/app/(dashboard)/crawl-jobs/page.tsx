import type { Metadata } from "next";
import { CrawlJobsView } from "@/views/CrawlJobsView";

export const metadata: Metadata = { title: "Crawl jobs · RAG Console" };

export default function Page() {
  return <CrawlJobsView />;
}
