// /pages/api/shorts.js
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const cached = await redis.get("shorts-list");
    if (cached) return res.status(200).json(cached);

    const videos = [];
    let pageToken = "";

    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("playlistId", "PLVK1cH92NjJOzN1Ufj84wpZUVWysGLOQE"); // din liste
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("key", "AIzaSyALsDU-cXaIxAU52QtOO-A-muJboPt-CBo"); // din nøkkel
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const r = await fetch(url.toString());
      const data = await r.json();

      if (!data.items) throw new Error("Ingen videoer funnet");

      videos.push(
        ...data.items.map((i) => ({
          id: i.snippet.resourceId.videoId,
          title: i.snippet.title,
        }))
      );

      pageToken = data.nextPageToken || "";
    } while (pageToken);

    await redis.set("shorts-list", videos, { ex: 3600 }); // cache 1 time
    res.status(200).json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kunne ikke hente Shorts" });
  }
}
