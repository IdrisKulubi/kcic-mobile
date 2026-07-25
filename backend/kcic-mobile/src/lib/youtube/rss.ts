import type { MediaItem, MediaItemKind } from "@/src/lib/youtube/types"

const DEFAULT_CHANNEL_ID = "UC09nlou3Nry68ZlGOGqL_7w"
const DEFAULT_CHANNEL_HANDLE = "KenyaClimateInnovationCenter"
const MAX_RESULTS = 50

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function extractTag(block: string, tag: string) {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i")
  const match = pattern.exec(block)
  return match?.[1]?.trim() ?? ""
}

function extractMediaTag(block: string, tag: string) {
  const pattern = new RegExp(`<media:${tag}[^>]*>([\\s\\S]*?)</media:${tag}>`, "i")
  const match = pattern.exec(block)
  return match?.[1]?.trim() ?? ""
}

function extractThumbnailUrl(block: string, videoId: string) {
  const pattern = /<media:thumbnail[^>]*url="([^"]+)"/i
  const match = pattern.exec(block)
  return match?.[1] ?? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

function extractAlternateLink(entryBlock: string, videoId: string) {
  const pattern = /<link rel="alternate" href="([^"]+)"/i
  const match = pattern.exec(entryBlock)
  return match?.[1] ?? `https://www.youtube.com/watch?v=${videoId}`
}

function isPodcastItem(title: string, description: string, watchUrl: string) {
  const haystack = `${title} ${description}`.toLowerCase()
  const normalizedTitle = title.toLowerCase()

  const videoOnlyPatterns = [
    /\bsuccess stor(?:y|ies)\b/,
    /\bhighlights?\s+from\b/,
    /\b(?:event|programme|program)\s+highlights?\b/,
    /\b(?:official\s+)?launch\b/,
    /\bsummit\b/,
    /\bbootcamp\b/,
    /\bcompetition\b/,
    /\binvestment\s+summit\b/,
    /\bforum\b/,
    /\bexpo\b/,
    /\bworkshop\b/,
    /\bdemo\s+day\b/,
    /\bpitch\s+day\b/,
    /\bspotlight\b/,
    /\becosystem\s+update\b/,
  ]

  if (
    videoOnlyPatterns.some(
      (pattern) => pattern.test(haystack) || pattern.test(normalizedTitle)
    )
  ) {
    return false
  }

  const podcastPatterns = [
    /\bpodcasts?\b/,
    /#podcast\b/,
    /sustainably\s*speaking/,
    /\bapple\s+podcasts?\b/,
    /\bspotify\b/,
    /\blisten on\b/,
    /\bwatch on youtube\b.+\blisten on\b/,
    /\btune in to\b.+\bepisode\b/,
    /\bthis episode\b/,
    /\bin this episode\b/,
    /\blatest episode\b/,
    /\bepisode of the\b/,
    /\bconversation with\b/,
    /\bsit down with\b/,
    /\bwe sat down with\b/,
    /\binterview\b/,
  ]

  if (podcastPatterns.some((pattern) => pattern.test(haystack))) {
    return true
  }

  const isInterviewTitle = /^.+ \| [^|]+$/.test(title.trim())
  const isShort = watchUrl.includes("/shorts/")

  if (isInterviewTitle && !isShort) {
    return true
  }

  if (isShort && /\bepisode\b/.test(haystack)) {
    return true
  }

  return false
}

function classifyMediaKind(title: string, description: string, watchUrl: string): MediaItemKind {
  return isPodcastItem(title, description, watchUrl) ? "podcast" : "video"
}

function trimSummary(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim()
  if (normalized.length <= 220) return normalized
  return `${normalized.slice(0, 217)}...`
}

export function parseYouTubeRssFeed(xml: string): MediaItem[] {
  const entries = xml.split("<entry>").slice(1)

  return entries
    .map((entryBlock) => {
      const videoId = extractTag(entryBlock, "yt:videoId")
      const title = decodeXml(extractTag(entryBlock, "title"))
      if (!videoId || !title) return null

      const description = decodeXml(
        extractMediaTag(entryBlock, "description") || extractTag(entryBlock, "summary")
      )
      const publishedAt = extractTag(entryBlock, "published") || new Date().toISOString()
      const thumbnail = extractThumbnailUrl(entryBlock, videoId)
      const watchUrl = extractAlternateLink(entryBlock, videoId)

      return {
        id: videoId,
        title,
        summary: trimSummary(description),
        thumbnail,
        publishedAt,
        duration: "",
        youtubeUrl: watchUrl.includes("/shorts/")
          ? `https://www.youtube.com/watch?v=${videoId}`
          : watchUrl,
        kind: classifyMediaKind(title, description, watchUrl),
      } satisfies MediaItem
    })
    .filter((item): item is MediaItem => item !== null)
    .slice(0, MAX_RESULTS)
}

export async function resolveChannelId() {
  const configuredId = process.env.YOUTUBE_CHANNEL_ID?.trim()
  if (configuredId) return configuredId

  const handle = process.env.YOUTUBE_CHANNEL_HANDLE?.trim() || DEFAULT_CHANNEL_HANDLE

  try {
    const response = await fetch(`https://www.youtube.com/@${encodeURIComponent(handle)}`, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; KCICMobile/1.0; +https://kenyacic.org)",
      },
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!response.ok) {
      return DEFAULT_CHANNEL_ID
    }

    const html = await response.text()
    const channelIdMatch =
      /"channelId":"(UC[^"]+)"/.exec(html) ??
      /"externalId":"(UC[^"]+)"/.exec(html) ??
      /channel_id=(UC[\w-]+)/.exec(html)

    return channelIdMatch?.[1] ?? DEFAULT_CHANNEL_ID
  } catch {
    return DEFAULT_CHANNEL_ID
  }
}

export async function fetchYouTubeRssFeed(channelId: string) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; KCICMobile/1.0; +https://kenyacic.org)",
    },
    next: { revalidate: 60 * 15 },
  })

  if (!response.ok) {
    throw new Error(`YouTube RSS ${response.status}`)
  }

  const xml = await response.text()
  return parseYouTubeRssFeed(xml)
}
