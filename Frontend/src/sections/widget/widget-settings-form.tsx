"use client";

import { Form, Formik, useFormikContext } from "formik";
import { RotateCcw } from "lucide-react";
import { ColorField, SelectField, SubmitButton, SwitchField, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_WIDGET, THEME_PRESETS } from "@/constants/widget";
import { widgetSchema, type WidgetValues } from "@/lib/validation/widget.schemas";
import { useUpdateSiteWidgetMutation } from "@/services/api";
import type { Site, WidgetSettings } from "@/types/site";
import { succeeded } from "@/utils/safe-unwrap";
import { WidgetPreview } from "./widget-preview";

const POSITIONS = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
];

/** A website saved before widget settings existed falls back to the defaults, field by field. */
const initialValues = (site: Site): WidgetValues => ({
  theme: { ...DEFAULT_WIDGET.theme, ...site.settings?.theme },
  copy: { ...DEFAULT_WIDGET.copy, ...site.settings?.copy },
  launcher: { ...DEFAULT_WIDGET.launcher, ...site.settings?.launcher },
  features: { ...DEFAULT_WIDGET.features, ...site.settings?.features },
});

function Presets() {
  const { values, setFieldValue } = useFormikContext<WidgetValues>();
  return (
    <div className="flex flex-wrap gap-2">
      {THEME_PRESETS.map((preset) => (
        <Button
          key={preset.name}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFieldValue("theme", { ...values.theme, ...preset.colors })}
        >
          <span className="size-3 rounded-full border" style={{ background: preset.colors.accent }} />
          {preset.name}
        </Button>
      ))}
    </div>
  );
}

function Live() {
  const { values } = useFormikContext<WidgetValues>();
  // Mid-typing values (empty, or half a hex code) fall back to defaults so the preview never breaks.
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const color = (value: string, fallback: string) => (hex.test(value) ? value : fallback);
  const t = values.theme;
  const d = DEFAULT_WIDGET.theme;

  const safe: WidgetSettings = {
    theme: {
      accent: color(t.accent, d.accent),
      accentForeground: color(t.accentForeground, d.accentForeground),
      surface: color(t.surface, d.surface),
      raised: color(t.raised, d.raised),
      foreground: color(t.foreground, d.foreground),
      muted: color(t.muted, d.muted),
      border: color(t.border, d.border),
      radius: Number(t.radius) || 0,
      font: t.font || d.font,
    },
    copy: values.copy,
    launcher: {
      position: values.launcher.position,
      offset: Number(values.launcher.offset) || 0,
      width: Number(values.launcher.width) || DEFAULT_WIDGET.launcher.width,
      height: Number(values.launcher.height) || DEFAULT_WIDGET.launcher.height,
    },
    features: values.features,
  };
  return <WidgetPreview settings={safe} />;
}

function Actions({ site }: { site: Site }) {
  const { resetForm, dirty } = useFormikContext<WidgetValues>();
  return (
    <div className="flex items-center gap-2">
      <SubmitButton disabled={!dirty}>Save widget</SubmitButton>
      <Button type="button" variant="outline" disabled={!dirty} onClick={() => resetForm({ values: initialValues(site) })}>
        <RotateCcw /> Discard changes
      </Button>
    </div>
  );
}

export function WidgetSettingsForm({ site }: { site: Site }) {
  const [updateWidget] = useUpdateSiteWidgetMutation();

  return (
    <Formik<WidgetValues>
      // A save raises settingsVersion, which re-seeds the form from what the server stored.
      key={`${site.id}:${site.settingsVersion}`}
      initialValues={initialValues(site)}
      validationSchema={widgetSchema}
      onSubmit={async (values) => {
        const body = widgetSchema.cast(values);
        await succeeded(updateWidget({ id: site.id, ...body }).unwrap());
      }}
    >
      <Form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
              <CardDescription>Pick a preset, or set each color yourself.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Presets />
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorField name="theme.accent" label="Accent" hint="Header, launcher and visitor messages." />
                <ColorField name="theme.accentForeground" label="Accent text" hint="Text drawn on the accent color." />
                <ColorField name="theme.surface" label="Background" />
                <ColorField name="theme.raised" label="Raised surface" hint="Assistant message bubbles." />
                <ColorField name="theme.foreground" label="Text" />
                <ColorField name="theme.muted" label="Muted text" />
                <ColorField name="theme.border" label="Border" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField name="theme.radius" label="Corner radius (px)" type="number" min={0} max={32} />
                <TextField name="theme.font" label="Font" hint="A font name such as Inter or Georgia." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Texts</CardTitle>
              <CardDescription>What visitors read in the widget.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField name="copy.title" label="Title" />
              <TextField name="copy.subtitle" label="Subtitle" />
              <TextField name="copy.greeting" label="Greeting" />
              <TextField name="copy.placeholder" label="Input placeholder" />
              <TextField name="copy.offlineMessage" label="Offline message" />
              <TextField name="copy.avatarText" label="Avatar text" maxLength={4} hint="Up to 4 characters." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Launcher and features</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField name="launcher.position" label="Position" options={POSITIONS} />
                <TextField name="launcher.offset" label="Edge offset (px)" type="number" min={0} max={100} />
                <TextField name="launcher.width" label="Button width (px)" type="number" min={40} max={120} />
                <TextField name="launcher.height" label="Button height (px)" type="number" min={40} max={120} />
              </div>
              <SwitchField name="features.streaming" label="Stream answers" description="Show the answer as it is written." />
              <SwitchField name="features.showSources" label="Show sources" description="Link the pages an answer came from." />
            </CardContent>
          </Card>

          <Actions site={site} />
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <p className="mb-2 text-sm font-medium">Preview</p>
          <Live />
        </div>
      </Form>
    </Formik>
  );
}
