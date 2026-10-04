"use client";

import { Form, Formik } from "formik";
import { SubmitButton, TextField } from "@/components/form";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSpinner } from "@/components/shared/page-spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PERMISSIONS } from "@/constants/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { formatCount } from "@/lib/format";
import { tenantSchema } from "@/lib/validation/tenants.schemas";
import { useGetCurrentTenantQuery, useUpdateTenantMutation } from "@/services/api";
import { succeeded } from "@/utils/safe-unwrap";
import { Building2 } from "lucide-react";
import * as yup from "yup";

const nameSchema = yup.object({ name: tenantSchema.fields.name });

export function SettingsView() {
  const { can, tenant: me } = usePermissions();
  const { data: tenant, isLoading } = useGetCurrentTenantQuery(undefined, { skip: !me });
  const [updateTenant] = useUpdateTenantMutation();

  if (!me) {
    return (
      <Card>
        <EmptyState icon={Building2} title="No workspace" description="Platform admins manage workspaces from the Workspaces page." />
      </Card>
    );
  }
  if (isLoading || !tenant) return <PageSpinner />;

  const rows = [
    { label: "Websites", used: tenant.usage?.sites ?? 0, max: tenant.limits.maxSites },
  ];

  return (
    <RequirePermission permission={PERMISSIONS.tenants.read}>
      <PageHeader title="Workspace settings" description="Your workspace name, plan and usage." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>The name shown in the top bar and to your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              enableReinitialize
              initialValues={{ name: tenant.name }}
              validationSchema={nameSchema}
              onSubmit={async (values) => {
                await succeeded(updateTenant({ id: tenant.id, name: values.name }).unwrap());
              }}
            >
              <Form className="grid gap-4" noValidate>
                <TextField name="name" label="Workspace name" autoComplete="off" disabled={!can(PERMISSIONS.tenants.update)} />
                {can(PERMISSIONS.tenants.update) && <SubmitButton className="w-fit">Save</SubmitButton>}
              </Form>
            </Formik>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Plan <StatusBadge status={tenant.plan} />
            </CardTitle>
            <CardDescription>
              Up to {formatCount(tenant.limits.maxPagesPerSite)} pages per website. Contact us to change your plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {rows.map((row) => (
              <div key={row.label} className="grid gap-1.5">
                <div className="flex justify-between text-sm">
                  <span>{row.label}</span>
                  <span className="text-muted-foreground">
                    {row.used} / {row.max}
                  </span>
                </div>
                <Progress value={Math.min(100, (row.used / row.max) * 100)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RequirePermission>
  );
}
