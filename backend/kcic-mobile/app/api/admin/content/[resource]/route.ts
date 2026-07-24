import { asc, desc } from "drizzle-orm"

import db from "@/db/drizzle"
import { news, opportunities, programmes } from "@/db/content-schema"
import {
  ContentValidationError,
  normalizeContentBody,
  parseResource,
  requireAdmin,
} from "@/src/lib/content/admin"
import {
  contentError,
  contentJson,
  contentOptions,
} from "@/src/lib/content/http"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resource: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.ok) {
    return contentJson(request, { code: auth.code }, { status: auth.status })
  }

  try {
    const resource = parseResource((await params).resource)
    if (!resource) {
      return contentJson(request, { code: "NOT_FOUND" }, { status: 404 })
    }

    const items =
      resource === "news"
        ? await db.select().from(news).orderBy(desc(news.publishedAt))
        : resource === "programmes"
          ? await db.select().from(programmes).orderBy(asc(programmes.order))
          : await db
              .select()
              .from(opportunities)
              .orderBy(desc(opportunities.createdAt))

    return contentJson(request, { items })
  } catch (error) {
    return contentError(request, error)
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ resource: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.ok) {
    return contentJson(request, { code: auth.code }, { status: auth.status })
  }

  try {
    const resource = parseResource((await params).resource)
    if (!resource) {
      return contentJson(request, { code: "NOT_FOUND" }, { status: 404 })
    }

    const body = await normalizeContentBody(request, resource, "create")
    const id = crypto.randomUUID()

    const item =
      resource === "news"
        ? (
            await db
              .insert(news)
              .values({ id, ...(body as Omit<typeof news.$inferInsert, "id">) })
              .returning()
          )[0]
        : resource === "programmes"
          ? (
              await db
                .insert(programmes)
                .values({
                  id,
                  ...(body as Omit<typeof programmes.$inferInsert, "id">),
                })
                .returning()
            )[0]
          : (
              await db
                .insert(opportunities)
                .values({
                  id,
                  ...(body as Omit<typeof opportunities.$inferInsert, "id">),
                })
                .returning()
            )[0]

    return contentJson(request, { item }, { status: 201 })
  } catch (error) {
    if (
      error instanceof ContentValidationError ||
      error instanceof SyntaxError ||
      error instanceof TypeError
    ) {
      return contentJson(
        request,
        { code: "INVALID_CONTENT", message: error.message },
        { status: 400 }
      )
    }
    return contentError(request, error)
  }
}

export const OPTIONS = contentOptions
