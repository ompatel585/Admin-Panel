import { defineMessages } from "./messages.master";

export const crawlJobsMessages = defineMessages({
  errors: {
    JOB_NOT_FOUND: "That crawl job no longer exists.",
    JOB_NOT_CANCELLABLE: "Only queued or running jobs can be cancelled.",
  },
  success: {
    cancelCrawlJob: "Crawl job cancelled.",
  },
});
