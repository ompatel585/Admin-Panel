"use client";

import { Form, Formik } from "formik";
import Link from "next/link";
import { useState } from "react";
import { SubmitButton, TextField, formStyles } from "@/components/form";
import { ROUTES } from "@/constants/routes";
import { AuthLayout } from "@/layouts/AuthLayout";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation/auth.schemas";
import { useForgotPasswordMutation } from "@/services/api";
import { succeeded } from "@/utils/safe-unwrap";

const initialValues: ForgotPasswordValues = { email: "" };

export function ForgotPasswordView() {
  const [forgotPassword] = useForgotPasswordMutation();
  const [sentTo, setSentTo] = useState<string | null>(null);

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to choose a new password."
      footer={<Link href={ROUTES.login}>Back to sign in</Link>}
    >
      {sentTo ? (
        <p>
          If an account exists for <strong>{sentTo}</strong>, a reset link is on its way. The link expires shortly,
          so use it soon.
        </p>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={forgotPasswordSchema}
          onSubmit={async (values) => {
            if (await succeeded(forgotPassword(values).unwrap())) {
              setSentTo(values.email);
            }
          }}
        >
          <Form className={formStyles.form} noValidate>
            <TextField name="email" label="Email" type="email" autoComplete="email" />
            <SubmitButton block>Send reset link</SubmitButton>
          </Form>
        </Formik>
      )}
    </AuthLayout>
  );
}
