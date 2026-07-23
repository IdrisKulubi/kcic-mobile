import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder")
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL?.trim().toLowerCase() || "onboarding@resend.dev"

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const result = await resend.emails.send({
    from: resendFromEmail,
    to: input.to,
    subject: input.subject,
    html: input.html,
  })

  if (result.error) {
    console.error("[RESEND] Email send failed:", result.error)

    const fromDomain = resendFromEmail.split("@")[1] || resendFromEmail
    throw new Error(
      `Failed to send email from ${resendFromEmail}. Check that the sender/domain is verified in Resend (domain: ${fromDomain}).`
    )
  }

  return result
}
