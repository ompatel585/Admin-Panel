import * as yup from "yup";
import { VALIDATION_MESSAGES as msg } from "@/constants/messages";

/**
 * MASTER validation rules. Section schemas (`auth.schemas.ts`, ...) compose
 * these building blocks, so a rule like "what is a valid password" exists once
 * and mirrors the API's policy.
 */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

export const rules = {
  text: (label: string, max = 100) =>
    yup
      .string()
      .trim()
      .required(msg.required(label))
      .max(max, msg.maxLength(label, max)),

  optionalText: (label: string, max = 200) =>
    yup.string().trim().max(max, msg.maxLength(label, max)),

  email: () => yup.string().trim().required(msg.required("Email")).email(msg.email),

  password: (label = "Password") =>
    yup
      .string()
      .required(msg.required(label))
      .min(PASSWORD_MIN, msg.minLength(label, PASSWORD_MIN))
      .max(PASSWORD_MAX, msg.maxLength(label, PASSWORD_MAX))
      .matches(/[A-Za-z]/, msg.passwordLetter)
      .matches(/\d/, msg.passwordNumber),

  /** Login only needs "something was typed"; strength is not re-checked there. */
  anyPassword: (label = "Password") => yup.string().required(msg.required(label)),

  confirmPassword: (field: string) =>
    yup
      .string()
      .required(msg.required("Confirm password"))
      .oneOf([yup.ref(field)], msg.passwordMatch),

  requiredSelect: (label: string) => yup.string().required(msg.required(label)),

  boolean: () => yup.boolean().required(),
};
