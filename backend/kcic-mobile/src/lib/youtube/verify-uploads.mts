import { fetchAllChannelUploads } from "./channel-uploads"
import { resolveChannelId } from "./rss"

async function main() {
  const channelId = await resolveChannelId()
  const items = await fetchAllChannelUploads(channelId)
  const podcasts = items.filter((item) => item.kind === "podcast")
  const videos = items.filter((item) => item.kind === "video")

  console.log(
    JSON.stringify(
      {
        channelId,
        total: items.length,
        podcasts: podcasts.length,
        videos: videos.length,
        podcastTitles: podcasts.slice(0, 8).map((item) => item.title),
        videoTitles: videos.slice(0, 8).map((item) => item.title),
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
