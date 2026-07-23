import { eq } from "drizzle-orm"

import { auth } from "@/auth"
import db from "@/db/drizzle"
import { session, user } from "@/db/schema"

function getBearerToken(req: Request) {
  const authorization = req.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) return null

  const value = authorization.slice("Bearer ".length).trim()
  if (!value) return null

  return value.split(".")[0]
}

export async function getSessionWithBearerFallback(req: Request) {
  const cookieSession = await auth.api.getSession({ headers: req.headers })
  if (cookieSession) return cookieSession

  const token = getBearerToken(req)
  if (!token) return null

  const rows = await db
    .select({ session, user })
    .from(session)
    .innerJoin(user, eq(session.userId, user.id))
    .where(eq(session.token, token))
    .limit(1)

  const match = rows[0]
  if (!match || match.session.expiresAt <= new Date()) return null

  return match
}