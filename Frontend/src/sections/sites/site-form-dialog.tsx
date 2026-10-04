"use client";

import { Form, Formik } from "formik";
import { ListField, SelectField, SubmitButton, SwitchField, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePermissions } from "@/hooks/usePermissions";
import {
  createSiteSchema,
  updateSiteSchema,
  type CreateSiteValues,
  type UpdateSiteValues,
} from "@/lib/validation/sites.schemas";
import { useCreateSiteMutation, useGetTenantOptionsQuery, useUpdateSiteMutation } from "@/services/api";
import type { Site } from "@/types/site";
import { succeeded } from "@/utils/safe-unwrap";

const RECRAWL_OPTIONS = [
  { value: "off", label: "Manual only" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
];

interface SiteFormDialogProps {
  /** Present when editing; absent when adding. */
  site?: Site | null;
  onClose: () => void;
}

function CrawlFields() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <TextField name="maxPages" label="Page limit" type="number" min={1} hint="Most pages to index." />
        <TextField name="maxDepth" label="Crawl depth" type="number" min={1} max={10} hint="Link hops from the start page." />
      </div>
      <ListField
        name="includePaths"
        label="Only these paths (optional)"
        placeholder={"/docs\n/blog"}
        hint="One path prefix per line. Empty means the whole site."
      />
      <ListField name="excludePaths" label="Skip these paths (optional)" placeholder={"/login\n/cart"} hint="One path prefix per line." />
      <SelectField name="recrawl" label="Keep up to date" options={RECRAWL_OPTIONS} />
      <SwitchField name="respectRobots" label="Respect robots.txt" description="Skip pages the website asks crawlers to avoid." />
    </>
  );
}

export function SiteFormDialog({ site, onClose }: SiteFormDialogProps) {
  const { isAdmin } = usePermissions();
  const [createSite] = useCreateSiteMutation();
  const [updateSite] = useUpdateSiteMutation();
  const { data: tenants = [] } = useGetTenantOptionsQuery(undefined, { skip: !isAdmin || Boolean(site) });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{site ? "Edit website" : "Add a website"}</DialogTitle>
          <DialogDescription>
            {site
              ? "Changes apply the next time the website is crawled."
              : "We'll crawl it, split it into chunks and embed it."}
          </DialogDescription>
        </DialogHeader>

        {site ? (
          <Formik<UpdateSiteValues>
            initialValues={{ name: site.name, ...site.crawl }}
            validationSchema={updateSiteSchema}
            onSubmit={async (values) => {
              if (await succeeded(updateSite({ id: site.id, name: values.name, crawl: values as never }).unwrap())) onClose();
            }}
          >
            <Form className="grid gap-4" noValidate>
              <TextField name="name" label="Name" autoComplete="off" />
              <p className="text-xs text-muted-foreground">Address: {site.url} (can&apos;t be changed)</p>
              <CrawlFields />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <SubmitButton>Save changes</SubmitButton>
              </DialogFooter>
            </Form>
          </Formik>
        ) : (
          <Formik<CreateSiteValues>
            initialValues={{
              tenantId: "",
              name: "",
              url: "",
              maxPages: 100,
              maxDepth: 3,
              includePaths: [],
              excludePaths: [],
              respectRobots: true,
              recrawl: "off",
            }}
            validationSchema={createSiteSchema}
            onSubmit={async ({ tenantId, name, url, ...crawl }) => {
              const request = createSite({ tenantId: tenantId || undefined, name, url, crawl: crawl as never });
              if (await succeeded(request.unwrap())) onClose();
            }}
          >
            <Form className="grid gap-4" noValidate>
              {isAdmin && (
                <SelectField
                  name="tenantId"
                  label="Workspace"
                  placeholder="Choose a workspace"
                  options={tenants.map((tenant) => ({ value: tenant.id, label: tenant.name }))}
                />
              )}
              <TextField name="name" label="Name" placeholder="Product docs" autoComplete="off" />
              <TextField name="url" label="Website address" placeholder="https://example.com" autoComplete="off" />
              <CrawlFields />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <SubmitButton>Add website</SubmitButton>
              </DialogFooter>
            </Form>
          </Formik>
        )}
      </DialogContent>
    </Dialog>
  );
}
