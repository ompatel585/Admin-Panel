import * as yup from "yup";
import { VALIDATION_MESSAGES as msg } from "@/constants/messages";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const color = (label: string) =>
  yup.string().required(msg.required(label)).matches(HEX, `${label} must be a hex color such as #4f46e5`);

const text = (label: string, max: number) =>
  yup.string().trim().max(max, msg.maxLength(label, max)).defined();

const intField = (label: string, min: number, max: number) =>
  yup
    .number()
    .typeError(msg.range(label, min, max))
    .required(msg.required(label))
    .integer(msg.range(label, min, max))
    .min(min, msg.range(label, min, max))
    .max(max, msg.range(label, min, max));

export const widgetSchema = yup.object({
  theme: yup.object({
    accent: color("Accent"),
    accentForeground: color("Accent text"),
    surface: color("Background"),
    raised: color("Raised surface"),
    foreground: color("Text"),
    muted: color("Muted text"),
    border: color("Border"),
    radius: intField("Corner radius", 0, 32),
    font: yup
      .string()
      .trim()
      .required(msg.required("Font"))
      .max(100, msg.maxLength("Font", 100))
      .matches(/^[A-Za-z0-9 ,'_-]+$/, "Font may only contain letters, numbers, spaces, commas and hyphens"),
  }),
  copy: yup.object({
    title: text("Title", 60),
    subtitle: text("Subtitle", 120),
    greeting: text("Greeting", 300),
    placeholder: text("Input placeholder", 100),
    offlineMessage: text("Offline message", 300),
    avatarText: text("Avatar text", 4),
  }),
  launcher: yup.object({
    position: yup.string().oneOf(["bottom-right", "bottom-left"]).required(),
    offset: intField("Offset", 0, 100),
    width: intField("Width", 40, 120),
    height: intField("Height", 40, 120),
  }),
  features: yup.object({
    streaming: yup.boolean().required(),
    showSources: yup.boolean().required(),
  }),
});

export type WidgetValues = yup.InferType<typeof widgetSchema>;
