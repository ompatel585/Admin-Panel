"use client";

import { Form, Formik } from "formik";
import { SubmitButton, SwitchField, TextAreaField, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { roleSchema, type RoleValues } from "@/lib/validation/roles.schemas";
import { useCreateRoleMutation, useUpdateRoleMutation } from "@/services/api";
import type { Role } from "@/types/role";
import { succeeded } from "@/utils/safe-unwrap";

interface RoleFormDialogProps {
  /** Present when editing; absent when creating. */
  role?: Role | null;
  onClose: () => void;
}

export function RoleFormDialog({ role, onClose }: RoleFormDialogProps) {
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? `Edit ${role.name}` : "Add role"}</DialogTitle>
          <DialogDescription>
            {role ? "Update the name and details." : "Create the role, then choose its permissions."}
          </DialogDescription>
        </DialogHeader>

        <Formik<RoleValues>
          initialValues={{ name: role?.name ?? "", description: role?.description ?? "", isActive: role?.isActive ?? true }}
          validationSchema={roleSchema}
          onSubmit={async (values) => {
            const request = role ? updateRole({ id: role.id, ...values }) : createRole(values);
            if (await succeeded(request.unwrap())) onClose();
          }}
        >
          <Form className="grid gap-4" noValidate>
            <TextField name="name" label="Name" autoComplete="off" disabled={role?.isSystem} hint={role?.isSystem ? "System roles can't be renamed." : undefined} />
            <TextAreaField name="description" label="Description" rows={3} />
            <SwitchField
              name="isActive"
              label="Active"
              description={role?.isSystem ? "System roles can't be deactivated." : "Inactive roles can't be assigned to users."}
              disabled={role?.isSystem}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton>{role ? "Save changes" : "Add role"}</SubmitButton>
            </DialogFooter>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
