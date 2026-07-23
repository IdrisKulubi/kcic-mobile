import { Text } from "@react-email/components"

import { EmailLayout } from "./components/email-layout"
import { OtpCode } from "./components/otp-code"
import type { OtpPurpose } from "@/src/lib/email/types"

export interface OtpEmailProps {
  otp: string
  purpose: OtpPurpose | string
  name?: string | null
  email: string
}

function getPurposeCopy(purpose: OtpPurpose | string) {
  switch (purpose) {
    case "forget-password":
      return {
        preview: "Reset your KCIC Climate Hub password",
        action: "reset your password",
        expiry: "This code expires in 10 minutes.",
      }
    case "sign-in":
      return {
        preview: "Your KCIC Climate Hub sign-in code",
        action: "sign in to KCIC Climate Hub",
        expiry: "This code expires in 10 minutes.",
      }
    case "change-email":
      return {
        preview: "Confirm your new email address",
        action: "confirm your new email address",
        expiry: "This code expires in 10 minutes.",
      }
    case "two-factor":
      return {
        preview: "Your KCIC Climate Hub security code",
        action: "complete your security check",
        expiry: "This code expires in 10 minutes.",
      }
  default:
      return {
        preview: "Verify your KCIC Climate Hub email",
        action: "verify your email address",
        expiry: "This code expires in 10 minutes.",
      }
  }
}

export function OtpEmail({ otp, purpose, name }: OtpEmailProps) {
  const greeting = name?.trim() ? `Hello ${name.trim()},` : "Hello,"
  const copy = getPurposeCopy(purpose)

  return (
    <EmailLayout preview={copy.preview}>
      <Text style={greetingStyle}>{greeting}</Text>
      <Text style={bodyText}>Use this code to {copy.action}:</Text>
      <OtpCode code={otp} />
      <Text style={bodyText}>{copy.expiry}</Text>
      <Text style={mutedText}>
        If you did not request this code, you can safely ignore this email.
      </Text>
    </EmailLayout>
  )
}

export default OtpEmail

const greetingStyle: React.CSSProperties = {
  margin: "0 0 12px",
  color: "#111827",
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: "24px",
}

const bodyText: React.CSSProperties = {
  margin: "0 0 8px",
  color: "#111827",
  fontSize: "15px",
  lineHeight: "22px",
}

const mutedText: React.CSSProperties = {
  margin: "16px 0 0",
  color: "#5E6875",
  fontSize: "13px",
  lineHeight: "20px",
}
