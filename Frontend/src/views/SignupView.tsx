"use client";

import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitButton, TextField } from "@/components/form";
import { AuthShell } from "@/components/layout/auth-shell";
import { ROUTES } from "@/constants/routes";
import { signupSchema, type SignupValues } from "@/lib/validation/auth.schemas";
import { useSignupMutation } from "@/services/api";
import { succeeded } from "@/utils/safe-unwrap";

const initialValues: SignupValues = { name: "", email: "", password: "", confirmPassword: "" };

export function SignupView() {
  const router = useRouter();
  const [signup] = useSignupMutation();

  return (
    <AuthShell
      title="Create your workspace"
      description="Sign up, add your website, and we'll crawl and index it."
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
        <Form className="grid gap-4" noValidate>
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
          <SubmitButton className="w-full">Create account</SubmitButton>
        </Form>
      </Formik>
    </AuthShell>
  );
}
