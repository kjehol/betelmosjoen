// api/shorts.js
export const config = { runtime: "edge" };

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(request) {
  try {
    // 1) Prøv cache
    const cached = await redis.get("shorts-ids");
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2) Hent fra YouTube med fetch
    const allIds = [];
    let pageToken = "";
    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      url.searchParams.set("part", "contentDetails");
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("playlistId", "PLVK1cH92NjJOzN1Ufj84wpZUVWysGLOQE");
      url.searchParams.set("key", "AIzaSyALsDU-cXaIxAU52QtOO-A-muJboPt-CBo");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`YouTube API feilet: ${res.status}`);
      const data = await res.json();
      if (!data.items) throw new Error("Mangler items fra YouTube");

      allIds.push(...data.items.map((i) => i.contentDetails.videoId));
      pageToken = data.nextPageToken || "";
    } while (pageToken);

    // 3) Cache og return
    await redis.set("shorts-ids", allIds, { ex: 3600 });
    return new Response(JSON.stringify(allIds), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Shorts API feilet:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
