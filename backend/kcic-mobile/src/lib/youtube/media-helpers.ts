export function trimSummary(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim()
  if (normalized.length <= 220) return normalized
  return `${normalized.slice(0, 217)}...`
}

export function buildThumbnailUrl(videoId: string, candidate?: string) {
  return candidate?.trim() || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function buildWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`
}
