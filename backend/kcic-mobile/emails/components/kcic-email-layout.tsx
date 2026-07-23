import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email"
import type { ReactNode } from "react"

import { getLogoDataUri } from "../logo"
import { KcicFonts } from "../theme-fonts"
import { brandAssets, kcicBoxedTailwindConfig, kcicBrandColors, kcicDerivedColors } from "../theme"

interface KcicEmailLayoutProps {
  preview: string
  heading: string
  children: ReactNode
  action?: {
    label: string
    href: string
  }
  securityNote?: string
  showUnsubscribe?: boolean
}

export function KcicEmailLayout({
  preview,
  heading,
  children,
  action,
  securityNote,
  showUnsubscribe = false,
}: KcicEmailLayoutProps) {
  const logoSrc = getLogoDataUri()

  return (
    <Tailwind config={kcicBoxedTailwindConfig}>
      <Html>
        <Head>
          <KcicFonts />
        </Head>

        <Body className="m-0 bg-bg font-sans" style={body}>
          <Preview>{preview}</Preview>
          <Container className="mx-auto w-full max-w-[640px]">
            <Section className="bg-bg px-10 py-10" style={card}>
              {logoSrc ? (
                <Img src={logoSrc} alt="KCIC" width={48} height={48} className="mb-10" />
              ) : (
                <Text className="font-24 text-brand m-0 mb-10 font-sans font-bold">KCIC</Text>
              )}

              <Heading
                as="h1"
                className="font-28 text-brand m-0 mb-5 font-sans"
                style={{ color: kcicBrandColors.green }}>
                {heading}
              </Heading>

              <Section className="text-left">{children}</Section>

              {action ? (
                <Section className="mt-8 text-left">
                  <Button
                    href={action.href}
                    className="font-16 inline-block rounded-[6px] px-6 py-3 text-center font-sans font-semibold leading-6"
                    style={{
                      backgroundColor: kcicBrandColors.green,
                      color: kcicBrandColors.white,
                    }}>
                    {action.label}
                  </Button>
                </Section>
              ) : null}

              {securityNote ? (
                <Text className="font-13 text-fg-2 m-0 mt-6 max-w-[480px] font-sans">
                  {securityNote}
                </Text>
              ) : null}

              <Hr className="border-stroke my-10" style={{ borderColor: kcicDerivedColors.stroke }} />

              <Text className="font-13 text-fg-2 m-0 mb-5 max-w-[400px] font-sans">
                {brandAssets.tagline}
              </Text>

              <Text className="font-13 text-fg m-0 mb-5 font-sans">
                <Link href={brandAssets.social.x} style={footerLink}>
                  X
                </Link>
                <Link href={brandAssets.social.linkedin} style={footerLink}>
                  LinkedIn
                </Link>
                <Link href={brandAssets.social.facebook} style={footerLink}>
                  Facebook
                </Link>
                <Link href={brandAssets.social.youtube} style={footerLinkLast}>
                  YouTube
                </Link>
              </Text>

              <Text className="font-13 text-fg-2 m-0 font-sans">
                {brandAssets.address[0]}
                <br />
                {brandAssets.address[1]}
              </Text>

              {showUnsubscribe ? (
                <Text className="font-13 text-fg-2 m-0 mt-5 font-sans">
                  You received this because you created a KCIC Climate Hub account.
                </Text>
              ) : null}
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

const body: React.CSSProperties = {
  margin: 0,
  padding: "32px 16px",
}

const card: React.CSSProperties = {
  border: `1px solid ${kcicDerivedColors.stroke}`,
  borderRadius: "8px",
}

const footerLink: React.CSSProperties = {
  color: kcicDerivedColors.fg,
  marginRight: "16px",
  textDecoration: "underline",
}

const footerLinkLast: React.CSSProperties = {
  color: kcicDerivedColors.fg,
  textDecoration: "underline",
}
