import { NextResponse } from "next/server"

import { WEB_CORS_ORIGINS } from "@/src/lib/web-cors-origins"

export function contentJson(
  request: Request,
  body: unknown,
  init: ResponseInit = {}
) {
  const headers = new Headers(init.headers)
  const origin = request.headers.get("origin")

  if (origin && WEB_CORS_ORIGINS.includes(origin)) {
    headers.set("access-control-allow-origin", origin)
    headers.set("vary", "Origin")
  }

  headers.set("cache-control", "no-store")
  return NextResponse.json(body, { ...init, headers })
}

export function contentOptions(request: Request) {
  return contentJson(request, null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization",
    },
  })
}

export function contentError(request: Request, error: unknown) {
  console.error("[CONTENT API]", error)

  const databaseCode =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code)
      : undefined

  if (databaseCode === "42P01") {
    return contentJson(
      request,
      {
        code: "CONTENT_DATABASE_NOT_READY",
        message:
          "The backend is not connected to the Neon branch containing the imported content tables.",
      },
      { status: 503 }
    )
  }

  if (databaseCode === "23505") {
    return contentJson(
      request,
      { code: "CONTENT_CONFLICT", message: "A record with that slug already exists." },
      { status: 409 }
    )
  }

  return contentJson(
    request,
    { code: "CONTENT_ERROR", message: "Content could not be loaded." },
    { status: 500 }
  )
}
