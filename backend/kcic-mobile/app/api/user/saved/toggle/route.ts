import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import db from "@/db/drizzle"
import { savedItem } from "@/db/schema"
import { getSessionWithBearerFallback } from "@/lib/security"
import { isValidItemKey, normalizeItemKey } from "@/src/lib/saved/validate"

export async function POST(req: Request) {
  const authSession = await getSessionWithBearerFallback(req)

  if (!authSession) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Authentication required." },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { code: "INVALID_BODY", message: "Request body must be valid JSON." },
      { status: 400 }
    )
  }

  const rawKey =
    typeof body === "object" && body && "itemKey" in body
      ? (body as { itemKey?: unknown }).itemKey
      : undefined

  if (!isValidItemKey(rawKey)) {
    return NextResponse.json(
      { code: "INVALID_ITEM_KEY", message: "itemKey is invalid." },
      { status: 400 }
    )
  }

  const itemKey = normalizeItemKey(rawKey)
  const userId = authSession.user.id

  const existing = await db
    .select({ id: savedItem.id })
    .from(savedItem)
    .where(and(eq(savedItem.userId, userId), eq(savedItem.itemKey, itemKey)))
    .limit(1)

  if (existing[0]) {
    await db
      .delete(savedItem)
      .where(and(eq(savedItem.userId, userId), eq(savedItem.itemKey, itemKey)))

    return NextResponse.json({ saved: false })
  }

  await db.insert(savedItem).values({
    id: crypto.randomUUID(),
    userId,
    itemKey,
  })

  return NextResponse.json({ saved: true })
}
