import { contentError, contentJson, contentOptions } from "@/src/lib/content/http"
import { listActiveProgrammes } from "@/src/lib/content/queries"

export async function GET(request: Request) {
  try {
    const data = await listActiveProgrammes(new URL(request.url).searchParams)
    return contentJson(request, data)
  } catch (error) {
    return contentError(request, error)
  }
}

export const OPTIONS = contentOptions
