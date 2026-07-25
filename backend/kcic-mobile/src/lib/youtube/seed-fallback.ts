import type { MediaListResponse } from "@/src/lib/youtube/types"

const SEED_ITEMS = [
  {
    id: "SntfM3fml8E",
    title: "KCIC Podcast Episode 1",
    summary:
      "A focused conversation from the KCIC ecosystem on climate innovation, enterprise growth, and practical lessons for founders.",
    thumbnail: "https://img.youtube.com/vi/SntfM3fml8E/hqdefault.jpg",
    publishedAt: "2024-10-01T00:00:00.000Z",
    duration: "Watch now",
    youtubeUrl: "https://www.youtube.com/watch?v=SntfM3fml8E",
    kind: "podcast" as const,
  },
  {
    id: "d5jJq3LN1tc",
    title: "KCIC Podcast Episode 2",
    summary:
      "Insights for entrepreneurs building resilient climate ventures and navigating the support ecosystem.",
    thumbnail: "https://img.youtube.com/vi/d5jJq3LN1tc/hqdefault.jpg",
    publishedAt: "2024-10-08T00:00:00.000Z",
    duration: "Long-form",
    youtubeUrl: "https://www.youtube.com/watch?v=d5jJq3LN1tc",
    kind: "podcast" as const,
  },
  {
    id: "j-QZj3h8yt0",
    title: "KCIC Podcast Episode 3",
    summary:
      "A discussion on climate finance, policy signals, and the opportunities opening for early-stage innovators.",
    thumbnail: "https://img.youtube.com/vi/j-QZj3h8yt0/hqdefault.jpg",
    publishedAt: "2024-10-15T00:00:00.000Z",
    duration: "Watch now",
    youtubeUrl: "https://www.youtube.com/watch?v=j-QZj3h8yt0",
    kind: "podcast" as const,
  },
  {
    id: "67g_BWUEeBI",
    title: "KCIC Climate Innovation Spotlight",
    summary:
      "Stories from climate founders translating technical ideas into sustainable businesses with measurable local impact.",
    thumbnail: "https://img.youtube.com/vi/67g_BWUEeBI/hqdefault.jpg",
    publishedAt: "2024-10-22T00:00:00.000Z",
    duration: "Watch now",
    youtubeUrl: "https://www.youtube.com/watch?v=67g_BWUEeBI",
    kind: "video" as const,
  },
  {
    id: "IjAAAQ03XvA",
    title: "KCIC Ecosystem Update",
    summary:
      "Practical reflections on scaling climate solutions across agriculture, energy, water, and circular economy sectors.",
    thumbnail: "https://img.youtube.com/vi/IjAAAQ03XvA/hqdefault.jpg",
    publishedAt: "2024-10-29T00:00:00.000Z",
    duration: "Watch now",
    youtubeUrl: "https://www.youtube.com/watch?v=IjAAAQ03XvA",
    kind: "video" as const,
  },
]

export function getSeedMedia(): MediaListResponse {
  const podcasts = SEED_ITEMS.filter((item) => item.kind === "podcast")
  const videos = SEED_ITEMS.filter((item) => item.kind === "video")
  return { podcasts, videos, source: "fallback" }
}
