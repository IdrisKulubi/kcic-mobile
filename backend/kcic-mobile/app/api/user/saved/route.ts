import { desc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import db from "@/db/drizzle"
import { savedItem } from "@/db/schema"
import { getSessionWithBearerFallback } from "@/lib/security"

export async function GET(req: Request) {
  const authSession = await getSessionWithBearerFallback(req)

  if (!authSession) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Authentication required." },
      { status: 401 }
    )
  }

  const rows = await db
    .select({ itemKey: savedItem.itemKey })
    .from(savedItem)
    .where(eq(savedItem.userId, authSession.user.id))
    .orderBy(desc(savedItem.createdAt))

  return NextResponse.json({
    keys: rows.map((row) => row.itemKey),
  })
}
