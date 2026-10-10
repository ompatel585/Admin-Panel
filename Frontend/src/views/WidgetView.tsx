"use client";

import { Globe } from "lucide-react";
import { useState } from "react";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSpinner } from "@/components/shared/page-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERMISSIONS } from "@/constants/permissions";
import { WidgetSettingsForm } from "@/sections/widget/widget-settings-form";
import { useGetSitesQuery } from "@/services/api";

/** The API's largest page; a workspace is capped well below this by its plan. */
const SITE_LIMIT = 100;

export function WidgetView() {
  const { data, isLoading } = useGetSitesQuery({ page: 1, limit: SITE_LIMIT });
  const [chosenId, setChosenId] = useState("");

  const sites = data?.items ?? [];
  const site = sites.find((item) => item.id === chosenId) ?? sites[0];
  const options = sites.map((item) => ({ value: item.id, label: item.name }));

  return (
    <RequirePermission permission={PERMISSIONS.sites.update}>
      <PageHeader
        title="Widget"
        description="Choose how the chat widget looks on a website: colors, texts and launcher."
        actions={
          site && (
            <Select items={options} value={site.id} onValueChange={(value) => setChosenId((value as string) ?? "")}>
              <SelectTrigger className="w-64" aria-label="Website">
                <SelectValue placeholder="Select a website" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
      />

      {isLoading ? (
        <PageSpinner />
      ) : site ? (
        <WidgetSettingsForm site={site} />
      ) : (
        <EmptyState icon={Globe} title="No websites yet" description="Add a website first, then style its widget here." />
      )}
    </RequirePermission>
  );
}
