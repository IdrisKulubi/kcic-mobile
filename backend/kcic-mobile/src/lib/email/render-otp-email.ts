type OtpPurpose =
  | "sign-in"
  | "forget-password"
  | "change-email"
  | "email-verification"
  | "two-factor"

export async function renderOtpEmailHtml(input: {
  otp: string
  purpose: OtpPurpose | string
  name?: string | null
  email: string
}) {
  const greeting = input.name?.trim() ? `Hello ${input.name.trim()},` : "Hello,"
  const purpose =
    input.purpose === "forget-password"
      ? "reset your password"
      : input.purpose === "two-factor"
        ? "complete your security check"
        : "complete your KCIC Climate Hub sign-in"

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f5f7f4;font-family:Arial,sans-serif;color:#101828">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px">
      <div style="background:#ffffff;border:1px solid #e2e9df;padding:28px">
        <p>${greeting}</p>
        <p>Use this code to ${purpose}:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#05734f">${input.otp}</p>
        <p style="color:#667085">If you did not request this code, you can ignore this email.</p>
      </div>
    </div>
  </body>
</html>`
}