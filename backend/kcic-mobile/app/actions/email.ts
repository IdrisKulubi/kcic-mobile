"use server"

import { sendOtpEmail, sendWelcomeEmail } from "@/src/lib/email/send-otp-email"
import type { EmailTemplate, OtpPurpose } from "@/src/lib/email/types"

function assertEmail(value: string) {
  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.")
  }
  return email
}

function assertOtp(value: string) {
  const otp = value.trim()
  if (!/^\d{4,8}$/.test(otp)) {
    throw new Error("Enter a valid verification code.")
  }
  return otp
}

export async function sendOtpEmailAction(input: {
  to: string
  otp: string
  purpose: OtpPurpose | string
  name?: string | null
}) {
  const to = assertEmail(input.to)
  const otp = assertOtp(input.otp)

  await sendOtpEmail({
    to,
    otp,
    purpose: input.purpose,
    name: input.name,
  })

  return { ok: true as const }
}

export async function sendEmailAction(input: {
  to: string
  subject: string
  template: EmailTemplate
  props?: Record<string, unknown>
}) {
  const to = assertEmail(input.to)
  const subject = input.subject.trim()

  if (!subject) {
    throw new Error("Email subject is required.")
  }

  switch (input.template) {
    case "otp": {
      const otp = assertOtp(String(input.props?.otp ?? ""))
      const purpose = String(input.props?.purpose ?? "email-verification")
      const name = typeof input.props?.name === "string" ? input.props.name : null

      await sendOtpEmail({ to, otp, purpose, name })
      break
    }
    case "welcome": {
      const name = typeof input.props?.name === "string" ? input.props.name : null
      await sendWelcomeEmail({ to, name })
      break
    }
    default:
      throw new Error("Unsupported email template.")
  }

  return { ok: true as const }
}
