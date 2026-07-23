import { NextResponse } from "next/server"

import { getSessionWithBearerFallback } from "@/lib/security"

export async function GET(req: Request) {
  const authSession = await getSessionWithBearerFallback(req)

  if (!authSession) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Authentication required." },
      { status: 401 }
    )
  }

  const { user } = authSession

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      organization: user.organization,
      location: user.location,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  })
}