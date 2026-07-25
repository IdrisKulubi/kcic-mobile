const ALLOWED_PREFIXES = [
  "article:",
  "podcast:",
  "story:",
  "event:",
  "resource:",
] as const

const MAX_ITEM_KEY_LENGTH = 200

export function isValidItemKey(value: unknown): value is string {
  if (typeof value !== "string") return false

  const key = value.trim()
  if (!key || key.length > MAX_ITEM_KEY_LENGTH) return false

  return ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix))
}

export function normalizeItemKey(value: string) {
  return value.trim()
}
