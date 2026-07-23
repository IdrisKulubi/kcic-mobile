import { expo } from "@better-auth/expo"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { twoFactor, emailOTP } from "better-auth/plugins"
import db from "./db/drizzle"
import * as schema from "./db/schema"
import { user } from "./db/schema"
import { sendOtpEmail } from "./src/lib/email/send-otp-email"
import { eq } from "drizzle-orm"
import { WEB_CORS_ORIGINS } from "./src/lib/web-cors-origins"

function parseOrigins(value: string | undefined) {
  return (
    value
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []
  )
}

const MOBILE_TRUSTED_ORIGINS = [
  // Mobile app scheme. Must match app.json "expo.scheme" and expoClient.scheme.
  "kcicmobile://",
  "kcicmobile:///",
  "kcicmobile://*",
  "kcicmobile://**",

  // Expo Go / dev-client callbacks. Keep exact local IPs here when testing
  // against a hosted backend, because Better Auth validates callbackURL.
  "exp://",
  "exp://*",
  "exp://**",
  "exps://",
  "exps://*",
  "exps://**",
  "exp://localhost:8081",
  "exp://localhost:8082",
  "exps://localhost:8081",
  "exps://localhost:8082",
  "exp://192.168.*.*:*/**",
  "exps://192.168.*.*:*/**",
  "exp://10.*.*.*:*/**",
  "exps://10.*.*.*:*/**",
  "exp://172.*.*.*:*/**",
  "exps://172.*.*.*:*/**",
  ...parseOrigins(process.env.MOBILE_AUTH_CALLBACK_URLS),
]

const TRUSTED_ORIGINS = [
  ...WEB_CORS_ORIGINS,
  ...MOBILE_TRUSTED_ORIGINS,
  "https://appleid.apple.com",
]

const appleBundleIdentifier = "com.vehem23.kcicmobile"
const appleClientId = process.env.APPLE_CLIENT_ID || appleBundleIdentifier
const appleAudiences = Array.from(
  new Set(
    [
      appleBundleIdentifier,
      process.env.APPLE_APP_BUNDLE_IDENTIFIER,
      process.env.APPLE_CLIENT_ID,
      process.env.APPLE_EXPO_CLIENT_ID,
    ].filter((value): value is string => Boolean(value?.trim()))
  )
)

async function getUserNameByEmail(email: string) {
  const rows = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  return rows[0]?.name
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: TRUSTED_ORIGINS,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    additionalFields: {
      organization: {
        type: "string",
      },
      location: {
        type: "string",
      },
      role: {
        type: "string",
      },
      onboardingCompletedAt: {
        type: "date",
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 90, // 90 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session: { userId: string }) => {
          // Update lastLoginAt when a session is created
          try {
            await db
              .update(user)
              .set({ lastLoginAt: new Date() })
              .where(eq(user.id, session.userId))
          } catch (error) {
            console.error("Failed to update lastLoginAt:", error)
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      prompt: "select_account",
    },
    apple: {
      clientId: appleClientId,
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      appBundleIdentifier: appleBundleIdentifier,
      audience: appleAudiences,
    },
  },
  plugins: [
    expo(),
    {
      id: "kcicmobile-trusted-origins",
      init: () => ({
        options: {
          trustedOrigins: TRUSTED_ORIGINS,
        },
      }),
    },
    emailOTP({
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        try {
          const name = await getUserNameByEmail(email)

          await sendOtpEmail({
            to: email,
            otp,
            purpose: type,
            name,
          })
        } catch (error) {
          console.error("[EMAIL OTP] Error sending email:", error)
        }
      },
    }),
    twoFactor({
      issuer: "KCIC Climate Hub",
      otpOptions: {
        async sendOTP({
          user,
          otp,
        }: {
          user: { email: string; name: string }
          otp: string
        }) {
          await sendOtpEmail({
            to: user.email,
            otp,
            purpose: "two-factor",
            name: user.name,
          })
        },
      },
    }),
  ],
})

console.info("[AUTH] boot", {
  commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  providers: ["google", "apple"],
  appleEnv: {
    clientId: Boolean(process.env.APPLE_CLIENT_ID),
    clientSecret: Boolean(process.env.APPLE_CLIENT_SECRET),
    bundleId: process.env.APPLE_APP_BUNDLE_IDENTIFIER ?? null,
    expoClientId: process.env.APPLE_EXPO_CLIENT_ID ?? null,
  },
})
