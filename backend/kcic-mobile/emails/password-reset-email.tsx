import { Text } from "react-email"

import { KcicEmailLayout } from "./components/kcic-email-layout"

export interface PasswordResetEmailProps {
  url: string
  name?: string | null
}

export function PasswordResetEmail({ url }: PasswordResetEmailProps) {
  return (
    <KcicEmailLayout
      preview="Reset your KCIC Climate Hub password"
      heading="Reset your password"
      action={{ label: "Change password", href: url }}
      securityNote="If you didn't request this, please ignore this email. Your password won't change until you access the link above and create a new one.">
      <Text className="font-16 text-fg m-0 max-w-[480px] font-sans">
        Someone requested a password reset for your KCIC Climate Hub account. Use the button
        below to choose a new password.
      </Text>
    </KcicEmailLayout>
  )
}

export default PasswordResetEmail

PasswordResetEmail.PreviewProps = {
  url: "https://kenyacic.org/reset-password",
  name: "Idris Kulubi",
} satisfies PasswordResetEmailProps
