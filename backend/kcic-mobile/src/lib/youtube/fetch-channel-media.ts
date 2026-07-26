import { getSeedMedia } from "@/src/lib/youtube/seed-fallback"
import { fetchAllChannelUploads } from "@/src/lib/youtube/channel-uploads"
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
    let items

    try {
      items = await fetchAllChannelUploads(channelId)
    } catch (error) {
      console.warn(
        "[MEDIA API] Full YouTube channel fetch failed, using recent RSS feed",
        error
      )
      items = await fetchYouTubeRssFeed(channelId)
    }

    if (items.length === 0) {
      console.warn("[MEDIA API] YouTube returned no items, using seed fallback")
      return getSeedMedia()
    }

    const podcasts = items.filter((item) => item.kind === "podcast")
    const videos = items.filter((item) => item.kind !== "podcast")
    const data: MediaListResponse = { podcasts, videos, source: "youtube" }

    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[MEDIA API] Loaded ${items.length} uploads (${podcasts.length} podcasts, ${videos.length} videos)`
      )
    }

    cache = { expiresAt: Date.now() + CACHE_TTL_MS, data }
    return data
  } catch (error) {
    console.error("[MEDIA API] YouTube media fetch failed, using seed fallback", error)
    return getSeedMedia()
  }
}
