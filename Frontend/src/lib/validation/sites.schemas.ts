import * as yup from "yup";
import { VALIDATION_MESSAGES as msg } from "@/constants/messages";
import { rules } from "./rules";

const intField = (label: string, min: number, max: number) =>
  yup
    .number()
    .typeError(msg.range(label, min, max))
    .required(msg.required(label))
    .integer(msg.range(label, min, max))
    .min(min, msg.range(label, min, max))
    .max(max, msg.range(label, min, max));

const crawlShape = {
  maxPages: intField("Page limit", 1, 20000),
  maxDepth: intField("Crawl depth", 1, 10),
  includePaths: yup.array(yup.string().defined()).defined(),
  excludePaths: yup.array(yup.string().defined()).defined(),
  respectRobots: rules.boolean(),
  recrawl: rules.requiredSelect("Re-crawl schedule"),
};

export const createSiteSchema = yup.object({
  tenantId: yup.string().defined(),
  name: rules.text("Name", 80),
  url: yup
    .string()
    .trim()
    .required(msg.required("Website address"))
    .matches(/^https?:\/\/[^\s/$.?#][^\s]*$/i, msg.url)
    .max(500, msg.maxLength("Website address", 500)),
  ...crawlShape,
});

export const updateSiteSchema = yup.object({
  name: rules.text("Name", 80),
  ...crawlShape,
});

export type CreateSiteValues = yup.InferType<typeof createSiteSchema>;
export type UpdateSiteValues = yup.InferType<typeof updateSiteSchema>;
