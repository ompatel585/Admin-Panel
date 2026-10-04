import { defineMessages } from "./messages.master";

export const sitesMessages = defineMessages({
  errors: {
    SITE_NOT_FOUND: "That website no longer exists.",
    SITE_URL_TAKEN: "This website is already in your workspace.",
    SITE_LIMIT_REACHED: "You've reached your plan's website limit. Upgrade to add more.",
    SITE_PAGE_LIMIT_EXCEEDED: "That page limit is higher than your plan allows.",
    SITE_CRAWL_ACTIVE: "A crawl is already queued or running for this website.",
  },
  success: {
    createSite: "Website added. Crawling will start shortly.",
    updateSite: "Website updated.",
    crawlSite: "Crawl queued.",
    deleteSite: "Website deleted.",
  },
});
