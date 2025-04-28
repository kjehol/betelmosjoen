// api/shorts/index.js

export const config = {
  runtime: "edge",
};

import { Redis } from "@upstash/redis";
import axios from "axios";

const redis = Redis.fromEnv();

export default async function handler(request) {
  try {
    // Prøv cache
    const cached = await redis.get("shorts-ids");
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Hent fra YouTube API
    const allIds = [];
    let nextPageToken = null;

    do {
      const { data } = await axios.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        {
          params: {
            part: "contentDetails",
            maxResults: 50,
            playlistId: "PLVK1cH92NjJOzN1Ufj84wpZUVWysGLOQE",
            key: "AIzaSyALsDU-cXaIxAU52QtOO-A-muJboPt-CBo",
            pageToken: nextPageToken,
          },
        }
      );

      if (!data.items) {
        console.error("YouTube returnerte ingen items:", data);
        return new Response(
          JSON.stringify({ error: "Mangler items fra YouTube" }),
          { status: 500 }
        );
      }

      allIds.push(...data.items.map((i) => i.contentDetails.videoId));
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    // Cache i 1 time
    await redis.set("shorts-ids", allIds, { ex: 3600 });

    return new Response(JSON.stringify(allIds), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Feil i /api/shorts:", err);
    return new Response(
      JSON.stringify({ error: "Feil ved henting av shorts" }),
      { status: 500 }
    );
  }
}
