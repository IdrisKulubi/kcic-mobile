import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  lte,
  or,
} from "drizzle-orm"

import db from "@/db/drizzle"
import {
  news,
  opportunities,
  opportunityAttachments,
  programmes,
  programmeSponsors,
} from "@/db/content-schema"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function parseCursor(value: string | null) {
  if (!value) return 0
  const parsed = Number(Buffer.from(value, "base64url").toString("utf8"))
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.trunc(parsed)
}

function encodeCursor(offset: number, count: number, limit: number) {
  if (count < limit) return null
  return Buffer.from(String(offset + count), "utf8").toString("base64url")
}

export function parseLimit(value: string | null) {
  const parsed = Number(value ?? DEFAULT_LIMIT)
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT
  return Math.min(Math.max(Math.trunc(parsed), 1), MAX_LIMIT)
}

export async function listPublishedNews(searchParams: URLSearchParams) {
  const category = searchParams.get("category")
  const featured = searchParams.get("featured")
  const query = searchParams.get("query")?.trim()
  const limit = parseLimit(searchParams.get("limit"))
  const offset = parseCursor(searchParams.get("cursor"))

  const filters = [
    lte(news.publishedAt, new Date()),
    category ? eq(news.category, category) : undefined,
    featured === "true"
      ? eq(news.featured, true)
      : featured === "false"
        ? eq(news.featured, false)
        : undefined,
    query
      ? or(
          ilike(news.title, `%${query}%`),
          ilike(news.excerpt, `%${query}%`),
          ilike(news.category, `%${query}%`)
        )
      : undefined,
  ].filter(Boolean)

  const items = await db
    .select()
    .from(news)
    .where(and(...filters))
    .orderBy(desc(news.publishedAt), desc(news.id))
    .limit(limit)
    .offset(offset)

  return { items, nextCursor: encodeCursor(offset, items.length, limit) }
}

export async function getPublishedNews(slugOrId: string) {
  return (
    await db
      .select()
      .from(news)
      .where(
        and(
          lte(news.publishedAt, new Date()),
          or(eq(news.slug, slugOrId), eq(news.id, slugOrId))
        )
      )
      .limit(1)
  )[0]
}

export async function listActiveProgrammes(searchParams: URLSearchParams) {
  const category = searchParams.get("category")
  const query = searchParams.get("query")?.trim()
  const limit = parseLimit(searchParams.get("limit"))
  const offset = parseCursor(searchParams.get("cursor"))

  const filters = [
    eq(programmes.isActive, true),
    category ? eq(programmes.category, category) : undefined,
    query
      ? or(
          ilike(programmes.title, `%${query}%`),
          ilike(programmes.description, `%${query}%`)
        )
      : undefined,
  ].filter(Boolean)

  const items = await db
    .select()
    .from(programmes)
    .where(and(...filters))
    .orderBy(asc(programmes.order), asc(programmes.title))
    .limit(limit)
    .offset(offset)

  return { items, nextCursor: encodeCursor(offset, items.length, limit) }
}

export async function getActiveProgramme(slugOrId: string) {
  const item = (
    await db
      .select()
      .from(programmes)
      .where(
        and(
          eq(programmes.isActive, true),
          or(eq(programmes.slug, slugOrId), eq(programmes.id, slugOrId))
        )
      )
      .limit(1)
  )[0]

  if (!item) return undefined

  const sponsors = await db
    .select()
    .from(programmeSponsors)
    .where(eq(programmeSponsors.programmeId, item.id))
    .orderBy(asc(programmeSponsors.order))

  return { ...item, sponsors }
}

export async function listActiveOpportunities(searchParams: URLSearchParams) {
  const type = searchParams.get("type")
  const featured = searchParams.get("featured")
  const query = searchParams.get("query")?.trim()
  const limit = parseLimit(searchParams.get("limit"))
  const offset = parseCursor(searchParams.get("cursor"))

  const filters = [
    eq(opportunities.isActive, true),
    type ? eq(opportunities.type, type) : undefined,
    featured === "true"
      ? eq(opportunities.isFeatured, true)
      : featured === "false"
        ? eq(opportunities.isFeatured, false)
        : undefined,
    query
      ? or(
          ilike(opportunities.title, `%${query}%`),
          ilike(opportunities.summary, `%${query}%`),
          ilike(opportunities.type, `%${query}%`)
        )
      : undefined,
  ].filter(Boolean)

  const items = await db
    .select()
    .from(opportunities)
    .where(and(...filters))
    .orderBy(desc(opportunities.isFeatured), desc(opportunities.createdAt))
    .limit(limit)
    .offset(offset)

  return { items, nextCursor: encodeCursor(offset, items.length, limit) }
}

export async function getActiveOpportunity(slugOrId: string) {
  const item = (
    await db
      .select()
      .from(opportunities)
      .where(
        and(
          eq(opportunities.isActive, true),
          or(eq(opportunities.slug, slugOrId), eq(opportunities.id, slugOrId))
        )
      )
      .limit(1)
  )[0]

  if (!item) return undefined

  const attachments = await db
    .select()
    .from(opportunityAttachments)
    .where(eq(opportunityAttachments.opportunityId, item.id))
    .orderBy(asc(opportunityAttachments.order))

  return { ...item, attachments }
}

export async function getProgrammeSponsors(programmeIds: string[]) {
  if (programmeIds.length === 0) return []
  return db
    .select()
    .from(programmeSponsors)
    .where(inArray(programmeSponsors.programmeId, programmeIds))
    .orderBy(asc(programmeSponsors.order))
}
