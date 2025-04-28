import { Redis } from "@upstash/redis";
import axios from "axios";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    // Prøv å hente fra cache først
    const cached = await redis.get("shorts-ids");
    if (cached) {
      return res.status(200).json(cached);
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
        console.error("Mangler items fra YouTube API:", data);
        return res.status(500).json({ error: "Feil: Mangler items i svar fra YouTube" });
      }

      const ids = data.items.map((item) => item.contentDetails.videoId);
      allIds.push(...ids);
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    await redis.set("shorts-ids", allIds, { ex: 3600 }); // Cache i 1 time

    return res.status(200).json(allIds);
  } catch (err) {
    console.error("Feil i /api/shorts:", JSON.stringify(err, null, 2));
    return res.status(500).json({ error: "Feil ved henting av shorts" });
  }
}
