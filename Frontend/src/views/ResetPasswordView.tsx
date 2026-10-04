"use client";

import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitButton, TextField } from "@/components/form";
import { AuthShell } from "@/components/layout/auth-shell";
import { ROUTES } from "@/constants/routes";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation/auth.schemas";
import { useResetPasswordMutation } from "@/services/api";
import { succeeded } from "@/utils/safe-unwrap";

const initialValues: ResetPasswordValues = { password: "", confirmPassword: "" };

export function ResetPasswordView() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [resetPassword] = useResetPasswordMutation();

  if (!token) {
    return (
      <AuthShell title="Invalid reset link" footer={<Link href={ROUTES.forgotPassword}>Request a new link</Link>}>
        <p className="text-sm">This password reset link is missing its token. Request a new one to continue.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" footer={<Link href={ROUTES.login}>Back to sign in</Link>}>
      <Formik
        initialValues={initialValues}
        validationSchema={resetPasswordSchema}
        onSubmit={async ({ password }) => {
          if (await succeeded(resetPassword({ token, password }).unwrap())) router.replace(ROUTES.login);
        }}
      >
        <Form className="grid gap-4" noValidate>
          <TextField
            name="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters, with a letter and a number."
          />
          <TextField name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" />
          <SubmitButton className="w-full">Update password</SubmitButton>
        </Form>
      </Formik>
    </AuthShell>
  );
}
