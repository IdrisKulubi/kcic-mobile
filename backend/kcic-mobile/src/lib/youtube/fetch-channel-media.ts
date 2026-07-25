import { getSeedMedia } from "@/src/lib/youtube/seed-fallback"
import { fetchYouTubeRssFeed, resolveChannelId } from "@/src/lib/youtube/rss"
import type { MediaListResponse } from "@/src/lib/youtube/types"

const CACHE_TTL_MS = 15 * 60 * 1000

let cache: { expiresAt: number; data: MediaListResponse } | null = null

export async function fetchChannelMedia(): Promise<MediaListResponse> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data
  }

  try {
    const channelId = await resolveChannelId()
    const items = await fetchYouTubeRssFeed(channelId)

    if (items.length === 0) {
      console.warn("[MEDIA API] YouTube RSS returned no items, using seed fallback")
      return getSeedMedia()
    }

    const podcasts = items.filter((item) => item.kind === "podcast")
    const videos = items.filter((item) => item.kind !== "podcast")
    const data: MediaListResponse = { podcasts, videos, source: "youtube" }

    cache = { expiresAt: Date.now() + CACHE_TTL_MS, data }
    return data
  } catch (error) {
    console.error("[MEDIA API] YouTube RSS fetch failed, using seed fallback", error)
    return getSeedMedia()
  }
}
