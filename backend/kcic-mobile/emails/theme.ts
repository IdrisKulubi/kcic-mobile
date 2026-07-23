import type { TailwindConfig } from "react-email"
import plugin from "tailwindcss/plugin"

/** Canonical KCIC brand colors — single source for email templates */
export const kcicBrandColors = {
  green: "#80C738",
  gray: "#8B8D90",
  white: "#FFFFFF",
  blue: "#00ADDD",
  brown: "#E97451",
} as const

/**
 * Neutrals tinted toward brand green (not pure gray).
 * Soft washes for committed accent surfaces.
 */
export const kcicDerivedColors = {
  fg: "#3F4A3A",
  fgStrong: "#2C3528",
  bgPanel: "#F2F6ED",
  stroke: "#DCE6D4",
  strokeStrong: "#C8D4BE",
  logoSurface: "#2C3528",
  washGreen: "#E8F5D6",
  washBlue: "#E5F6FB",
  washBrown: "#FCEEE8",
} as const

const colors = {
  bg: kcicBrandColors.white,
  "bg-2": kcicDerivedColors.bgPanel,
  "bg-wash-green": kcicDerivedColors.washGreen,
  "bg-wash-blue": kcicDerivedColors.washBlue,
  "bg-wash-brown": kcicDerivedColors.washBrown,
  fg: kcicDerivedColors.fg,
  "fg-strong": kcicDerivedColors.fgStrong,
  "fg-2": kcicBrandColors.gray,
  "fg-3": kcicBrandColors.gray,
  "fg-inverted": kcicBrandColors.white,
  stroke: kcicDerivedColors.stroke,
  "stroke-strong": kcicDerivedColors.strokeStrong,
  brand: kcicBrandColors.green,
  accent: kcicBrandColors.blue,
  warm: kcicBrandColors.brown,
  "logo-surface": kcicDerivedColors.logoSurface,
} as const

const fontScale = {
  11: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.2px",
    lineHeight: "1.4",
  },
  13: {
    fontSize: "13px",
    fontWeight: "420",
    letterSpacing: "-0.02px",
    lineHeight: "1.5",
  },
  14: { fontSize: "14px", fontWeight: "450", lineHeight: "1.55" },
  16: {
    fontSize: "16px",
    fontWeight: "420",
    letterSpacing: "-0.02px",
    lineHeight: "1.55",
  },
  18: {
    fontSize: "18px",
    fontWeight: "500",
    letterSpacing: "-0.03px",
    lineHeight: "1.45",
  },
  24: {
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "-0.4px",
    lineHeight: "1.2",
  },
  28: {
    fontSize: "28px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    lineHeight: "1.2",
  },
  32: {
    fontSize: "36px",
    fontWeight: "800",
    letterSpacing: "8px",
    lineHeight: "1.15",
  },
  40: {
    fontSize: "40px",
    fontWeight: "800",
    letterSpacing: "-0.8px",
    lineHeight: "1.1",
  },
} as const

export const kcicBoxedTailwindConfig: TailwindConfig = {
  plugins: [
    plugin(({ addUtilities, addVariant }) => {
      addVariant("mobile", "@media (max-width: 600px)")
      const utilities: Record<string, Record<string, string>> = {}
      for (const [step, token] of Object.entries(fontScale)) {
        utilities[`.font-${step}`] = token
      }
      addUtilities(utilities)
    }),
  ],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ["Inter", "system-ui", "Arial", "sans-serif"],
      },
    },
  },
}

export const brandAssets = {
  companyName: "KCIC Climate Hub",
  tagline: "Climate innovation. Enterprise. Impact.",
  address: ["Kenya Climate Innovation Center", "Nairobi, Kenya"],
  social: {
    x: "https://x.com/KCICKenya",
    linkedin: "https://www.linkedin.com/company/kenyaclimateinnovationcenter",
    facebook: "https://www.facebook.com/ClimateInnovationCenter",
    youtube: "https://www.youtube.com/@KenyaClimateInnovationCenter",
  },
} as const

export function getEmailBaseUrl() {
  if (process.env.BETTER_AUTH_URL?.trim()) {
    return process.env.BETTER_AUTH_URL.trim().replace(/\/$/, "")
  }
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`
  }
  return "http://localhost:3000"
}
