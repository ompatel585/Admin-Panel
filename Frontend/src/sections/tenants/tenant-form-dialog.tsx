"use client";

import { Form, Formik } from "formik";
import { SelectField, SubmitButton, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PLAN_OPTIONS } from "@/constants/tenants";
import { tenantSchema, type TenantValues } from "@/lib/validation/tenants.schemas";
import { useCreateTenantMutation, useUpdateTenantMutation } from "@/services/api";
import type { Tenant, TenantPlan } from "@/types/tenant";
import { succeeded } from "@/utils/safe-unwrap";

export function TenantFormDialog({ tenant, onClose }: { tenant?: Tenant | null; onClose: () => void }) {
  const [createTenant] = useCreateTenantMutation();
  const [updateTenant] = useUpdateTenantMutation();

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tenant ? "Edit workspace" : "New workspace"}</DialogTitle>
          <DialogDescription>
            {tenant ? "Rename it or move it to a different plan." : "Create a workspace for a customer. Add its users afterwards."}
          </DialogDescription>
        </DialogHeader>

        <Formik<TenantValues>
          initialValues={{ name: tenant?.name ?? "", plan: tenant?.plan ?? "free" }}
          validationSchema={tenantSchema}
          onSubmit={async (values) => {
            const body = { name: values.name, plan: values.plan as TenantPlan };
            const request = tenant ? updateTenant({ id: tenant.id, ...body }) : createTenant(body);
            if (await succeeded(request.unwrap())) onClose();
          }}
        >
          <Form className="grid gap-4" noValidate>
            <TextField name="name" label="Workspace name" autoComplete="off" />
            <SelectField name="plan" label="Plan" options={PLAN_OPTIONS} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton>{tenant ? "Save changes" : "Create workspace"}</SubmitButton>
            </DialogFooter>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
