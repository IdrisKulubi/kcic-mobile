import { getSessionWithBearerFallback } from "@/lib/security"

export type ContentResource = "news" | "programmes" | "opportunities"

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ContentValidationError"
  }
}

const resourceFields: Record<ContentResource, readonly string[]> = {
  news: [
    "title",
    "excerpt",
    "content",
    "thumbnail",
    "category",
    "slug",
    "readTime",
    "featured",
    "publishedAt",
  ],
  programmes: [
    "title",
    "slug",
    "description",
    "image",
    "headerImage",
    "color",
    "order",
    "isActive",
    "category",
    "applicationLink",
    "introduction",
    "applicationProcess",
    "criteria",
    "eligibility",
    "applicationSelection",
    "technicalSupport",
    "definitions",
    "terms",
    "scoringSystem",
    "fraudPolicy",
  ],
  opportunities: [
    "title",
    "slug",
    "type",
    "referenceNumber",
    "summary",
    "description",
    "department",
    "location",
    "workMode",
    "employmentType",
    "requirements",
    "qualifications",
    "responsibilities",
    "applicationEmail",
    "applicationLink",
    "applicationInstructions",
    "deadline",
    "issuedDate",
    "isActive",
    "isFeatured",
  ],
}

const requiredCreateFields: Record<ContentResource, readonly string[]> = {
  news: ["title", "excerpt", "content", "category", "slug", "publishedAt"],
  programmes: ["title", "slug", "description", "image", "category"],
  opportunities: ["title", "slug", "type", "summary", "description"],
}

const htmlFields = new Set([
  "content",
  "introduction",
  "applicationProcess",
  "criteria",
  "eligibility",
  "applicationSelection",
  "technicalSupport",
  "definitions",
  "terms",
  "scoringSystem",
  "fraudPolicy",
  "description",
  "requirements",
  "qualifications",
  "responsibilities",
  "applicationInstructions",
])

const dateFields = new Set(["publishedAt", "deadline", "issuedDate"])
const urlFields = new Set([
  "thumbnail",
  "image",
  "headerImage",
  "applicationLink",
])

export async function requireAdmin(request: Request) {
  const session = await getSessionWithBearerFallback(request)
  if (!session) return { ok: false as const, status: 401, code: "UNAUTHENTICATED" }
  if (session.user.role !== "admin") {
    return { ok: false as const, status: 403, code: "FORBIDDEN" }
  }
  return { ok: true as const, session }
}

function sanitizeHtml(value: string) {
  return value
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "")
}

function validateUrl(value: string) {
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new ContentValidationError("Invalid URL.")
  }
  if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
    throw new ContentValidationError("Unsupported URL protocol.")
  }
}

export function parseResource(value: string): ContentResource | null {
  return value === "news" ||
    value === "programmes" ||
    value === "opportunities"
    ? value
    : null
}

export async function normalizeContentBody(
  request: Request,
  resource: ContentResource,
  mode: "create" | "update" = "update"
) {
  const body = (await request.json()) as unknown
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ContentValidationError("A JSON object is required.")
  }

  const source = body as Record<string, unknown>
  const result: Record<string, unknown> = {}

  for (const field of resourceFields[resource]) {
    if (!(field in source)) continue
    let value = source[field]

    if (typeof value === "string") {
      let stringValue = value.trim()
      if (htmlFields.has(field)) stringValue = sanitizeHtml(stringValue)
      if (urlFields.has(field) && stringValue) validateUrl(stringValue)
      if (dateFields.has(field) && stringValue) {
        const parsed = new Date(stringValue)
        if (Number.isNaN(parsed.valueOf())) {
          throw new ContentValidationError(`Invalid ${field}.`)
        }
        value = parsed
      } else {
        value = stringValue
      }
    }

    result[field] = value
  }

  if (mode === "create") {
    for (const field of requiredCreateFields[resource]) {
      const value = result[field]
      if (value === undefined || value === null || value === "") {
        throw new ContentValidationError(`${field} is required.`)
      }
    }
  }

  return result
}
