import type { WidgetSettings, WidgetTheme } from "@/types/site";

/** Mirrors the API's starting values; only used if a website has no stored settings yet. */
export const DEFAULT_WIDGET: WidgetSettings = {
  theme: {
    accent: "#4f46e5",
    accentForeground: "#ffffff",
    surface: "#ffffff",
    raised: "#f4f4f5",
    foreground: "#18181b",
    muted: "#71717a",
    border: "#e4e4e7",
    radius: 12,
    font: "system-ui",
  },
  copy: {
    title: "Ask us anything",
    subtitle: "Answers from our website",
    greeting: "Hi! How can I help you today?",
    placeholder: "Type your question...",
    offlineMessage: "We are offline right now. Please try again later.",
    avatarText: "AI",
  },
  launcher: { position: "bottom-right", offset: 20, width: 56, height: 56 },
  features: { streaming: true, showSources: true },
};

export interface ThemePreset {
  name: string;
  colors: Omit<WidgetTheme, "radius" | "font">;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: "Indigo",
    colors: { accent: "#4f46e5", accentForeground: "#ffffff", surface: "#ffffff", raised: "#f4f4f5", foreground: "#18181b", muted: "#71717a", border: "#e4e4e7" },
  },
  {
    name: "Emerald",
    colors: { accent: "#059669", accentForeground: "#ffffff", surface: "#ffffff", raised: "#f0fdf4", foreground: "#052e16", muted: "#4b7a60", border: "#d1fae5" },
  },
  {
    name: "Rose",
    colors: { accent: "#e11d48", accentForeground: "#ffffff", surface: "#ffffff", raised: "#fff1f2", foreground: "#1f0a10", muted: "#8a5a66", border: "#fecdd3" },
  },
  {
    name: "Amber",
    colors: { accent: "#d97706", accentForeground: "#ffffff", surface: "#fffbeb", raised: "#fef3c7", foreground: "#2a1a02", muted: "#7a6a4a", border: "#fde68a" },
  },
  {
    name: "Midnight",
    colors: { accent: "#818cf8", accentForeground: "#0b1020", surface: "#0f172a", raised: "#1e293b", foreground: "#f1f5f9", muted: "#94a3b8", border: "#334155" },
  },
];
