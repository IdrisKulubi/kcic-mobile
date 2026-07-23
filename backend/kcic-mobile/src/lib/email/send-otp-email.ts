import { renderOtpEmailHtml, renderWelcomeEmailHtml } from "@/src/lib/email/render"
import { sendEmail } from "@/src/lib/email/send-email"
import type { OtpPurpose } from "@/src/lib/email/types"

export function getOtpEmailSubject(purpose: OtpPurpose | string) {
  switch (purpose) {
    case "forget-password":
      return "Reset your KCIC Climate Hub password"
    case "sign-in":
      return "Your KCIC Climate Hub sign-in code"
    case "change-email":
      return "Confirm your new email address"
    case "two-factor":
      return "Your KCIC Climate Hub security code"
    default:
      return "Verify your email address"
  }
}

export async function sendOtpEmail(input: {
  to: string
  otp: string
  purpose: OtpPurpose | string
  name?: string | null
}) {
  const html = await renderOtpEmailHtml({
    otp: input.otp,
    purpose: input.purpose,
    name: input.name,
    email: input.to,
  })

  await sendEmail({
    to: input.to,
    subject: getOtpEmailSubject(input.purpose),
    html,
  })
}

export async function sendWelcomeEmail(input: { to: string; name?: string | null }) {
  const html = await renderWelcomeEmailHtml({ name: input.name })

  await sendEmail({
    to: input.to,
    subject: "Welcome to KCIC Climate Hub",
    html,
  })
}
