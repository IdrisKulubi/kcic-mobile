import { Text } from "react-email"

import { KcicEmailLayout } from "./components/kcic-email-layout"
import { kcicDerivedColors } from "./theme"
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
        preview: "Reset your KCIC Insights password",
        heading: "Your reset code",
        body: "Use the code below to reset your KCIC Insights password.",
      }
    case "sign-in":
      return {
        preview: "Your KCIC Insights sign-in code",
        heading: "Your sign-in code",
        body: "Use the code below to finish signing in to KCIC Insights.",
      }
    case "change-email":
      return {
        preview: "Confirm your new email address",
        heading: "Confirm your email",
        body: "Use the code below to confirm your new email address.",
      }
    case "two-factor":
      return {
        preview: "Your KCIC Insights security code",
        heading: "Security code",
        body: "Use the code below to complete your security check.",
      }
    default:
      return {
        preview: "Verify your KCIC Insights email",
        heading: "Verify your email",
        body: "Use the code below to verify your KCIC Insights account.",
      }
  }
}

export function OtpEmail({ otp, purpose }: OtpEmailProps) {
  const copy = getPurposeCopy(purpose)

  return (
    <KcicEmailLayout
      preview={copy.preview}
      heading={copy.heading}
      securityNote="If you didn't request this, please ignore this email. This code expires in 10 minutes.">
      <Text className="font-16 text-fg m-0 mb-6 max-w-[480px] font-sans">{copy.body}</Text>
      <Text
        className="font-32 m-0 font-sans"
        style={{
          color: kcicDerivedColors.fgStrong,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "6px",
        }}>
        {otp}
      </Text>
    </KcicEmailLayout>
  )
}

export default OtpEmail

OtpEmail.PreviewProps = {
  otp: "482916",
  purpose: "email-verification",
  name: "Idris Kulubi",
  email: "idris@kcic.co.ke",
} satisfies OtpEmailProps
