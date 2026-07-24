import { contentError, contentJson, contentOptions } from "@/src/lib/content/http"
import { listActiveOpportunities } from "@/src/lib/content/queries"

export async function GET(request: Request) {
  try {
    const data = await listActiveOpportunities(new URL(request.url).searchParams)
    return contentJson(request, data)
  } catch (error) {
    return contentError(request, error)
  }
}

export const OPTIONS = contentOptions
