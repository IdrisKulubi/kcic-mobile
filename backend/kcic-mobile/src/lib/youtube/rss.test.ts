import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { classifyMediaKind, isPodcastItem } from "./rss"

const watchUrl = "https://www.youtube.com/watch?v=example"

describe("isPodcastItem", () => {
  it("classifies KCIC Podcast episodes as podcasts", () => {
    assert.equal(
      isPodcastItem("KCIC Podcast Episode 3", "A discussion on climate finance.", watchUrl),
      true
    )
  })

  it("classifies Sustainably Speaking as podcasts", () => {
    assert.equal(
      isPodcastItem(
        "Sustainably Speaking: Climate Innovation",
        "Listen on Spotify for the full episode.",
        watchUrl
      ),
      true
    )
  })

  it("keeps podcast episodes even when description mentions forum", () => {
    assert.equal(
      isPodcastItem(
        "KCIC Podcast Episode 7",
        "We discuss the circular economy forum and enterprise support.",
        watchUrl
      ),
      true
    )
  })

  it("classifies general channel videos as videos", () => {
    assert.equal(
      isPodcastItem(
        "KCIC Enterprise Support and Climate Innovation",
        "A general KCIC channel video on enterprise development.",
        watchUrl
      ),
      false
    )
  })

  it("classifies event-style uploads as videos", () => {
    assert.equal(
      isPodcastItem(
        "Green Financing Strategies for Startups",
        "Event highlights from the KCIC summit launch.",
        watchUrl
      ),
      false
    )
  })
})

describe("classifyMediaKind", () => {
  it("returns podcast for podcast titles", () => {
    assert.equal(
      classifyMediaKind("KCIC Podcast Episode 1", "Episode notes", watchUrl),
      "podcast"
    )
  })

  it("returns video for general uploads", () => {
    assert.equal(
      classifyMediaKind("KCIC Digital Learning Management System", "Training video", watchUrl),
      "video"
    )
  })
})
