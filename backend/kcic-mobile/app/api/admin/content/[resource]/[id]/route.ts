import { eq } from "drizzle-orm"

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

type Params = Promise<{ resource: string; id: string }>

export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  const auth = await requireAdmin(request)
  if (!auth.ok) {
    return contentJson(request, { code: auth.code }, { status: auth.status })
  }

  try {
    const { resource: resourceName, id } = await params
    const resource = parseResource(resourceName)
    if (!resource) {
      return contentJson(request, { code: "NOT_FOUND" }, { status: 404 })
    }

    const body = await normalizeContentBody(request, resource)
    const updatedAt = new Date()
    const item =
      resource === "news"
        ? (
            await db
              .update(news)
              .set({
                ...(body as Partial<typeof news.$inferInsert>),
                updatedAt,
              })
              .where(eq(news.id, id))
              .returning()
          )[0]
        : resource === "programmes"
          ? (
              await db
                .update(programmes)
                .set({
                  ...(body as Partial<typeof programmes.$inferInsert>),
                  updatedAt,
                })
                .where(eq(programmes.id, id))
                .returning()
            )[0]
          : (
              await db
                .update(opportunities)
                .set({
                  ...(body as Partial<typeof opportunities.$inferInsert>),
                  updatedAt,
                })
                .where(eq(opportunities.id, id))
                .returning()
            )[0]

    return item
      ? contentJson(request, { item })
      : contentJson(request, { code: "NOT_FOUND" }, { status: 404 })
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

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  const auth = await requireAdmin(request)
  if (!auth.ok) {
    return contentJson(request, { code: auth.code }, { status: auth.status })
  }

  try {
    const { resource: resourceName, id } = await params
    const resource = parseResource(resourceName)
    if (!resource) {
      return contentJson(request, { code: "NOT_FOUND" }, { status: 404 })
    }

    const deleted =
      resource === "news"
        ? await db.delete(news).where(eq(news.id, id)).returning({ id: news.id })
        : resource === "programmes"
          ? await db
              .delete(programmes)
              .where(eq(programmes.id, id))
              .returning({ id: programmes.id })
          : await db
              .delete(opportunities)
              .where(eq(opportunities.id, id))
              .returning({ id: opportunities.id })

    return deleted[0]
      ? contentJson(request, { id: deleted[0].id })
      : contentJson(request, { code: "NOT_FOUND" }, { status: 404 })
  } catch (error) {
    return contentError(request, error)
  }
}

export const OPTIONS = contentOptions
