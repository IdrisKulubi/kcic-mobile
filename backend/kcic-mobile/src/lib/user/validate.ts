const MAX_NAME_LENGTH = 120
const MAX_ORGANIZATION_LENGTH = 160
const MAX_LOCATION_LENGTH = 120
const MAX_INTEREST_LENGTH = 60
const MAX_INTERESTS = 12

export type ProfileUpdateInput = {
  name?: string
  organization?: string | null
  location?: string | null
  interests?: string[]
}

export function validateProfileUpdate(body: unknown):
  | { ok: true; data: ProfileUpdateInput }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Invalid request body." }
  }

  const record = body as Record<string, unknown>
  const data: ProfileUpdateInput = {}

  if ("name" in record) {
    if (typeof record.name !== "string") {
      return { ok: false, message: "Name must be a string." }
    }
    const name = record.name.trim()
    if (!name) return { ok: false, message: "Name cannot be empty." }
    if (name.length > MAX_NAME_LENGTH) {
      return { ok: false, message: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` }
    }
    data.name = name
  }

  if ("organization" in record) {
    if (record.organization === null) {
      data.organization = null
    } else if (typeof record.organization === "string") {
      const organization = record.organization.trim()
      if (organization.length > MAX_ORGANIZATION_LENGTH) {
        return {
          ok: false,
          message: `Organization must be ${MAX_ORGANIZATION_LENGTH} characters or fewer.`,
        }
      }
      data.organization = organization || null
    } else {
      return { ok: false, message: "Organization must be a string or null." }
    }
  }

  if ("location" in record) {
    if (record.location === null) {
      data.location = null
    } else if (typeof record.location === "string") {
      const location = record.location.trim()
      if (location.length > MAX_LOCATION_LENGTH) {
        return {
          ok: false,
          message: `Location must be ${MAX_LOCATION_LENGTH} characters or fewer.`,
        }
      }
      data.location = location || null
    } else {
      return { ok: false, message: "Location must be a string or null." }
    }
  }

  if ("interests" in record) {
    if (!Array.isArray(record.interests)) {
      return { ok: false, message: "Interests must be an array." }
    }
    if (record.interests.length > MAX_INTERESTS) {
      return { ok: false, message: `You can add up to ${MAX_INTERESTS} interests.` }
    }

    const interests = record.interests
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)

    if (interests.length !== record.interests.length) {
      return { ok: false, message: "Each interest must be a non-empty string." }
    }

    if (interests.some((item) => item.length > MAX_INTEREST_LENGTH)) {
      return {
        ok: false,
        message: `Each interest must be ${MAX_INTEREST_LENGTH} characters or fewer.`,
      }
    }

    data.interests = [...new Set(interests)]
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, message: "No valid fields to update." }
  }

  return { ok: true, data }
}

export function serializeUser(user: {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: string
  organization: string | null
  location: string | null
  interests: string[]
  twoFactorEnabled: boolean | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role,
    organization: user.organization,
    location: user.location,
    interests: user.interests,
    twoFactorEnabled: user.twoFactorEnabled ?? false,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
