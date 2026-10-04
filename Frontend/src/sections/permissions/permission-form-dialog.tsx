"use client";

import { Form, Formik } from "formik";
import { useMemo } from "react";
import { SubmitButton, SwitchField, TextAreaField, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export function PermissionFormDialog({ state, onClose }: { state: PermissionModalState; onClose: () => void }) {
  const [createPermission] = useCreatePermissionMutation();
  const [updatePermission] = useUpdatePermissionMutation();
  const parent = state.type === "create-sub" ? state.parent : undefined;
  const createSchema = useMemo(() => buildPermissionSchema(parent?.key), [parent?.key]);

  if (state.type === "edit") {
    const { permission } = state;
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {permission.key}</DialogTitle>
            <DialogDescription>The key can&apos;t be changed after creation.</DialogDescription>
          </DialogHeader>
          <Formik<UpdatePermissionValues>
            initialValues={{ name: permission.name, description: permission.description, isActive: permission.isActive }}
            validationSchema={updatePermissionSchema}
            onSubmit={async (values) => {
              if (await succeeded(updatePermission({ id: permission.id, ...values }).unwrap())) onClose();
            }}
          >
            <Form className="grid gap-4" noValidate>
              <TextField name="name" label="Name" autoComplete="off" />
              <TextAreaField name="description" label="Description" />
              <SwitchField
                name="isActive"
                label="Active"
                description={
                  permission.isSystem
                    ? "System permissions can't be deactivated."
                    : "Inactive permissions are ignored when checking access."
                }
                disabled={permission.isSystem}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <SubmitButton>Save changes</SubmitButton>
              </DialogFooter>
            </Form>
          </Formik>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{parent ? `New permission in ${parent.name}` : "New module"}</DialogTitle>
          <DialogDescription>
            New permissions can be granted to roles straight away; code only needs to check the key.
          </DialogDescription>
        </DialogHeader>
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
          <Form className="grid gap-4" noValidate>
            <TextField name="name" label="Name" autoComplete="off" />
            <TextField
              name="key"
              label="Key"
              autoComplete="off"
              hint={
                parent
                  ? `Must start with "${parent.key}." — e.g. ${parent.key}.export. Can't be changed later.`
                  : "Lowercase, e.g. reports. Can't be changed later."
              }
            />
            <TextAreaField name="description" label="Description" />
            <SwitchField name="isActive" label="Active" />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton>Create permission</SubmitButton>
            </DialogFooter>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
