"use client";

import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitButton, TextField } from "@/components/form";
import { AuthShell } from "@/components/layout/auth-shell";
import { ROUTES } from "@/constants/routes";
import { loginSchema, type LoginValues } from "@/lib/validation/auth.schemas";
import { useLoginMutation } from "@/services/api";
import { succeeded } from "@/utils/safe-unwrap";

const initialValues: LoginValues = { email: "", password: "" };

export function LoginView() {
  const router = useRouter();
  const [login] = useLoginMutation();

  return (
    <AuthShell
      title="Sign in"
      description="Welcome back. Enter your details to continue."
      footer={
        <>
          New here? <Link href={ROUTES.signup}>Create an account</Link>
        </>
      }
    >
      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={async (values) => {
          if (await succeeded(login(values).unwrap())) router.replace(ROUTES.dashboard);
        }}
      >
        <Form className="grid gap-4" noValidate>
          <TextField name="email" label="Email" type="email" autoComplete="email" />
          <TextField name="password" label="Password" type="password" autoComplete="current-password" />
          <Link href={ROUTES.forgotPassword} className="text-sm text-primary hover:underline">
            Forgot your password?
          </Link>
          <SubmitButton className="w-full">Sign in</SubmitButton>
        </Form>
      </Formik>
    </AuthShell>
  );
}
