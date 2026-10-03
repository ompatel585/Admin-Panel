/** Form (Yup) validation copy, shared by every schema in `lib/validation`. */
export const VALIDATION_MESSAGES = {
  required: (label: string) => `${label} is required`,
  email: "Enter a valid email address",
  minLength: (label: string, min: number) => `${label} must be at least ${min} characters`,
  maxLength: (label: string, max: number) => `${label} must be at most ${max} characters`,
  passwordLetter: "Password must contain a letter",
  passwordNumber: "Password must contain a number",
  passwordMatch: "Passwords do not match",
  permissionKey: "Use lowercase letters, numbers and underscores, e.g. reports",
  subPermissionKey: (parentKey: string) => `Key must start with "${parentKey}."`,
} as const;
