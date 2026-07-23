import { render } from "@react-email/render"
import { createElement } from "react"

import { OtpEmail } from "@/emails/otp-email"
import { PasswordResetEmail } from "@/emails/password-reset-email"
import { WelcomeEmail } from "@/emails/welcome-email"
import type { OtpPurpose } from "@/src/lib/email/types"

export async function renderOtpEmailHtml(input: {
  otp: string
  purpose: OtpPurpose | string
  name?: string | null
  email: string
}) {
  return render(createElement(OtpEmail, input))
}

export async function renderWelcomeEmailHtml(input: { name?: string | null }) {
  return render(createElement(WelcomeEmail, input))
}

export async function renderPasswordResetEmailHtml(input: {
  url: string
  name?: string | null
}) {
  return render(createElement(PasswordResetEmail, input))
}
