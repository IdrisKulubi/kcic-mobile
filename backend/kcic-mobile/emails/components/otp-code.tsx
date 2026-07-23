import { Section, Text } from "@react-email/components"

interface OtpCodeProps {
  code: string
}

export function OtpCode({ code }: OtpCodeProps) {
  return (
    <Section style={wrap}>
      <Text style={codeText}>{code}</Text>
    </Section>
  )
}

const wrap: React.CSSProperties = {
  margin: "20px 0",
  padding: "18px 16px",
  backgroundColor: "#F3F7F2",
  borderRadius: "12px",
  textAlign: "center",
}

const codeText: React.CSSProperties = {
  margin: 0,
  color: "#006B45",
  fontSize: "34px",
  fontWeight: 800,
  letterSpacing: "8px",
  lineHeight: "40px",
}
