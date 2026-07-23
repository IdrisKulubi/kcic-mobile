import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

const colors = {
  shell: "#F6F8FF",
  white: "#FEFFFC",
  ink: "#111827",
  slate: "#5E6875",
  forest: "#006B45",
  line: "#DDE7D8",
}

interface EmailLayoutProps {
  preview: string
  title?: string
  children: ReactNode
}

export function EmailLayout({ preview, title, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brandEyebrow}>KCIC CLIMATE HUB</Text>
            {title ? <Heading style={brandTitle}>{title}</Heading> : null}
          </Section>

          <Section style={panel}>{children}</Section>

          <Hr style={divider} />
          <Text style={footer}>Climate innovation. Enterprise. Impact.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  margin: 0,
  backgroundColor: colors.shell,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px 20px",
}

const header: React.CSSProperties = {
  marginBottom: "20px",
}

const brandEyebrow: React.CSSProperties = {
  margin: "0 0 8px",
  color: colors.forest,
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1.4px",
}

const brandTitle: React.CSSProperties = {
  margin: 0,
  color: colors.ink,
  fontSize: "24px",
  fontWeight: 800,
  lineHeight: "30px",
}

const panel: React.CSSProperties = {
  backgroundColor: colors.white,
  border: `1px solid ${colors.line}`,
  borderRadius: "16px",
  padding: "28px 24px",
}

const divider: React.CSSProperties = {
  borderColor: colors.line,
  margin: "24px 0 16px",
}

const footer: React.CSSProperties = {
  margin: 0,
  color: colors.slate,
  fontSize: "11px",
  letterSpacing: "1.1px",
  textAlign: "center",
  textTransform: "uppercase",
}
