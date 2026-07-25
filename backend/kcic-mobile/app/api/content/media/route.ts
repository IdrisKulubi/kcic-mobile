import { contentError, contentJson, contentOptions } from "@/src/lib/content/http"
import { fetchChannelMedia } from "@/src/lib/youtube/fetch-channel-media"

export async function GET(request: Request) {
  try {
    const data = await fetchChannelMedia()
    return contentJson(request, data)
  } catch (error) {
    return contentError(request, error)
  }
}

export const OPTIONS = contentOptions
