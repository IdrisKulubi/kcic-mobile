export type OtpPurpose =
  | "sign-in"
  | "forget-password"
  | "change-email"
  | "email-verification"
  | "two-factor"

export type EmailTemplate = "otp" | "welcome" | "password-reset"
