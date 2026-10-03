"use client";

import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitButton, TextField, formStyles } from "@/components/form";
import { ROUTES } from "@/constants/routes";
import { AuthLayout } from "@/layouts/AuthLayout";
import { signupSchema, type SignupValues } from "@/lib/validation/auth.schemas";
import { useSignupMutation } from "@/services/api";
import { succeeded } from "@/utils/safe-unwrap";

const initialValues: SignupValues = { name: "", email: "", password: "", confirmPassword: "" };

export function SignupView() {
  const router = useRouter();
  const [signup] = useSignupMutation();

  return (
    <AuthLayout
      title="Create your account"
      footer={
        <>
          Already registered? <Link href={ROUTES.login}>Sign in</Link>
        </>
      }
    >
      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={async ({ name, email, password }) => {
          if (await succeeded(signup({ name, email, password }).unwrap())) router.replace(ROUTES.dashboard);
        }}
      >
        <Form className={formStyles.form} noValidate>
          <TextField name="name" label="Full name" autoComplete="name" />
          <TextField name="email" label="Email" type="email" autoComplete="email" />
          <TextField
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters, with a letter and a number."
          />
          <TextField name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" />
          <SubmitButton block>Create account</SubmitButton>
        </Form>
      </Formik>
    </AuthLayout>
  );
}
