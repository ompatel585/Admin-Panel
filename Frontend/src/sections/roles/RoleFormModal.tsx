"use client";

import { Form, Formik } from "formik";
import {
  CheckboxField,
  FormActions,
  SubmitButton,
  TextAreaField,
  TextField,
  formStyles,
} from "@/components/form";
import { Button, Modal } from "@/components/ui";
import { roleSchema, type RoleValues } from "@/lib/validation/roles.schemas";
import { useCreateRoleMutation, useUpdateRoleMutation } from "@/services/api";
import type { Role } from "@/types/role";
import { succeeded } from "@/utils/safe-unwrap";
import { PermissionPicker } from "./PermissionPicker";

interface RoleFormModalProps {
  open: boolean;
  /** Present when editing; absent when creating. */
  role?: Role | null;
  onClose: () => void;
}

export function RoleFormModal({ open, role, onClose }: RoleFormModalProps) {
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();

  const initialValues: RoleValues = {
    name: role?.name ?? "",
    description: role?.description ?? "",
    isActive: role?.isActive ?? true,
    isDefault: role?.isDefault ?? false,
    permissionIds: role?.permissions.map((permission) => permission.id) ?? [],
  };

  return (
    <Modal open={open} title={role ? `Edit role: ${role.name}` : "New role"} onClose={onClose} wide>
      <Formik
        initialValues={initialValues}
        validationSchema={roleSchema}
        onSubmit={async (values) => {
          const payload = {
            name: values.name,
            description: values.description,
            isActive: values.isActive,
            isDefault: values.isDefault,
            // Super Admin's access is implicit; the API refuses a permission set for it.
            ...(role?.isSuperAdmin ? {} : { permissionIds: values.permissionIds }),
          };
          const request = role ? updateRole({ id: role.id, ...payload }) : createRole(payload);
          if (await succeeded(request.unwrap())) onClose();
        }}
      >
        <Form className={formStyles.form} noValidate>
          <TextField name="name" label="Role name" disabled={role?.isSystem} autoComplete="off" />
          <TextAreaField name="description" label="Description" />

          <div className={formStyles.row}>
            <CheckboxField name="isActive" label="Active" description="Inactive roles grant no access." />
            <CheckboxField
              name="isDefault"
              label="Default for new sign-ups"
              description="Assigned to people who register themselves."
            />
          </div>

          <div className={formStyles.field}>
            <span className={formStyles.label}>Permissions</span>
            {role?.isSuperAdmin ? (
              <span className={formStyles.hint}>
                Super Admin has access to everything, including permissions added later.
              </span>
            ) : (
              <PermissionPicker />
            )}
          </div>

          <FormActions>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <SubmitButton>{role ? "Save changes" : "Create role"}</SubmitButton>
          </FormActions>
        </Form>
      </Formik>
    </Modal>
  );
}
