import { Button, Text } from "@react-email/components"

import { EmailLayout } from "./components/email-layout"

export interface WelcomeEmailProps {
  name?: string | null
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const greeting = name?.trim() ? `Welcome, ${name.trim()}.` : "Welcome to KCIC Climate Hub."

  return (
    <EmailLayout preview="Welcome to KCIC Climate Hub" title="You're in">
      <Text style={greetingStyle}>{greeting}</Text>
      <Text style={bodyText}>
        Your account is ready. Explore insights, events, and opportunities across Kenya&apos;s
        climate innovation ecosystem.
      </Text>
      <Button href="https://kcic.co.ke" style={button}>
        Open KCIC Climate Hub
      </Button>
    </EmailLayout>
  )
}

export default WelcomeEmail

const greetingStyle: React.CSSProperties = {
  margin: "0 0 12px",
  color: "#111827",
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: "24px",
}

const bodyText: React.CSSProperties = {
  margin: "0 0 20px",
  color: "#5E6875",
  fontSize: "15px",
  lineHeight: "22px",
}

const button: React.CSSProperties = {
  backgroundColor: "#80C738",
  borderRadius: "999px",
  color: "#FEFFFC",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 700,
  padding: "12px 24px",
  textDecoration: "none",
}
