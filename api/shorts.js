import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(); 
  }

  try {
    // 1) Sjekk cache
    const cached = await redis.get("shorts-ids");
    if (cached) {
      return res.status(200).json(cached);
    }

    // 2) Hent fra YouTube med innebygd fetch (Node 18+)
    const allIds = [];
    let pageToken = "";
    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      url.searchParams.set("part", "contentDetails");
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("playlistId", "PLVK1cH92NjJOzN1Ufj84wpZUVWysGLOQE");
      url.searchParams.set("key", "AIzaSyALsDU-cXaIxAU52QtOO-A-muJboPt-CBo");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const r = await fetch(url.toString());
      if (!r.ok) throw new Error(`YouTube API feilet: ${r.status}`);
      const data = await r.json();
      if (!data.items) throw new Error("Mangler items fra YouTube");

      allIds.push(...data.items.map((i) => i.contentDetails.videoId));
      pageToken = data.nextPageToken || "";
    } while (pageToken);

    // 3) Cache og returner
    await redis.set("shorts-ids", allIds, { ex: 3600 });
    return res.status(200).json(allIds);

  } catch (err) {
    console.error("Shorts API feilet:", err);
    return res.status(500).json({ error: err.message });
  }
}
