"use client";

import { Form, Formik } from "formik";
import { SelectField, SubmitButton, SwitchField, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePermissions } from "@/hooks/usePermissions";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserValues,
  type UpdateUserValues,
} from "@/lib/validation/users.schemas";
import {
  useCreateUserMutation,
  useGetRoleOptionsQuery,
  useGetTenantOptionsQuery,
  useUpdateUserMutation,
} from "@/services/api";
import type { User } from "@/types/user";
import { succeeded } from "@/utils/safe-unwrap";

interface UserFormDialogProps {
  /** Present when editing; absent when creating. */
  user?: User | null;
  onClose: () => void;
}

/** Workspace picker: only a super admin chooses one; everyone else adds to their own workspace. */
function WorkspaceField() {
  const { isAdmin } = usePermissions();
  const { data: tenants = [] } = useGetTenantOptionsQuery(undefined, { skip: !isAdmin });

  if (!isAdmin) return null;
  return (
    <SelectField
      name="tenantId"
      label="Workspace"
      placeholder="Choose a workspace"
      options={tenants.map((tenant) => ({ value: tenant.id, label: tenant.name }))}
    />
  );
}

export function UserFormDialog({ user, onClose }: UserFormDialogProps) {
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const { data: roles = [] } = useGetRoleOptionsQuery(undefined, { skip: Boolean(user) });
  // The Admin role can't be handed to anyone.
  const assignable = roles.filter((role) => !role.isAdmin);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Edit user" : "New user"}</DialogTitle>
          <DialogDescription>
            {user ? "Update their name or email." : "They can sign in straight away with the password you set."}
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <Formik<UpdateUserValues>
            initialValues={{ name: user.name, email: user.email }}
            validationSchema={updateUserSchema}
            onSubmit={async (values) => {
              if (await succeeded(updateUser({ id: user.id, ...values }).unwrap())) onClose();
            }}
          >
            <Form className="grid gap-4" noValidate>
              <TextField name="name" label="Full name" autoComplete="off" />
              <TextField name="email" label="Email" type="email" autoComplete="off" />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <SubmitButton>Save changes</SubmitButton>
              </DialogFooter>
            </Form>
          </Formik>
        ) : (
          <Formik<CreateUserValues>
            initialValues={{ name: "", email: "", password: "", roleId: "", tenantId: "", isActive: true }}
            validationSchema={createUserSchema}
            onSubmit={async ({ tenantId, ...values }) => {
              const request = createUser({ ...values, tenantId: tenantId || undefined });
              if (await succeeded(request.unwrap())) onClose();
            }}
          >
            <Form className="grid gap-4" noValidate>
              <TextField name="name" label="Full name" autoComplete="off" />
              <TextField name="email" label="Email" type="email" autoComplete="off" />
              <TextField
                name="password"
                label="Initial password"
                type="password"
                autoComplete="new-password"
                hint="At least 8 characters, with a letter and a number."
              />
              <SelectField
                name="roleId"
                label="Role"
                placeholder="Select a role"
                options={assignable.map((role) => ({ value: role.id, label: role.name }))}
              />
              <WorkspaceField />
              <SwitchField name="isActive" label="Active" description="Inactive users cannot sign in." />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <SubmitButton>Create user</SubmitButton>
              </DialogFooter>
            </Form>
          </Formik>
        )}
      </DialogContent>
    </Dialog>
  );
}
