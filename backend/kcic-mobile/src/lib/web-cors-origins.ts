function parseOrigins(value: string | undefined) {
  return (
    value
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []
  )
}

export const WEB_CORS_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.BETTER_AUTH_URL,
  ...parseOrigins(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
].filter((origin): origin is string => Boolean(origin))