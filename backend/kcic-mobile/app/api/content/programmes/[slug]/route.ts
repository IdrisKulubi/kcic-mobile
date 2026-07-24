import { contentError, contentJson, contentOptions } from "@/src/lib/content/http"
import { getActiveProgramme } from "@/src/lib/content/queries"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const item = await getActiveProgramme(slug)
    return item
      ? contentJson(request, { item })
      : contentJson(request, { code: "NOT_FOUND" }, { status: 404 })
  } catch (error) {
    return contentError(request, error)
  }
}

export const OPTIONS = contentOptions
