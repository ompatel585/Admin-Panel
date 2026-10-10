import type { CSSProperties } from "react";
import type { WidgetSettings } from "@/types/site";

const FALLBACK_FONT = "system-ui, sans-serif";

/**
 * A static picture of the embedded widget, drawn from the form values so every
 * change is visible before it is saved. It does not load the real widget.
 */
export function WidgetPreview({ settings }: { settings: WidgetSettings }) {
  const { theme, copy, launcher, features } = settings;
  const side = launcher.position === "bottom-right" ? "right" : "left";
  const radius = `${theme.radius}px`;

  const root: CSSProperties = {
    fontFamily: theme.font ? `${theme.font}, ${FALLBACK_FONT}` : FALLBACK_FONT,
    color: theme.foreground,
  };

  return (
    <div
      className="relative h-[520px] overflow-hidden rounded-xl border bg-muted/40"
      role="img"
      aria-label="Widget preview"
    >
      <div
        className="absolute flex w-[300px] max-w-[calc(100%-1rem)] flex-col overflow-hidden shadow-xl"
        style={{
          ...root,
          bottom: launcher.offset + launcher.height + 12,
          [side]: launcher.offset,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: radius,
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3" style={{ background: theme.accent, color: theme.accentForeground }}>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: theme.accentForeground, color: theme.accent }}
          >
            {copy.avatarText || "AI"}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{copy.title || "Title"}</span>
            <span className="block truncate text-xs opacity-80">{copy.subtitle}</span>
          </span>
        </div>

        <div className="flex flex-col gap-2 p-3 text-sm" style={{ background: theme.surface }}>
          <p className="max-w-[85%] px-3 py-2" style={{ background: theme.raised, borderRadius: radius }}>
            {copy.greeting}
          </p>
          <p
            className="ml-auto max-w-[85%] px-3 py-2"
            style={{ background: theme.accent, color: theme.accentForeground, borderRadius: radius }}
          >
            What are your opening hours?
          </p>
          <p className="max-w-[85%] px-3 py-2" style={{ background: theme.raised, borderRadius: radius }}>
            We are open Monday to Friday, 9am to 6pm.
            {features.showSources && (
              <span className="mt-1 block text-xs underline" style={{ color: theme.muted }}>
                Source: Contact us
              </span>
            )}
          </p>
        </div>

        <div className="p-3" style={{ borderTop: `1px solid ${theme.border}` }}>
          <div
            className="px-3 py-2 text-sm"
            style={{ border: `1px solid ${theme.border}`, borderRadius: radius, color: theme.muted, background: theme.surface }}
          >
            {copy.placeholder}
          </div>
        </div>
      </div>

      <div
        className="absolute flex items-center justify-center text-sm font-semibold shadow-lg"
        style={{
          ...root,
          bottom: launcher.offset,
          [side]: launcher.offset,
          width: launcher.width,
          height: launcher.height,
          background: theme.accent,
          color: theme.accentForeground,
          borderRadius: Math.min(theme.radius * 2, launcher.height / 2),
        }}
      >
        {copy.avatarText || "AI"}
      </div>
    </div>
  );
}
