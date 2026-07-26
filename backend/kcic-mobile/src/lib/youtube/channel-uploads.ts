import { classifyMediaKind } from "@/src/lib/youtube/rss"
import {
  buildThumbnailUrl,
  buildWatchUrl,
  trimSummary,
} from "@/src/lib/youtube/media-helpers"
import type { MediaItem } from "@/src/lib/youtube/types"

const INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false"
const MAX_UPLOADS = 200
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

const INNERTUBE_CLIENT = {
  clientName: "WEB",
  clientVersion: "2.20250318.01.00",
  hl: "en",
  gl: "US",
}

type InnertubeText = {
  runs?: { text?: string }[]
  simpleText?: string
  content?: string
}

type ParsedUpload = {
  videoId: string
  title: string
  description: string
  thumbnail?: string
}

function getUploadsPlaylistId(channelId: string) {
  if (channelId.startsWith("UC")) {
    return `UU${channelId.slice(2)}`
  }
  return channelId
}

function readText(value: InnertubeText | string | undefined | null) {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value.content === "string") return value.content
  if (value.simpleText) return value.simpleText
  return value.runs?.map((run) => run.text ?? "").join("") ?? ""
}

function readThumbnail(record: Record<string, unknown>) {
  const thumbnail = record.thumbnail as { thumbnails?: { url?: string }[] } | undefined
  const thumbnails = thumbnail?.thumbnails
  const last = thumbnails?.[thumbnails.length - 1]
  if (last?.url) return last.url

  const contentImage = record.contentImage as Record<string, unknown> | undefined
  const thumbnailViewModel = contentImage?.thumbnailViewModel as Record<string, unknown> | undefined
  const image = thumbnailViewModel?.image as { sources?: { url?: string }[] } | undefined
  const sources = image?.sources
  return sources?.[sources.length - 1]?.url
}

function parseLockupViewModel(lockup: Record<string, unknown>): ParsedUpload | null {
  const videoId = typeof lockup.contentId === "string" ? lockup.contentId : ""
  if (!videoId || videoId.length !== 11) return null

  const metadata = (lockup.metadata as Record<string, unknown> | undefined)
    ?.lockupMetadataViewModel as Record<string, unknown> | undefined
  if (!metadata) return null

  const title = readText(metadata.title as InnertubeText)
  if (!title) return null

  return {
    videoId,
    title,
    description: title,
    thumbnail: readThumbnail(lockup),
  }
}

function parseLegacyRenderer(renderer: Record<string, unknown>): ParsedUpload | null {
  const videoId = typeof renderer.videoId === "string" ? renderer.videoId : ""
  if (!videoId) return null

  const title = readText(renderer.title as InnertubeText)
  if (!title) return null

  return {
    videoId,
    title,
    description: readText(renderer.descriptionSnippet as InnertubeText) || title,
    thumbnail: readThumbnail(renderer),
  }
}

function collectPlaylistVideos(
  node: unknown,
  uploads: ParsedUpload[],
  continuations: string[],
  seenVideoIds: Set<string>
) {
  if (!node || typeof node !== "object") return

  const record = node as Record<string, unknown>

  if (record.lockupViewModel) {
    const parsed = parseLockupViewModel(record.lockupViewModel as Record<string, unknown>)
    if (parsed && !seenVideoIds.has(parsed.videoId)) {
      seenVideoIds.add(parsed.videoId)
      uploads.push(parsed)
    }
  }

  for (const rendererKey of [
    "playlistVideoRenderer",
    "gridVideoRenderer",
    "videoRenderer",
  ] as const) {
    if (record[rendererKey]) {
      const parsed = parseLegacyRenderer(record[rendererKey] as Record<string, unknown>)
      if (parsed && !seenVideoIds.has(parsed.videoId)) {
        seenVideoIds.add(parsed.videoId)
        uploads.push(parsed)
      }
    }
  }

  if (record.continuationItemRenderer) {
    const renderer = record.continuationItemRenderer as Record<string, unknown>
    const endpoint = renderer.continuationEndpoint as
      | {
          continuationCommand?: { token?: string }
        }
      | undefined
    const token = endpoint?.continuationCommand?.token
    if (token) continuations.push(token)
  }

  if (record.continuationEndpoint) {
    const endpoint = record.continuationEndpoint as {
      continuationCommand?: { token?: string }
    }
    const token = endpoint.continuationCommand?.token
    if (token) continuations.push(token)
  }

  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      for (const child of value) {
        collectPlaylistVideos(child, uploads, continuations, seenVideoIds)
      }
      continue
    }

    if (value && typeof value === "object") {
      collectPlaylistVideos(value, uploads, continuations, seenVideoIds)
    }
  }
}

async function innertubeBrowse(body: Record<string, unknown>) {
  const response = await fetch(INNERTUBE_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": USER_AGENT,
      "accept-language": "en-US,en;q=0.9",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Innertube browse failed with ${response.status}`)
  }

  return response.json()
}

function toMediaItem(entry: ParsedUpload): MediaItem {
  const watchUrl = buildWatchUrl(entry.videoId)
  const description = entry.description || entry.title

  return {
    id: entry.videoId,
    title: entry.title,
    summary: trimSummary(description),
    thumbnail: buildThumbnailUrl(entry.videoId, entry.thumbnail),
    publishedAt: new Date().toISOString(),
    duration: "",
    youtubeUrl: watchUrl,
    kind: classifyMediaKind(entry.title, description, watchUrl),
  }
}

export async function fetchAllChannelUploads(channelId: string): Promise<MediaItem[]> {
  const playlistId = getUploadsPlaylistId(channelId)
  const browseId = `VL${playlistId}`
  const items: MediaItem[] = []
  const seenVideoIds = new Set<string>()

  let data = await innertubeBrowse({
    context: { client: INNERTUBE_CLIENT },
    browseId,
  })

  while (items.length < MAX_UPLOADS) {
    const uploads: ParsedUpload[] = []
    const continuations: string[] = []
    collectPlaylistVideos(data, uploads, continuations, new Set())

    for (const upload of uploads) {
      if (seenVideoIds.has(upload.videoId)) continue
      seenVideoIds.add(upload.videoId)
      items.push(toMediaItem(upload))
      if (items.length >= MAX_UPLOADS) break
    }

    const continuation = continuations[0]
    if (!continuation || items.length >= MAX_UPLOADS) break

    data = await innertubeBrowse({
      context: { client: INNERTUBE_CLIENT },
      continuation,
    })
  }

  return items
}
