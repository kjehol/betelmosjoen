import { Redis } from "@upstash/redis";
import axios from "axios";

const redisShorts = Redis.fromEnv();

export async function GET() {
  try {
    const cached = await redisShorts.get("shorts-ids");
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const allIds = [];
    let nextPageToken = null;

    do {
      const { data } = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems", {
        params: {
          part: "contentDetails",
          maxResults: 50,
          playlistId: "PLVK1cH92NjJOzN1Ufj84wpZUVWysGLOQE",
          key: "AIzaSyALsDU-cXaIxAU52QtOO-A-muJboPt-CBo",
          pageToken: nextPageToken,
        },
      });

      if (!data.items) {
        console.error("Ingen items fra YouTube API:", data);
        return new Response(JSON.stringify({ error: "Mangler items fra YouTube" }), { status: 500 });
      }

      const ids = data.items.map((item) => item.contentDetails.videoId);
      allIds.push(...ids);
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    await redisShorts.set("shorts-ids", allIds, { ex: 3600 });

    return new Response(JSON.stringify(allIds), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Feil i /api/shorts:", JSON.stringify(err, null, 2));
    return new Response(JSON.stringify({ error: "Feil ved henting av shorts" }), { status: 500 });
  }
}
