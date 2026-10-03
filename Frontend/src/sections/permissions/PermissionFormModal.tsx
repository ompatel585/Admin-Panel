"use client";

import { Form, Formik } from "formik";
import { useMemo } from "react";
import {
  CheckboxField,
  FormActions,
  SubmitButton,
  TextAreaField,
  TextField,
  formStyles,
} from "@/components/form";
import { Button, Modal } from "@/components/ui";
import {
  buildPermissionSchema,
  updatePermissionSchema,
  type PermissionValues,
  type UpdatePermissionValues,
} from "@/lib/validation/permissions.schemas";
import { useCreatePermissionMutation, useUpdatePermissionMutation } from "@/services/api";
import type { PermissionNode } from "@/types/permission";
import { succeeded } from "@/utils/safe-unwrap";

export type PermissionModalState =
  | { type: "create-module" }
  | { type: "create-sub"; parent: PermissionNode }
  | { type: "edit"; permission: PermissionNode };

export function PermissionFormModal({ state, onClose }: { state: PermissionModalState; onClose: () => void }) {
  const [createPermission] = useCreatePermissionMutation();
  const [updatePermission] = useUpdatePermissionMutation();
  const parent = state.type === "create-sub" ? state.parent : undefined;
  const createSchema = useMemo(() => buildPermissionSchema(parent?.key), [parent?.key]);

  if (state.type === "edit") {
    const { permission } = state;
    return (
      <Modal open title={`Edit ${permission.key}`} onClose={onClose}>
        <Formik<UpdatePermissionValues>
          initialValues={{
            name: permission.name,
            description: permission.description,
            isActive: permission.isActive,
          }}
          validationSchema={updatePermissionSchema}
          onSubmit={async (values) => {
            if (await succeeded(updatePermission({ id: permission.id, ...values }).unwrap())) onClose();
          }}
        >
          <Form className={formStyles.form} noValidate>
            <TextField name="name" label="Name" autoComplete="off" />
            <TextAreaField name="description" label="Description" />
            <CheckboxField
              name="isActive"
              label="Active"
              description={
                permission.isSystem
                  ? "System permissions can't be deactivated."
                  : "Inactive permissions are ignored when checking access."
              }
              disabled={permission.isSystem}
            />
            <FormActions>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton>Save changes</SubmitButton>
            </FormActions>
          </Form>
        </Formik>
      </Modal>
    );
  }

  return (
    <Modal open title={parent ? `New sub-permission for ${parent.name}` : "New module permission"} onClose={onClose}>
      <Formik<PermissionValues>
        initialValues={{ name: "", key: parent ? `${parent.key}.` : "", description: "", isActive: true }}
        validationSchema={createSchema}
        onSubmit={async (values) => {
          const request = createPermission({
            name: values.name,
            key: values.key,
            description: values.description || undefined,
            isActive: values.isActive,
            parentId: parent?.id,
          });
          if (await succeeded(request.unwrap())) onClose();
        }}
      >
        <Form className={formStyles.form} noValidate>
          <TextField name="name" label="Name" autoComplete="off" />
          <TextField
            name="key"
            label="Key"
            autoComplete="off"
            hint={
              parent
                ? `Must start with "${parent.key}." — e.g. ${parent.key}.export. Cannot be changed later.`
                : "Lowercase, e.g. reports. Cannot be changed later."
            }
          />
          <TextAreaField name="description" label="Description" />
          <CheckboxField name="isActive" label="Active" />
          <FormActions>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <SubmitButton>Create permission</SubmitButton>
          </FormActions>
        </Form>
      </Formik>
    </Modal>
  );
}
