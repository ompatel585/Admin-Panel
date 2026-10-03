"use client";

import { Form, Formik } from "formik";
import {
  CheckboxField,
  FormActions,
  SelectField,
  SubmitButton,
  TextField,
  formStyles,
} from "@/components/form";
import { Button, Modal } from "@/components/ui";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserValues,
  type UpdateUserValues,
} from "@/lib/validation/users.schemas";
import { useCreateUserMutation, useUpdateUserMutation } from "@/services/api";
import type { RoleOption } from "@/types/role";
import type { User } from "@/types/user";
import { succeeded } from "@/utils/safe-unwrap";

interface UserFormModalProps {
  open: boolean;
  /** Present when editing; absent when creating. */
  user?: User | null;
  roleOptions: RoleOption[];
  onClose: () => void;
}

export function UserFormModal({ open, user, roleOptions, onClose }: UserFormModalProps) {
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const roleSelectOptions = roleOptions.map((role) => ({ value: role.id, label: role.name }));

  return (
    <Modal open={open} title={user ? "Edit user" : "New user"} onClose={onClose}>
      {user ? (
        <Formik<UpdateUserValues>
          initialValues={{ name: user.name, email: user.email }}
          validationSchema={updateUserSchema}
          onSubmit={async (values) => {
            if (await succeeded(updateUser({ id: user.id, ...values }).unwrap())) onClose();
          }}
        >
          <Form className={formStyles.form} noValidate>
            <TextField name="name" label="Full name" autoComplete="off" />
            <TextField name="email" label="Email" type="email" autoComplete="off" />
            <FormActions>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton>Save changes</SubmitButton>
            </FormActions>
          </Form>
        </Formik>
      ) : (
        <Formik<CreateUserValues>
          initialValues={{
            name: "",
            email: "",
            password: "",
            roleId: "",
            isActive: true,
          }}
          validationSchema={createUserSchema}
          onSubmit={async (values) => {
            if (await succeeded(createUser(values).unwrap())) onClose();
          }}
        >
          <Form className={formStyles.form} noValidate>
            <TextField name="name" label="Full name" autoComplete="off" />
            <TextField name="email" label="Email" type="email" autoComplete="off" />
            <TextField
              name="password"
              label="Initial password"
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters, with a letter and a number."
            />
            <SelectField name="roleId" label="Role" options={roleSelectOptions} placeholder="Select a role" />
            <CheckboxField name="isActive" label="Active" description="Inactive users cannot sign in." />
            <FormActions>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton>Create user</SubmitButton>
            </FormActions>
          </Form>
        </Formik>
      )}
    </Modal>
  );
}
