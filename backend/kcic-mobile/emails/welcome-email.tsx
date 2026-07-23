import { Text } from "react-email"

import { KcicEmailLayout } from "./components/kcic-email-layout"

export interface WelcomeEmailProps {
  name?: string | null
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const greeting = name?.trim() ? `Hi ${name.trim()},` : "Hi there,"

  return (
    <KcicEmailLayout
      preview="Welcome to KCIC Climate Hub"
      heading="Welcome to KCIC"
      showUnsubscribe>
      <Text className="font-16 text-fg m-0 max-w-[480px] font-sans">
        {greeting} your KCIC Climate Hub account is ready. Sign in on the app to explore
        climate innovation resources and connect with the ecosystem.
      </Text>
    </KcicEmailLayout>
  )
}

export default WelcomeEmail

WelcomeEmail.PreviewProps = {
  name: "Idris Kulubi",
} satisfies WelcomeEmailProps
