import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import db from "@/db/drizzle"
import { user } from "@/db/schema"
import { getSessionWithBearerFallback } from "@/lib/security"
import { serializeUser, validateProfileUpdate } from "@/src/lib/user/validate"

export async function GET(req: Request) {
  const authSession = await getSessionWithBearerFallback(req)

  if (!authSession) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Authentication required." },
      { status: 401 }
    )
  }

  const { user: sessionUser } = authSession

  const [record] = await db
    .select()
    .from(user)
    .where(eq(user.id, sessionUser.id))
    .limit(1)

  if (!record) {
    return NextResponse.json(
      { code: "USER_NOT_FOUND", message: "User not found." },
      { status: 404 }
    )
  }

  return NextResponse.json({
    user: serializeUser(record),
  })
}

export async function PATCH(req: Request) {
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
      { code: "INVALID_JSON", message: "Request body must be valid JSON." },
      { status: 400 }
    )
  }

  const validation = validateProfileUpdate(body)
  if (!validation.ok) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: validation.message },
      { status: 400 }
    )
  }

  const [updated] = await db
    .update(user)
    .set(validation.data)
    .where(eq(user.id, authSession.user.id))
    .returning()

  if (!updated) {
    return NextResponse.json(
      { code: "USER_NOT_FOUND", message: "User not found." },
      { status: 404 }
    )
  }

  return NextResponse.json({
    user: serializeUser(updated),
  })
}
