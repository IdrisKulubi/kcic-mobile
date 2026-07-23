import fs from "node:fs"
import path from "node:path"

let cachedLogoDataUri: string | null = null

export function getLogoDataUri() {
  if (cachedLogoDataUri) return cachedLogoDataUri

  const candidates = [
    path.join(process.cwd(), "public", "static", "kcic-logo.png"),
    path.join(process.cwd(), "..", "..", "assets", "images", "kcic-logo.png"),
  ]

  for (const logoPath of candidates) {
    if (!fs.existsSync(logoPath)) continue
    const buffer = fs.readFileSync(logoPath)
    cachedLogoDataUri = `data:image/png;base64,${buffer.toString("base64")}`
    return cachedLogoDataUri
  }

  return ""
}
