"use client";

import { Form, Formik } from "formik";
import { SubmitButton, TextField } from "@/components/form";
import { PageHeader } from "@/components/shared/page-header";
import { PageSpinner } from "@/components/shared/page-spinner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordValues,
  type ProfileValues,
} from "@/lib/validation/auth.schemas";
import { useChangePasswordMutation, useUpdateProfileMutation } from "@/services/api";
import { succeeded } from "@/utils/safe-unwrap";

const emptyPasswords: ChangePasswordValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function ProfileView() {
  const { user } = useAuth();
  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();

  if (!user) return <PageSpinner />;

  return (
    <>
      <PageHeader title="Profile" description="Your name, email and password." />

      <Card className="mb-4">
        <CardContent className="flex items-center gap-4">
          <UserAvatar name={user.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              {user.role?.name ?? "No role"}
              {user.tenant && ` · ${user.tenant.name}`}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>How you appear to the rest of your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <Formik<ProfileValues>
              enableReinitialize
              initialValues={{ name: user.name, email: user.email }}
              validationSchema={profileSchema}
              onSubmit={async (values) => {
                await succeeded(updateProfile(values).unwrap());
              }}
            >
              <Form className="grid gap-4" noValidate>
                <TextField name="name" label="Full name" autoComplete="name" />
                <TextField name="email" label="Email" type="email" autoComplete="email" />
                <SubmitButton className="w-fit">Save changes</SubmitButton>
              </Form>
            </Formik>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Use at least 8 characters, with a letter and a number.</CardDescription>
          </CardHeader>
          <CardContent>
            <Formik<ChangePasswordValues>
              initialValues={emptyPasswords}
              validationSchema={changePasswordSchema}
              onSubmit={async ({ currentPassword, newPassword }, { resetForm }) => {
                if (await succeeded(changePassword({ currentPassword, newPassword }).unwrap())) resetForm();
              }}
            >
              <Form className="grid gap-4" noValidate>
                <TextField name="currentPassword" label="Current password" type="password" autoComplete="current-password" />
                <TextField name="newPassword" label="New password" type="password" autoComplete="new-password" />
                <TextField name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" />
                <SubmitButton className="w-fit">Change password</SubmitButton>
              </Form>
            </Formik>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
